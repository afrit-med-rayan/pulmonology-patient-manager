/**
 * End-to-End Tests for Patient Management System
 * Tests complete user scenarios from start to finish
 */

class EndToEndTestSuite {
    constructor() {
        this.testResults = { passed: 0, failed: 0, total: 0 };
    }

    /**
     * Run all end-to-end tests
     */
    async runAllEndToEndTests() {
        console.log('🎯 Running End-to-End Tests...');
        console.log('='.repeat(50));

        const tests = [
            () => this.testCompletePatientLifecycle(),
            () => this.testDoctorDailyWorkflow(),
            () => this.testPatientFollowUpScenario(),
            () => this.testMultipleSessionsScenario(),
            () => this.testDataRecoveryScenario(),
            () => this.testApplicationRestartScenario()
        ];

        for (const test of tests) {
            try {
                await test();
                this.testResults.passed++;
                console.log('✅ End-to-end test passed');
            } catch (error) {
                console.error(`❌ End-to-end test failed: ${error.message}`);
                this.testResults.failed++;
            }
            this.testResults.total++;
        }

        this.printResults();
        return this.testResults.failed === 0;
    }

    /**
     * Test complete patient lifecycle from creation to deletion
     */
    async testCompletePatientLifecycle() {
        console.log('Testing Complete Patient Lifecycle...');

        // Initialize application components
        const authManager = new AuthenticationManager();
        const dataStorage = new DataStorageManager();
        await dataStorage.initializeStorage();

        const patientManager = new PatientManager();
        await patientManager.initialize(dataStorage);

        const formManager = new FormManager();
        const changeTracker = new ChangeTracker();
        const router = new UIRouter();

        // Step 1: Doctor logs in
        const loginResult = await authManager.login('dr.sahboub', 'pneumo2024');
        this.assert(loginResult, 'Doctor should be able to log in');
        this.assert(authManager.isAuthenticated(), 'Doctor should be authenticated');

        // Step 2: Navigate to create patient form
        router.navigateTo('/create');
        this.assert(router.getCurrentRoute() === '/create', 'Should navigate to create form');

        // Step 3: Fill out patient form
        const patientFormData = {
            firstName: 'Henry',
            lastName: 'Davis',
            dateOfBirth: '1979-06-18',
            placeOfResidence: 'Nashville',
            gender: 'male'
        };

        // Track form changes
        Object.keys(patientFormData).forEach(field => {
            changeTracker.trackChange('patient-form', field, '', patientFormData[field]);
        });

        this.assert(changeTracker.hasUnsavedChanges(), 'Should track form changes');

        // Step 4: Validate and submit form
        const validation = formManager.validateForm(patientFormData, 'patient');
        this.assert(validation.isValid, 'Patient form should be valid');

        const createResult = await patientManager.createPatient(patientFormData);
        this.assert(createResult.success, 'Patient should be created successfully');

        const patientId = createResult.patientId;

        // Clear form changes after successful save
        changeTracker.clearChanges('patient-form');
        this.assert(!changeTracker.hasUnsavedChanges(), 'Form changes should be cleared');

        // Step 5: Navigate to patient list and search
        router.navigateTo('/patients');
        this.assert(router.getCurrentRoute() === '/patients', 'Should navigate to patients list');

        const searchResults = await patientManager.searchPatients('Henry');
        this.assert(searchResults.length > 0, 'Should find created patient in search');
        this.assert(searchResults[0].firstName === 'Henry', 'Search result should be correct');

        // Step 6: View patient details
        router.navigateTo(`/patient/${patientId}`);
        this.assert(router.getCurrentRoute() === `/patient/${patientId}`, 'Should navigate to patient detail');

        const patientDetails = await patientManager.getPatient(patientId);
        this.assert(patientDetails !== null, 'Should load patient details');
        this.assert(patientDetails.firstName === 'Henry', 'Patient details should be correct');

        // Step 7: Add a visit
        router.navigateTo(`/edit/${patientId}`);
        this.assert(router.getCurrentRoute() === `/edit/${patientId}`, 'Should navigate to edit form');

        const visitData = {
            visitDate: '2024-01-25',
            medications: 'Bronchodilator inhaler',
            observations: 'Patient shows significant improvement in breathing. No wheezing detected.',
            additionalComments: 'Recommend follow-up in 2 weeks. Patient education on inhaler technique provided.'
        };

        patientDetails.addVisit(visitData);

        // Track visit addition
        changeTracker.trackChange('patient-form', 'visits', [], patientDetails.visits);
        this.assert(changeTracker.hasUnsavedChanges(), 'Should track visit addition');

        // Step 8: Save visit
        const updateResult = await patientManager.updatePatient(patientId, patientDetails.toJSON());
        this.assert(updateResult.success, 'Should save visit successfully');

        changeTracker.clearChanges('patient-form');

        // Step 9: Verify visit was saved
        const updatedPatient = await patientManager.getPatient(patientId);
        this.assert(updatedPatient.visits.length === 1, 'Patient should have one visit');
        this.assert(updatedPatient.visits[0].medications === 'Bronchodilator inhaler', 'Visit data should be correct');

        // Step 10: Add second visit (follow-up)
        const followUpVisit = {
            visitDate: '2024-02-08',
            medications: 'Continue bronchodilator, add corticosteroid',
            observations: 'Continued improvement. Patient reports better sleep and exercise tolerance.',
            additionalComments: 'Excellent progress. Next follow-up in 1 month.'
        };

        updatedPatient.addVisit(followUpVisit);

        const secondUpdateResult = await patientManager.updatePatient(patientId, updatedPatient.toJSON());
        this.assert(secondUpdateResult.success, 'Should save second visit');

        // Step 11: Verify patient has multiple visits
        const patientWithVisits = await patientManager.getPatient(patientId);
        this.assert(patientWithVisits.visits.length === 2, 'Patient should have two visits');

        const sortedVisits = patientWithVisits.getVisitsSortedByDate();
        this.assert(sortedVisits[0].visitDate === '2024-02-08', 'Latest visit should be first');
        this.assert(sortedVisits[1].visitDate === '2024-01-25', 'Earlier visit should be second');

        // Step 12: Test patient modification
        router.navigateTo(`/edit/${patientId}`);

        const modificationData = {
            placeOfResidence: 'Memphis', // Patient moved
            visits: patientWithVisits.visits // Keep existing visits
        };

        changeTracker.trackChange('patient-form', 'placeOfResidence', 'Nashville', 'Memphis');

        const modifyResult = await patientManager.updatePatient(patientId, modificationData);
        this.assert(modifyResult.success, 'Should modify patient successfully');

        const modifiedPatient = await patientManager.getPatient(patientId);
        this.assert(modifiedPatient.placeOfResidence === 'Memphis', 'Patient residence should be updated');
        this.assert(modifiedPatient.visits.length === 2, 'Visits should be preserved');

        // Step 13: Test search with updated data
        const memphisSearch = await patientManager.searchPatients('Memphis');
        this.assert(memphisSearch.length > 0, 'Should find patient by new residence');

        // Step 14: Generate patient statistics
        const stats = await patientManager.getPatientStatistics();
        this.assert(stats.totalPatients >= 1, 'Statistics should include our patient');
        this.assert(stats.genderDistribution.male >= 1, 'Should count male patients');

        // Step 15: Test logout with no unsaved changes
        this.assert(!changeTracker.hasUnsavedChanges(), 'Should have no unsaved changes');

        const safeToLogout = await authManager.checkUnsavedChanges();
        this.assert(safeToLogout, 'Should be safe to logout');

        authManager.logout();
        this.assert(!authManager.isAuthenticated(), 'Doctor should be logged out');

        // Step 16: Log back in and verify data persistence
        await authManager.login('dr.sahboub', 'pneumo2024');

        const persistedPatient = await patientManager.getPatient(patientId);
        this.assert(persistedPatient !== null, 'Patient should persist across sessions');
        this.assert(persistedPatient.placeOfResidence === 'Memphis', 'Patient modifications should persist');
        this.assert(persistedPatient.visits.length === 2, 'Patient visits should persist');

        // Step 17: Delete patient (end of lifecycle)
        router.navigateTo(`/patient/${patientId}`);

        const deleteResult = await patientManager.deletePatient(patientId);
        this.assert(deleteResult.success, 'Should delete patient successfully');

        // Step 18: Verify patient is completely removed
        const deletedPatient = await patientManager.getPatient(patientId);
        this.assert(deletedPatient === null, 'Patient should be completely removed');

        const searchAfterDelete = await patientManager.searchPatients('Henry');
        const foundDeleted = searchAfterDelete.find(p => p.id === patientId);
        this.assert(foundDeleted === undefined, 'Deleted patient should not appear in search');

        // Step 19: Final logout
        authManager.logout();
        this.assert(!authManager.isAuthenticated(), 'Should be logged out at end');
    }

    /**
     * Test typical doctor daily workflow
     */
    async testDoctorDailyWorkflow() {
        console.log('Testing Doctor Daily Workflow...');

        // Initialize components
        const authManager = new AuthenticationManager();
        const dataStorage = new DataStorageManager();
        await dataStorage.initializeStorage();

        const patientManager = new PatientManager();
        await patientManager.initialize(dataStorage);

        const router = new UIRouter();

        // Morning: Doctor arrives and logs in
        const loginResult = await authManager.login('dr.sahboub', 'pneumo2024');
        this.assert(loginResult, 'Doctor should log in successfully');

        // Create some existing patients for the workflow
        const existingPatients = [
            {
                firstName: 'Sarah',
                lastName: 'Johnson',
                dateOfBirth: '1975-03-15',
                placeOfResidence: 'Memphis',
                gender: 'female',
                visits: [{
                    visitDate: '2024-01-10',
                    medications: 'Albuterol',
                    observations: 'Mild asthma symptoms'
                }]
            },
            {
                firstName: 'Robert',
                lastName: 'Williams',
                dateOfBirth: '1968-11-22',
                placeOfResidence: 'Nashville',
                gender: 'male',
                visits: [{
                    visitDate: '2024-01-05',
                    medications: 'COPD medication',
                    observations: 'Stable condition'
                }]
            }
        ];

        const patientIds = [];
        for (const patientData of existingPatients) {
            const result = await patientManager.createPatient(patientData);
            this.assert(result.success, 'Should create existing patient');
            patientIds.push(result.patientId);
        }

        // First appointment: Follow-up with Sarah
        router.navigateTo('/patients');
        const sarahSearch = await patientManager.searchPatients('Sarah');
        this.assert(sarahSearch.length > 0, 'Should find Sarah');

        const sarahId = sarahSearch[0].id;
        router.navigateTo(`/patient/${sarahId}`);

        const sarah = await patientManager.getPatient(sarahId);
        this.assert(sarah !== null, 'Should load Sarah\'s record');

        // Add follow-up visit for Sarah
        sarah.addVisit({
            visitDate: '2024-01-25',
            medications: 'Continue Albuterol, add preventive inhaler',
            observations: 'Symptoms well controlled. Patient reports improved quality of life.',
            additionalComments: 'Excellent compliance with treatment. Next visit in 3 months.'
        });

        const sarahUpdate = await patientManager.updatePatient(sarahId, sarah.toJSON());
        this.assert(sarahUpdate.success, 'Should update Sarah\'s record');

        // Second appointment: Follow-up with Robert
        const robertSearch = await patientManager.searchPatients('Robert');
        this.assert(robertSearch.length > 0, 'Should find Robert');

        const robertId = robertSearch[0].id;
        const robert = await patientManager.getPatient(robertId);

        // Add follow-up visit for Robert
        robert.addVisit({
            visitDate: '2024-01-25',
            medications: 'Adjust COPD medication dosage',
            observations: 'Slight improvement in breathing tests. Patient tolerating medication well.',
            additionalComments: 'Continue current regimen. Pulmonary function test in 6 weeks.'
        });

        const robertUpdate = await patientManager.updatePatient(robertId, robert.toJSON());
        this.assert(robertUpdate.success, 'Should update Robert\'s record');

        // Third appointment: New patient
        router.navigateTo('/create');

        const newPatientData = {
            firstName: 'Maria',
            lastName: 'Garcia',
            dateOfBirth: '1992-07-08',
            placeOfResidence: 'Knoxville',
            gender: 'female'
        };

        const newPatientResult = await patientManager.createPatient(newPatientData);
        this.assert(newPatientResult.success, 'Should create new patient');

        const mariaId = newPatientResult.patientId;

        // Add initial visit for new patient
        const maria = await patientManager.getPatient(mariaId);
        maria.addVisit({
            visitDate: '2024-01-25',
            medications: 'Prescribed rescue inhaler',
            observations: 'New patient presenting with exercise-induced asthma. Spirometry shows mild obstruction.',
            additionalComments: 'Patient education provided. Return visit in 2 weeks to assess response to treatment.'
        });

        const mariaUpdate = await patientManager.updatePatient(mariaId, maria.toJSON());
        this.assert(mariaUpdate.success, 'Should add initial visit for Maria');

        // End of day: Review patient statistics
        const dailyStats = await patientManager.getPatientStatistics();
        this.assert(dailyStats.totalPatients >= 3, 'Should have at least 3 patients');

        // Check all patients seen today
        const allPatients = await patientManager.getAllPatients();
        const patientsSeenToday = allPatients.filter(patient => {
            return patient.visits.some(visit => visit.visitDate === '2024-01-25');
        });

        this.assert(patientsSeenToday.length >= 3, 'Should have seen 3 patients today');

        // End of day logout
        authManager.logout();
        this.assert(!authManager.isAuthenticated(), 'Doctor should log out at end of day');

        // Clean up
        for (const patientId of [...patientIds, mariaId]) {
            await patientManager.deletePatient(patientId);
        }
    }

    /**
     * Test patient follow-up scenario over multiple visits
     */
    async testPatientFollowUpScenario() {
        console.log('Testing Patient Follow-up Scenario...');

        const authManager = new AuthenticationManager();
        const dataStorage = new DataStorageManager();
        await dataStorage.initializeStorage();

        const patientManager = new PatientManager();
        await patientManager.initialize(dataStorage);

        // Login
        await authManager.login('dr.sahboub', 'pneumo2024');

        // Initial patient creation
        const initialPatientData = {
            firstName: 'Thomas',
            lastName: 'Anderson',
            dateOfBirth: '1965-09-13',
            placeOfResidence: 'Chattanooga',
            gender: 'male'
        };

        const createResult = await patientManager.createPatient(initialPatientData);
        this.assert(createResult.success, 'Should create patient for follow-up scenario');

        const patientId = createResult.patientId;

        // Visit 1: Initial diagnosis
        const patient = await patientManager.getPatient(patientId);
        patient.addVisit({
            visitDate: '2024-01-10',
            medications: 'Bronchodilator inhaler (Albuterol)',
            observations: 'Patient presents with chronic cough and shortness of breath. Spirometry shows moderate obstruction. Diagnosed with COPD.',
            additionalComments: 'Patient counseled on smoking cessation. Prescribed rescue inhaler. Follow-up in 2 weeks.'
        });

        await patientManager.updatePatient(patientId, patient.toJSON());

        // Visit 2: Follow-up (2 weeks later)
        const patient2 = await patientManager.getPatient(patientId);
        patient2.addVisit({
            visitDate: '2024-01-24',
            medications: 'Continue Albuterol, add long-acting bronchodilator (Tiotropium)',
            observations: 'Patient reports some improvement in symptoms. Still experiencing morning cough. Compliance with inhaler good.',
            additionalComments: 'Added long-acting bronchodilator. Patient education reinforced. Next visit in 4 weeks.'
        });

        await patientManager.updatePatient(patientId, patient2.toJSON());

        // Visit 3: Progress check (4 weeks later)
        const patient3 = await patientManager.getPatient(patientId);
        patient3.addVisit({
            visitDate: '2024-02-21',
            medications: 'Continue current regimen, add inhaled corticosteroid (Fluticasone)',
            observations: 'Significant improvement in symptoms. Patient reports better exercise tolerance. Spirometry shows mild improvement.',
            additionalComments: 'Added inhaled steroid for better control. Patient very satisfied with progress. Next visit in 8 weeks.'
        });

        await patientManager.updatePatient(patientId, patient3.toJSON());

        // Visit 4: Stable follow-up (8 weeks later)
        const patient4 = await patientManager.getPatient(patientId);
        patient4.addVisit({
            visitDate: '2024-04-17',
            medications: 'Continue triple therapy - stable regimen',
            observations: 'Patient doing very well. No exacerbations. Good inhaler technique. Spirometry stable.',
            additionalComments: 'Excellent disease control achieved. Continue current medications. Next routine visit in 6 months.'
        });

        await patientManager.updatePatient(patientId, patient4.toJSON());

        // Verify complete follow-up history
        const finalPatient = await patientManager.getPatient(patientId);
        this.assert(finalPatient.visits.length === 4, 'Patient should have 4 visits');

        // Verify visits are properly ordered
        const sortedVisits = finalPatient.getVisitsSortedByDate();
        this.assert(sortedVisits[0].visitDate === '2024-04-17', 'Latest visit should be first');
        this.assert(sortedVisits[3].visitDate === '2024-01-10', 'Earliest visit should be last');

        // Verify progression of treatment
        this.assert(sortedVisits[3].medications.includes('Albuterol'), 'Initial visit should have basic medication');
        this.assert(sortedVisits[2].medications.includes('Tiotropium'), 'Second visit should add long-acting bronchodilator');
        this.assert(sortedVisits[1].medications.includes('Fluticasone'), 'Third visit should add corticosteroid');
        this.assert(sortedVisits[0].medications.includes('triple therapy'), 'Final visit should reference complete regimen');

        // Verify patient improvement over time
        this.assert(sortedVisits[3].observations.includes('chronic cough'), 'Initial visit should note symptoms');
        this.assert(sortedVisits[1].observations.includes('Significant improvement'), 'Later visits should show improvement');
        this.assert(sortedVisits[0].observations.includes('doing very well'), 'Final visit should show good control');

        // Test getting latest visit
        const latestVisit = finalPatient.getLatestVisit();
        this.assert(latestVisit.visitDate === '2024-04-17', 'Latest visit should be correct');

        // Clean up
        await patientManager.deletePatient(patientId);
        authManager.logout();
    }

    /**
     * Test multiple sessions scenario (doctor logging in/out multiple times)
     */
    async testMultipleSessionsScenario() {
        console.log('Testing Multiple Sessions Scenario...');

        const dataStorage = new DataStorageManager();
        await dataStorage.initializeStorage();

        const patientManager = new PatientManager();
        await patientManager.initialize(dataStorage);

        // Session 1: Morning work
        const authManager1 = new AuthenticationManager();
        await authManager1.login('dr.sahboub', 'pneumo2024');

        // Create patient in first session
        const patient1Data = {
            firstName: 'Jennifer',
            lastName: 'Brown',
            dateOfBirth: '1983-04-12',
            placeOfResidence: 'Knoxville',
            gender: 'female'
        };

        const createResult1 = await patientManager.createPatient(patient1Data);
        this.assert(createResult1.success, 'Should create patient in first session');

        const patientId = createResult1.patientId;

        // Add visit in first session
        const patient = await patientManager.getPatient(patientId);
        patient.addVisit({
            visitDate: '2024-01-25',
            medications: 'Morning medication',
            observations: 'Morning visit observations'
        });

        await patientManager.updatePatient(patientId, patient.toJSON());

        // End first session
        authManager1.logout();
        this.assert(!authManager1.isAuthenticated(), 'Should be logged out from first session');

        // Session 2: Afternoon work (new authentication manager instance)
        const authManager2 = new AuthenticationManager();
        await authManager2.login('dr.sahboub', 'pneumo2024');

        // Verify patient data persists across sessions
        const persistedPatient = await patientManager.getPatient(patientId);
        this.assert(persistedPatient !== null, 'Patient should persist across sessions');
        this.assert(persistedPatient.firstName === 'Jennifer', 'Patient data should be correct');
        this.assert(persistedPatient.visits.length === 1, 'Patient visits should persist');

        // Add another visit in second session
        persistedPatient.addVisit({
            visitDate: '2024-01-25',
            medications: 'Afternoon medication adjustment',
            observations: 'Afternoon follow-up - patient responding well'
        });

        await patientManager.updatePatient(patientId, persistedPatient.toJSON());

        // Search should work across sessions
        const searchResults = await patientManager.searchPatients('Jennifer');
        this.assert(searchResults.length > 0, 'Search should work across sessions');

        // End second session
        authManager2.logout();

        // Session 3: Evening review (another new instance)
        const authManager3 = new AuthenticationManager();
        await authManager3.login('dr.sahboub', 'pneumo2024');

        // Verify all data persists
        const finalPatient = await patientManager.getPatient(patientId);
        this.assert(finalPatient !== null, 'Patient should persist through multiple sessions');
        this.assert(finalPatient.visits.length === 2, 'All visits should persist');

        // Verify statistics work across sessions
        const stats = await patientManager.getPatientStatistics();
        this.assert(stats.totalPatients >= 1, 'Statistics should work across sessions');

        // Test session timeout simulation
        const user = authManager3.getCurrentUser();
        this.assert(user !== null, 'Should have current user');

        // Simulate expired session
        const expiredSession = {
            ...authManager3.currentSession.toJSON(),
            loginTime: Date.now() - (25 * 60 * 60 * 1000), // 25 hours ago
            lastActivity: Date.now() - (3 * 60 * 60 * 1000) // 3 hours ago
        };

        this.assert(!authManager3.isSessionValid(expiredSession), 'Expired session should be invalid');

        // Clean up
        await patientManager.deletePatient(patientId);
        authManager3.logout();
    }

    /**
     * Test data recovery scenario
     */
    async testDataRecoveryScenario() {
        console.log('Testing Data Recovery Scenario...');

        const authManager = new AuthenticationManager();
        const dataStorage = new DataStorageManager();
        await dataStorage.initializeStorage();

        const patientManager = new PatientManager();
        await patientManager.initialize(dataStorage);

        await authManager.login('dr.sahboub', 'pneumo2024');

        // Create important patient data
        const criticalPatients = [
            {
                firstName: 'Emergency',
                lastName: 'Patient1',
                dateOfBirth: '1970-01-01',
                placeOfResidence: 'Memphis',
                gender: 'male',
                visits: [{
                    visitDate: '2024-01-20',
                    medications: 'Critical medication',
                    observations: 'Important medical history'
                }]
            },
            {
                firstName: 'Important',
                lastName: 'Patient2',
                dateOfBirth: '1980-05-15',
                placeOfResidence: 'Nashville',
                gender: 'female',
                visits: [{
                    visitDate: '2024-01-22',
                    medications: 'Long-term treatment',
                    observations: 'Chronic condition management'
                }]
            }
        ];

        const patientIds = [];
        for (const patientData of criticalPatients) {
            const result = await patientManager.createPatient(patientData);
            this.assert(result.success, 'Should create critical patient data');
            patientIds.push(result.patientId);
        }

        // Create backup before disaster
        const backupResult = await dataStorage.createBackup();
        this.assert(backupResult.success, 'Should create backup successfully');
        this.assert(backupResult.patientsCount >= 2, 'Backup should include all patients');

        const backupId = backupResult.backupId;

        // Simulate data loss disaster
        console.log('Simulating data loss...');
        await dataStorage.clearAllData();

        // Verify data is lost
        const lostPatient1 = await patientManager.getPatient(patientIds[0]);
        const lostPatient2 = await patientManager.getPatient(patientIds[1]);
        this.assert(lostPatient1 === null, 'Patient 1 should be lost');
        this.assert(lostPatient2 === null, 'Patient 2 should be lost');

        const emptyStats = await patientManager.getPatientStatistics();
        this.assert(emptyStats.totalPatients === 0, 'Should have no patients after data loss');

        // Perform data recovery
        console.log('Performing data recovery...');
        const recoveryResult = await dataStorage.restoreFromBackup(backupId);
        this.assert(recoveryResult.success, 'Data recovery should succeed');
        this.assert(recoveryResult.patientsRestored >= 2, 'Should restore all patients');

        // Verify data recovery
        const recoveredPatient1 = await patientManager.getPatient(patientIds[0]);
        const recoveredPatient2 = await patientManager.getPatient(patientIds[1]);

        this.assert(recoveredPatient1 !== null, 'Patient 1 should be recovered');
        this.assert(recoveredPatient1.firstName === 'Emergency', 'Patient 1 data should be correct');
        this.assert(recoveredPatient1.visits.length === 1, 'Patient 1 visits should be recovered');

        this.assert(recoveredPatient2 !== null, 'Patient 2 should be recovered');
        this.assert(recoveredPatient2.firstName === 'Important', 'Patient 2 data should be correct');
        this.assert(recoveredPatient2.visits.length === 1, 'Patient 2 visits should be recovered');

        // Verify search works after recovery
        const searchAfterRecovery = await patientManager.searchPatients('Emergency');
        this.assert(searchAfterRecovery.length > 0, 'Search should work after recovery');

        // Verify statistics are correct after recovery
        const recoveredStats = await patientManager.getPatientStatistics();
        this.assert(recoveredStats.totalPatients >= 2, 'Statistics should be correct after recovery');

        // Test that new data can be added after recovery
        const newPatientAfterRecovery = {
            firstName: 'Post',
            lastName: 'Recovery',
            dateOfBirth: '1990-01-01',
            placeOfResidence: 'Knoxville',
            gender: 'male'
        };

        const newPatientResult = await patientManager.createPatient(newPatientAfterRecovery);
        this.assert(newPatientResult.success, 'Should be able to add new patients after recovery');

        // Clean up
        for (const patientId of patientIds) {
            await patientManager.deletePatient(patientId);
        }
        await patientManager.deletePatient(newPatientResult.patientId);

        authManager.logout();
    }

    /**
     * Test application restart scenario
     */
    async testApplicationRestartScenario() {
        console.log('Testing Application Restart Scenario...');

        // Phase 1: Initial application use
        const authManager1 = new AuthenticationManager();
        const dataStorage1 = new DataStorageManager();
        await dataStorage1.initializeStorage();

        const patientManager1 = new PatientManager();
        await patientManager1.initialize(dataStorage1);

        await authManager1.login('dr.sahboub', 'pneumo2024');

        // Create patient data before "restart"
        const preRestartPatient = {
            firstName: 'Persistent',
            lastName: 'Data',
            dateOfBirth: '1975-12-31',
            placeOfResidence: 'Memphis',
            gender: 'female',
            visits: [{
                visitDate: '2024-01-20',
                medications: 'Pre-restart medication',
                observations: 'Data that should survive restart'
            }]
        };

        const createResult = await patientManager1.createPatient(preRestartPatient);
        this.assert(createResult.success, 'Should create patient before restart');

        const patientId = createResult.patientId;

        // Verify data exists
        const beforeRestart = await patientManager1.getPatient(patientId);
        this.assert(beforeRestart !== null, 'Patient should exist before restart');

        authManager1.logout();

        // Phase 2: Simulate application restart (new instances of all components)
        console.log('Simulating application restart...');

        const authManager2 = new AuthenticationManager();
        const dataStorage2 = new DataStorageManager();
        await dataStorage2.initializeStorage();

        const patientManager2 = new PatientManager();
        await patientManager2.initialize(dataStorage2);

        // Login after restart
        await authManager2.login('dr.sahboub', 'pneumo2024');

        // Verify data persists after restart
        const afterRestart = await patientManager2.getPatient(patientId);
        this.assert(afterRestart !== null, 'Patient should persist after restart');
        this.assert(afterRestart.firstName === 'Persistent', 'Patient data should be correct after restart');
        this.assert(afterRestart.visits.length === 1, 'Patient visits should persist after restart');
        this.assert(afterRestart.visits[0].medications === 'Pre-restart medication', 'Visit data should be correct');

        // Verify search works after restart
        const searchAfterRestart = await patientManager2.searchPatients('Persistent');
        this.assert(searchAfterRestart.length > 0, 'Search should work after restart');

        // Verify statistics work after restart
        const statsAfterRestart = await patientManager2.getPatientStatistics();
        this.assert(statsAfterRestart.totalPatients >= 1, 'Statistics should work after restart');

        // Add new data after restart to verify full functionality
        afterRestart.addVisit({
            visitDate: '2024-01-25',
            medications: 'Post-restart medication',
            observations: 'Visit added after application restart'
        });

        const updateAfterRestart = await patientManager2.updatePatient(patientId, afterRestart.toJSON());
        this.assert(updateAfterRestart.success, 'Should be able to update patient after restart');

        // Phase 3: Another restart to verify the new data persists
        console.log('Testing second restart...');

        authManager2.logout();

        const authManager3 = new AuthenticationManager();
        const dataStorage3 = new DataStorageManager();
        await dataStorage3.initializeStorage();

        const patientManager3 = new PatientManager();
        await patientManager3.initialize(dataStorage3);

        await authManager3.login('dr.sahboub', 'pneumo2024');

        // Verify all data persists through multiple restarts
        const afterSecondRestart = await patientManager3.getPatient(patientId);
        this.assert(afterSecondRestart !== null, 'Patient should persist after second restart');
        this.assert(afterSecondRestart.visits.length === 2, 'Both visits should persist');

        const visits = afterSecondRestart.getVisitsSortedByDate();
        this.assert(visits[0].medications === 'Post-restart medication', 'Latest visit should be correct');
        this.assert(visits[1].medications === 'Pre-restart medication', 'Original visit should be correct');

        // Test that all functionality works after multiple restarts
        const finalSearchTest = await patientManager3.searchPatients('Data');
        this.assert(finalSearchTest.length > 0, 'Search should work after multiple restarts');

        // Clean up
        await patientManager3.deletePatient(patientId);
        authManager3.logout();
    }

    /**
     * Assert helper function
     */
    assert(condition, message) {
        if (!condition) {
            throw new Error(`Assertion failed: ${message}`);
        }
    }

    /**
     * Print test results
     */
    printResults() {
        console.log('\n' + '='.repeat(50));
        console.log('📊 End-to-End Test Results:');
        console.log(`✅ Passed: ${this.testResults.passed}`);
        console.log(`❌ Failed: ${this.testResults.failed}`);
        console.log(`📈 Success Rate: ${((this.testResults.passed / this.testResults.total) * 100).toFixed(1)}%`);
        console.log('='.repeat(50));
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EndToEndTestSuite;
}