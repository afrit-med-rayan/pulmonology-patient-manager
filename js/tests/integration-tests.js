/**
 * Integration Tests for Patient Management System
 * Tests complete workflows and component interactions
 */

class IntegrationTestSuite {
    constructor() {
        this.testResults = { passed: 0, failed: 0, total: 0 };
    }

    /**
     * Run all integration tests
     */
    async runAllIntegrationTests() {
        console.log('🔗 Running Integration Tests...');
        console.log('='.repeat(50));

        const tests = [
            () => this.testPatientCreationWorkflow(),
            () => this.testPatientSearchWorkflow(),
            () => this.testPatientModificationWorkflow(),
            () => this.testPatientDeletionWorkflow(),
            () => this.testAuthenticationWorkflow(),
            () => this.testDataPersistenceWorkflow(),
            () => this.testFormValidationWorkflow(),
            () => this.testNavigationWorkflow(),
            () => this.testLogoutWithChangesWorkflow(),
            () => this.testMultiplePatientManagement(),
            () => this.testSessionManagement(),
            () => this.testBackupAndRestoreWorkflow()
        ];

        for (const test of tests) {
            try {
                await test();
                this.testResults.passed++;
                console.log('✅ Integration test passed');
            } catch (error) {
                console.error(`❌ Integration test failed: ${error.message}`);
                this.testResults.failed++;
            }
            this.testResults.total++;
        }

        this.printResults();
        return this.testResults.failed === 0;
    }

    /**
     * Test complete patient creation workflow
     */
    async testPatientCreationWorkflow() {
        console.log('Testing Patient Creation Workflow...');

        // Initialize all required components
        const dataStorage = new DataStorageManager();
        await dataStorage.initializeStorage();

        const patientManager = new PatientManager();
        await patientManager.initialize(dataStorage);

        const formManager = new FormManager();
        const changeTracker = new ChangeTracker();

        // Simulate user filling out form
        const formData = {
            firstName: 'Alice',
            lastName: 'Wilson',
            dateOfBirth: '1988-03-10',
            placeOfResidence: 'Seattle',
            gender: 'female',
            visits: [{
                visitDate: '2024-01-20',
                medications: 'Inhaler',
                observations: 'Breathing improved significantly',
                additionalComments: 'Patient reports better sleep quality'
            }]
        };

        // Track form changes
        Object.keys(formData).forEach(field => {
            if (field !== 'visits') {
                changeTracker.trackChange('patient-form', field, '', formData[field]);
            }
        });

        // Validate form data
        const validation = formManager.validateForm(formData, 'patient');
        this.assert(validation.isValid, 'Form data should be valid');

        // Create patient through manager
        const createResult = await patientManager.createPatient(formData);
        this.assert(createResult.success, 'Patient creation should succeed');
        this.assert(createResult.patientId, 'Should return patient ID');
        this.assert(createResult.patient, 'Should return patient data');

        const patientId = createResult.patientId;

        // Verify patient was saved correctly
        const savedPatient = await patientManager.getPatient(patientId);
        this.assert(savedPatient !== null, 'Patient should be saved');
        this.assert(savedPatient.firstName === 'Alice', 'First name should be correct');
        this.assert(savedPatient.visits.length === 1, 'Visit should be saved');
        this.assert(savedPatient.visits[0].medications === 'Inhaler', 'Visit data should be correct');

        // Clear changes after successful save
        changeTracker.clearChanges('patient-form');
        this.assert(!changeTracker.hasUnsavedChanges(), 'Changes should be cleared after save');

        // Verify patient appears in search
        const searchResults = await patientManager.searchPatients('Alice');
        this.assert(searchResults.length > 0, 'Patient should be found in search');
        this.assert(searchResults[0].firstName === 'Alice', 'Search result should be correct');

        // Verify patient appears in all patients list
        const allPatients = await patientManager.getAllPatients();
        const foundPatient = allPatients.find(p => p.id === patientId);
        this.assert(foundPatient !== undefined, 'Patient should appear in all patients list');

        // Clean up
        await patientManager.deletePatient(patientId);
    }

    /**
     * Test patient search workflow
     */
    async testPatientSearchWorkflow() {
        console.log('Testing Patient Search Workflow...');

        const dataStorage = new DataStorageManager();
        await dataStorage.initializeStorage();

        const patientManager = new PatientManager();
        await patientManager.initialize(dataStorage);

        // Create multiple test patients
        const testPatients = [
            {
                firstName: 'Charlie',
                lastName: 'Brown',
                dateOfBirth: '1980-12-25',
                placeOfResidence: 'Portland',
                gender: 'male'
            },
            {
                firstName: 'Diana',
                lastName: 'Prince',
                dateOfBirth: '1985-06-15',
                placeOfResidence: 'Seattle',
                gender: 'female'
            },
            {
                firstName: 'Edward',
                lastName: 'Smith',
                dateOfBirth: '1990-09-30',
                placeOfResidence: 'Portland',
                gender: 'male'
            }
        ];

        const patientIds = [];
        for (const patientData of testPatients) {
            const result = await patientManager.createPatient(patientData);
            this.assert(result.success, 'Test patient should be created');
            patientIds.push(result.patientId);
        }

        // Test search by first name
        const firstNameResults = await patientManager.searchPatients('Charlie');
        this.assert(firstNameResults.length >= 1, 'Should find patient by first name');
        this.assert(firstNameResults[0].firstName === 'Charlie', 'First name search result should be correct');

        // Test search by last name
        const lastNameResults = await patientManager.searchPatients('Brown');
        this.assert(lastNameResults.length >= 1, 'Should find patient by last name');
        this.assert(lastNameResults[0].lastName === 'Brown', 'Last name search result should be correct');

        // Test search by place of residence
        const placeResults = await patientManager.searchPatients('Portland');
        this.assert(placeResults.length >= 2, 'Should find multiple patients by place');

        // Test partial search
        const partialResults = await patientManager.searchPatients('Dia');
        this.assert(partialResults.length >= 1, 'Should find patient with partial name');
        this.assert(partialResults[0].firstName === 'Diana', 'Partial search should find correct patient');

        // Test case-insensitive search
        const caseResults = await patientManager.searchPatients('CHARLIE');
        this.assert(caseResults.length >= 1, 'Search should be case-insensitive');

        // Test search with no results
        const noResults = await patientManager.searchPatients('NonExistentName');
        this.assert(noResults.length === 0, 'Should return empty array for no matches');

        // Test empty search (should return all patients)
        const emptyResults = await patientManager.searchPatients('');
        this.assert(emptyResults.length >= 3, 'Empty search should return all patients');

        // Clean up
        for (const patientId of patientIds) {
            await patientManager.deletePatient(patientId);
        }
    }

    /**
     * Test patient modification workflow
     */
    async testPatientModificationWorkflow() {
        console.log('Testing Patient Modification Workflow...');

        const dataStorage = new DataStorageManager();
        await dataStorage.initializeStorage();

        const patientManager = new PatientManager();
        await patientManager.initialize(dataStorage);

        const changeTracker = new ChangeTracker();

        // Create initial patient
        const initialData = {
            firstName: 'David',
            lastName: 'Miller',
            dateOfBirth: '1992-07-15',
            placeOfResidence: 'Denver',
            gender: 'male',
            visits: [{
                visitDate: '2024-01-10',
                medications: 'Initial medication',
                observations: 'Initial observation'
            }]
        };

        const createResult = await patientManager.createPatient(initialData);
        this.assert(createResult.success, 'Initial patient should be created');

        const patientId = createResult.patientId;

        // Load patient for editing
        const originalPatient = await patientManager.getPatient(patientId);
        this.assert(originalPatient !== null, 'Patient should be loaded for editing');

        // Simulate user making changes
        const modifications = {
            placeOfResidence: 'Boulder',
            visits: [
                ...originalPatient.visits,
                {
                    visitDate: '2024-01-25',
                    medications: 'Updated medication',
                    observations: 'Follow-up visit shows improvement',
                    additionalComments: 'Patient responding well to treatment'
                }
            ]
        };

        // Track changes
        changeTracker.trackChange('patient-form', 'placeOfResidence', 'Denver', 'Boulder');
        changeTracker.trackChange('patient-form', 'visits', originalPatient.visits, modifications.visits);

        this.assert(changeTracker.hasUnsavedChanges(), 'Should detect unsaved changes');

        // Update patient
        const updateResult = await patientManager.updatePatient(patientId, modifications);
        this.assert(updateResult.success, 'Patient update should succeed');

        // Verify changes were saved
        const updatedPatient = await patientManager.getPatient(patientId);
        this.assert(updatedPatient.placeOfResidence === 'Boulder', 'Place of residence should be updated');
        this.assert(updatedPatient.visits.length === 2, 'Should have two visits');
        this.assert(updatedPatient.visits[1].medications === 'Updated medication', 'New visit should be saved');

        // Verify timestamps were updated
        this.assert(updatedPatient.updatedAt > originalPatient.updatedAt, 'Updated timestamp should be newer');
        this.assert(updatedPatient.createdAt === originalPatient.createdAt, 'Created timestamp should remain same');

        // Clear changes after successful save
        changeTracker.clearChanges('patient-form');
        this.assert(!changeTracker.hasUnsavedChanges(), 'Changes should be cleared after save');

        // Test modification validation
        try {
            await patientManager.updatePatient(patientId, { firstName: '' }); // Invalid data
            this.assert(false, 'Invalid modification should be rejected');
        } catch (error) {
            this.assert(error.message.includes('validation'), 'Should reject invalid modifications');
        }

        // Clean up
        await patientManager.deletePatient(patientId);
    }

    /**
     * Test patient deletion workflow
     */
    async testPatientDeletionWorkflow() {
        console.log('Testing Patient Deletion Workflow...');

        const dataStorage = new DataStorageManager();
        await dataStorage.initializeStorage();

        const patientManager = new PatientManager();
        await patientManager.initialize(dataStorage);

        // Create patient to delete
        const patientData = {
            firstName: 'Eva',
            lastName: 'Garcia',
            dateOfBirth: '1987-11-30',
            placeOfResidence: 'Phoenix',
            gender: 'female',
            visits: [{
                visitDate: '2024-01-15',
                medications: 'Test medication',
                observations: 'Test observation'
            }]
        };

        const createResult = await patientManager.createPatient(patientData);
        this.assert(createResult.success, 'Patient should be created for deletion test');

        const patientId = createResult.patientId;

        // Verify patient exists before deletion
        const existingPatient = await patientManager.getPatient(patientId);
        this.assert(existingPatient !== null, 'Patient should exist before deletion');

        // Verify patient appears in search
        const searchBefore = await patientManager.searchPatients('Eva');
        this.assert(searchBefore.length > 0, 'Patient should be found in search before deletion');

        // Delete patient
        const deleteResult = await patientManager.deletePatient(patientId);
        this.assert(deleteResult.success, 'Patient deletion should succeed');
        this.assert(deleteResult.patientId === patientId, 'Delete result should include patient ID');

        // Verify patient no longer exists
        const deletedPatient = await patientManager.getPatient(patientId);
        this.assert(deletedPatient === null, 'Patient should not exist after deletion');

        // Verify patient no longer appears in search
        const searchAfter = await patientManager.searchPatients('Eva');
        const foundDeleted = searchAfter.find(p => p.id === patientId);
        this.assert(foundDeleted === undefined, 'Deleted patient should not appear in search');

        // Verify patient no longer appears in all patients list
        const allPatients = await patientManager.getAllPatients();
        const foundInAll = allPatients.find(p => p.id === patientId);
        this.assert(foundInAll === undefined, 'Deleted patient should not appear in all patients list');

        // Test deleting non-existent patient
        try {
            await patientManager.deletePatient('non-existent-id');
            this.assert(false, 'Deleting non-existent patient should fail');
        } catch (error) {
            this.assert(error.message.includes('not found'), 'Should handle non-existent patient deletion');
        }

        // Test deleting with empty ID
        try {
            await patientManager.deletePatient('');
            this.assert(false, 'Deleting with empty ID should fail');
        } catch (error) {
            this.assert(error.message.includes('required'), 'Should require patient ID for deletion');
        }
    }

    /**
     * Test authentication workflow
     */
    async testAuthenticationWorkflow() {
        console.log('Testing Authentication Workflow...');

        const authManager = new AuthenticationManager();

        // Test initial state
        this.assert(!authManager.isAuthenticated(), 'Should not be authenticated initially');

        // Test login process
        const loginResult = await authManager.login('dr.sahboub', 'pneumo2024');
        this.assert(loginResult === true, 'Login should succeed with valid credentials');
        this.assert(authManager.isAuthenticated(), 'Should be authenticated after login');

        // Test session data
        const user = authManager.getCurrentUser();
        this.assert(user !== null, 'Should have current user after login');
        this.assert(user.username === 'dr.sahboub', 'Username should be correct');
        this.assert(user.userId, 'User should have ID');
        this.assert(user.loginTime, 'User should have login time');

        // Test session persistence (simulate page refresh)
        const sessionData = JSON.stringify(authManager.currentSession.toJSON());
        authManager.logout(false); // Logout without clearing session storage

        // Simulate session restoration
        if (typeof sessionStorage !== 'undefined') {
            sessionStorage.setItem('pms_session', sessionData);
        }

        const newAuthManager = new AuthenticationManager();
        // In real scenario, session would be restored from sessionStorage

        // Test activity tracking
        authManager.login('dr.sahboub', 'pneumo2024');
        const initialActivity = authManager.getCurrentUser().lastActivity;

        authManager.updateLastActivity();
        const updatedActivity = authManager.getCurrentUser().lastActivity;
        this.assert(updatedActivity >= initialActivity, 'Activity should be updated');

        // Test logout
        authManager.logout();
        this.assert(!authManager.isAuthenticated(), 'Should not be authenticated after logout');
        this.assert(authManager.getCurrentUser() === null, 'Current user should be null after logout');
    }

    /**
     * Test data persistence workflow
     */
    async testDataPersistenceWorkflow() {
        console.log('Testing Data Persistence Workflow...');

        // Create first data storage instance
        const dataStorage1 = new DataStorageManager();
        await dataStorage1.initializeStorage();

        // Save test data
        const patientData = {
            id: 'persistence-test',
            firstName: 'Frank',
            lastName: 'Thompson',
            dateOfBirth: '1983-04-12',
            placeOfResidence: 'Miami',
            gender: 'male',
            visits: [{
                id: 'visit-1',
                visitDate: '2024-01-20',
                medications: 'Persistence test medication',
                observations: 'Testing data persistence',
                additionalComments: 'This should persist across instances'
            }],
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        const saveResult = await dataStorage1.savePatient(patientData);
        this.assert(saveResult.success, 'Data should be saved successfully');

        // Create second data storage instance to test persistence
        const dataStorage2 = new DataStorageManager();
        await dataStorage2.initializeStorage();

        // Load data from second instance
        const loadedPatient = await dataStorage2.loadPatient('persistence-test');
        this.assert(loadedPatient !== null, 'Data should persist across instances');
        this.assert(loadedPatient.firstName === 'Frank', 'Loaded data should be correct');
        this.assert(loadedPatient.visits.length === 1, 'Visits should persist');
        this.assert(loadedPatient.visits[0].medications === 'Persistence test medication', 'Visit data should persist');

        // Test search persistence
        const searchResults = await dataStorage2.searchPatients({ searchTerm: 'Frank' });
        this.assert(searchResults.length > 0, 'Search should work across instances');

        // Test statistics persistence
        const stats = await dataStorage2.getStatistics();
        this.assert(stats.totalPatients >= 1, 'Statistics should reflect persisted data');

        // Clean up
        await dataStorage2.deletePatient('persistence-test');

        // Verify deletion persists
        const dataStorage3 = new DataStorageManager();
        await dataStorage3.initializeStorage();

        const deletedPatient = await dataStorage3.loadPatient('persistence-test');
        this.assert(deletedPatient === null, 'Deletion should persist across instances');
    }

    /**
     * Test form validation workflow
     */
    async testFormValidationWorkflow() {
        console.log('Testing Form Validation Workflow...');

        const formManager = new FormManager();
        const patientManager = new PatientManager();
        const dataStorage = new DataStorageManager();

        await dataStorage.initializeStorage();
        await patientManager.initialize(dataStorage);

        // Test valid form submission
        const validFormData = {
            firstName: 'Grace',
            lastName: 'Lee',
            dateOfBirth: '1991-09-05',
            placeOfResidence: 'Austin',
            gender: 'female',
            visits: [{
                visitDate: '2024-01-15',
                medications: 'Valid medication',
                observations: 'Valid observation',
                additionalComments: 'Valid comments'
            }]
        };

        // Validate form data
        const validation = formManager.validateForm(validFormData, 'patient');
        this.assert(validation.isValid, 'Valid form should pass validation');

        // Submit valid form
        const createResult = await patientManager.createPatient(validFormData);
        this.assert(createResult.success, 'Valid form should be submitted successfully');

        // Test invalid form submission
        const invalidFormData = {
            firstName: '', // Empty required field
            lastName: 'Lee',
            dateOfBirth: '2030-01-01', // Future date
            placeOfResidence: 'Austin',
            gender: 'invalid-gender', // Invalid gender
            visits: [{
                visitDate: '', // Empty visit date
                medications: 'A'.repeat(1500), // Too long
                observations: 'Valid observation'
            }]
        };

        // Validate invalid form
        const invalidValidation = formManager.validateForm(invalidFormData, 'patient');
        this.assert(!invalidValidation.isValid, 'Invalid form should fail validation');
        this.assert(invalidValidation.errors.length > 0, 'Should have validation errors');

        // Try to submit invalid form
        try {
            await patientManager.createPatient(invalidFormData);
            this.assert(false, 'Invalid form should not be submitted');
        } catch (error) {
            this.assert(error.message.includes('validation'), 'Should reject invalid form submission');
        }

        // Test field-specific validation
        const fieldTests = [
            { field: 'firstName', value: '', shouldFail: true },
            { field: 'firstName', value: 'J', shouldFail: true }, // Too short
            { field: 'firstName', value: 'John123', shouldFail: true }, // Invalid characters
            { field: 'firstName', value: 'John', shouldFail: false },
            { field: 'dateOfBirth', value: '2030-01-01', shouldFail: true }, // Future
            { field: 'dateOfBirth', value: 'invalid-date', shouldFail: true },
            { field: 'dateOfBirth', value: '1990-01-01', shouldFail: false },
            { field: 'gender', value: 'invalid', shouldFail: true },
            { field: 'gender', value: 'male', shouldFail: false }
        ];

        for (const test of fieldTests) {
            const testData = { ...validFormData, [test.field]: test.value };
            const testValidation = formManager.validateForm(testData, 'patient');

            if (test.shouldFail) {
                this.assert(!testValidation.isValid, `${test.field} with value "${test.value}" should fail validation`);
            } else {
                this.assert(testValidation.isValid, `${test.field} with value "${test.value}" should pass validation`);
            }
        }

        // Clean up
        if (createResult.success) {
            await patientManager.deletePatient(createResult.patientId);
        }
    }

    /**
     * Test navigation workflow
     */
    async testNavigationWorkflow() {
        console.log('Testing Navigation Workflow...');

        const router = new UIRouter();
        const changeTracker = new ChangeTracker();

        // Register routes
        router.registerRoute('/patients', () => { });
        router.registerRoute('/patient/:id', () => { });
        router.registerRoute('/create', () => { });
        router.registerRoute('/edit/:id', () => { });

        // Test initial navigation
        router.navigateTo('/patients');
        this.assert(router.getCurrentRoute() === '/patients', 'Should navigate to patients list');

        // Test navigation to create form
        router.navigateTo('/create');
        this.assert(router.getCurrentRoute() === '/create', 'Should navigate to create form');

        // Test navigation with unsaved changes
        changeTracker.trackChange('patient-form', 'firstName', '', 'John');
        this.assert(changeTracker.hasUnsavedChanges(), 'Should have unsaved changes');

        // Navigation should detect unsaved changes
        const canNavigate = router.checkUnsavedChanges();
        this.assert(!canNavigate, 'Should not allow navigation with unsaved changes');

        // Clear changes and try navigation again
        changeTracker.clearChanges('patient-form');
        const canNavigateNow = router.checkUnsavedChanges();
        this.assert(canNavigateNow, 'Should allow navigation without unsaved changes');

        // Test navigation to patient detail
        router.navigateTo('/patient/123');
        this.assert(router.getCurrentRoute() === '/patient/123', 'Should navigate to patient detail');

        // Test navigation to edit form
        router.navigateTo('/edit/123');
        this.assert(router.getCurrentRoute() === '/edit/123', 'Should navigate to edit form');

        // Test back navigation
        router.navigateBack();
        this.assert(router.getCurrentRoute() === '/patient/123', 'Should navigate back to previous route');
    }

    /**
     * Test logout with changes workflow
     */
    async testLogoutWithChangesWorkflow() {
        console.log('Testing Logout with Changes Workflow...');

        const authManager = new AuthenticationManager();
        const changeTracker = new ChangeTracker();

        // Login first
        await authManager.login('dr.sahboub', 'pneumo2024');
        this.assert(authManager.isAuthenticated(), 'Should be authenticated');

        // Simulate user making changes
        changeTracker.trackChange('patient-form', 'firstName', '', 'John');
        changeTracker.trackChange('patient-form', 'lastName', '', 'Doe');

        this.assert(changeTracker.hasUnsavedChanges(), 'Should have unsaved changes');

        // Test logout attempt with unsaved changes
        const safeToLogout = await authManager.checkUnsavedChanges();
        this.assert(!safeToLogout, 'Should not be safe to logout with unsaved changes');

        // Get details about unsaved changes
        const changeDetails = authManager.getUnsavedChangesDetails();
        this.assert(changeDetails.hasChanges, 'Should report having changes');
        this.assert(changeDetails.descriptions.length > 0, 'Should provide change descriptions');

        // Simulate user choosing to save and exit
        // In real app, this would save the form data
        changeTracker.clearChanges('patient-form');

        // Now logout should be safe
        const safeToLogoutNow = await authManager.checkUnsavedChanges();
        this.assert(safeToLogoutNow, 'Should be safe to logout after saving changes');

        // Perform logout
        authManager.logout();
        this.assert(!authManager.isAuthenticated(), 'Should be logged out');

        // Test logout without changes
        await authManager.login('dr.sahboub', 'pneumo2024');
        this.assert(!changeTracker.hasUnsavedChanges(), 'Should have no unsaved changes');

        const immediateLogout = await authManager.checkUnsavedChanges();
        this.assert(immediateLogout, 'Should allow immediate logout without changes');

        authManager.logout();
        this.assert(!authManager.isAuthenticated(), 'Should be logged out immediately');
    }

    /**
     * Test multiple patient management
     */
    async testMultiplePatientManagement() {
        console.log('Testing Multiple Patient Management...');

        const dataStorage = new DataStorageManager();
        await dataStorage.initializeStorage();

        const patientManager = new PatientManager();
        await patientManager.initialize(dataStorage);

        // Create multiple patients with different characteristics
        const patients = [
            { firstName: 'Ivy', lastName: 'Johnson', dateOfBirth: '1985-01-15', placeOfResidence: 'Dallas', gender: 'female' },
            { firstName: 'Jack', lastName: 'Wilson', dateOfBirth: '1990-05-20', placeOfResidence: 'Houston', gender: 'male' },
            { firstName: 'Kate', lastName: 'Brown', dateOfBirth: '1988-09-10', placeOfResidence: 'San Antonio', gender: 'female' },
            { firstName: 'Liam', lastName: 'Davis', dateOfBirth: '1982-12-05', placeOfResidence: 'Austin', gender: 'male' },
            { firstName: 'Maya', lastName: 'Rodriguez', dateOfBirth: '1995-03-22', placeOfResidence: 'Dallas', gender: 'female' }
        ];

        const patientIds = [];

        // Create all patients
        for (const patientData of patients) {
            const result = await patientManager.createPatient(patientData);
            this.assert(result.success, `Should create patient ${patientData.firstName}`);
            patientIds.push(result.patientId);
        }

        // Test getting all patients
        const allPatients = await patientManager.getAllPatients();
        this.assert(allPatients.length >= 5, 'Should retrieve all created patients');

        // Test search across multiple patients
        const femaleResults = await patientManager.searchPatients('female');
        // Note: This might not work as expected since search is typically by name, not gender

        const dallasResults = await patientManager.searchPatients('Dallas');
        this.assert(dallasResults.length >= 2, 'Should find patients from Dallas');

        const johnsonResults = await patientManager.searchPatients('Johnson');
        this.assert(johnsonResults.length >= 1, 'Should find Johnson patient');

        // Test statistics with multiple patients
        const stats = await patientManager.getPatientStatistics();
        this.assert(stats.totalPatients >= 5, 'Statistics should show all patients');
        this.assert(stats.genderDistribution.male >= 2, 'Should have male patients');
        this.assert(stats.genderDistribution.female >= 3, 'Should have female patients');

        // Test batch operations (if supported)
        // Add visits to multiple patients
        for (let i = 0; i < patientIds.length; i++) {
            const patient = await patientManager.getPatient(patientIds[i]);
            patient.addVisit({
                visitDate: '2024-01-20',
                medications: `Medication for patient ${i + 1}`,
                observations: `Observation for patient ${i + 1}`
            });

            const updateResult = await patientManager.updatePatient(patientIds[i], patient.toJSON());
            this.assert(updateResult.success, `Should update patient ${i + 1} with visit`);
        }

        // Verify all patients have visits
        for (const patientId of patientIds) {
            const patient = await patientManager.getPatient(patientId);
            this.assert(patient.visits.length >= 1, 'Each patient should have at least one visit');
        }

        // Clean up all patients
        for (const patientId of patientIds) {
            const deleteResult = await patientManager.deletePatient(patientId);
            this.assert(deleteResult.success, 'Should delete each patient');
        }

        // Verify all patients are deleted
        const remainingPatients = await patientManager.getAllPatients();
        const createdPatients = remainingPatients.filter(p => patientIds.includes(p.id));
        this.assert(createdPatients.length === 0, 'All created patients should be deleted');
    }

    /**
     * Test session management
     */
    async testSessionManagement() {
        console.log('Testing Session Management...');

        const authManager = new AuthenticationManager();

        // Test session creation
        await authManager.login('dr.sahboub', 'pneumo2024');
        const session1 = authManager.getCurrentUser();
        this.assert(session1 !== null, 'Should create session on login');
        this.assert(session1.loginTime, 'Session should have login time');
        this.assert(session1.lastActivity, 'Session should have last activity time');

        // Test session activity update
        const originalActivity = session1.lastActivity;
        await new Promise(resolve => setTimeout(resolve, 10)); // Wait 10ms

        authManager.updateLastActivity();
        const session2 = authManager.getCurrentUser();
        this.assert(session2.lastActivity > originalActivity, 'Should update activity timestamp');

        // Test session validation
        this.assert(authManager.isAuthenticated(), 'Session should be valid');
        this.assert(authManager.isSessionValid(authManager.currentSession), 'Session validation should work');

        // Test session refresh
        const originalLoginTime = session2.loginTime;
        authManager.refreshSession();
        const refreshedSession = authManager.getCurrentUser();
        this.assert(refreshedSession.loginTime >= originalLoginTime, 'Session should be refreshed');

        // Test session timeout (simulate)
        const expiredSession = {
            ...authManager.currentSession.toJSON(),
            loginTime: Date.now() - (25 * 60 * 60 * 1000), // 25 hours ago
            lastActivity: Date.now() - (3 * 60 * 60 * 1000) // 3 hours ago
        };

        this.assert(!authManager.isSessionValid(expiredSession), 'Expired session should be invalid');

        // Test session cleanup on logout
        authManager.logout();
        this.assert(!authManager.isAuthenticated(), 'Should not be authenticated after logout');
        this.assert(authManager.currentSession === null, 'Session should be cleared on logout');
    }

    /**
     * Test backup and restore workflow
     */
    async testBackupAndRestoreWorkflow() {
        console.log('Testing Backup and Restore Workflow...');

        const dataStorage = new DataStorageManager();
        await dataStorage.initializeStorage();

        // Create test data
        const testPatients = [
            {
                id: 'backup-test-1',
                firstName: 'Laura',
                lastName: 'Martinez',
                dateOfBirth: '1986-12-03',
                placeOfResidence: 'Orlando',
                gender: 'female',
                visits: [{
                    id: 'visit-1',
                    visitDate: '2024-01-15',
                    medications: 'Backup test medication',
                    observations: 'Backup test observation'
                }],
                createdAt: Date.now(),
                updatedAt: Date.now()
            },
            {
                id: 'backup-test-2',
                firstName: 'Michael',
                lastName: 'Chen',
                dateOfBirth: '1979-08-17',
                placeOfResidence: 'Tampa',
                gender: 'male',
                visits: [],
                createdAt: Date.now(),
                updatedAt: Date.now()
            }
        ];

        // Save test data
        for (const patientData of testPatients) {
            const saveResult = await dataStorage.savePatient(patientData);
            this.assert(saveResult.success, 'Test patient should be saved');
        }

        // Verify data exists
        const beforeBackup = await dataStorage.getAllPatients();
        this.assert(beforeBackup.length >= 2, 'Should have test patients before backup');

        // Create backup
        const backupResult = await dataStorage.createBackup();
        this.assert(backupResult.success, 'Backup should be created successfully');
        this.assert(backupResult.backupId, 'Backup should have an ID');
        this.assert(backupResult.patientsCount >= 2, 'Backup should include all patients');

        // Clear all data
        const clearResult = await dataStorage.clearAllData();
        this.assert(clearResult.success, 'Should clear all data');

        // Verify data is cleared
        const afterClear = await dataStorage.getAllPatients();
        this.assert(afterClear.length === 0, 'Should have no patients after clear');

        const clearedPatient1 = await dataStorage.loadPatient('backup-test-1');
        const clearedPatient2 = await dataStorage.loadPatient('backup-test-2');
        this.assert(clearedPatient1 === null, 'Patient 1 should be cleared');
        this.assert(clearedPatient2 === null, 'Patient 2 should be cleared');

        // Restore from backup
        const restoreResult = await dataStorage.restoreFromBackup(backupResult.backupId);
        this.assert(restoreResult.success, 'Restore should succeed');
        this.assert(restoreResult.patientsRestored >= 2, 'Should restore all patients');

        // Verify data is restored
        const afterRestore = await dataStorage.getAllPatients();
        this.assert(afterRestore.length >= 2, 'Should have patients after restore');

        const restoredPatient1 = await dataStorage.loadPatient('backup-test-1');
        const restoredPatient2 = await dataStorage.loadPatient('backup-test-2');

        this.assert(restoredPatient1 !== null, 'Patient 1 should be restored');
        this.assert(restoredPatient1.firstName === 'Laura', 'Patient 1 data should be correct');
        this.assert(restoredPatient1.visits.length === 1, 'Patient 1 visits should be restored');

        this.assert(restoredPatient2 !== null, 'Patient 2 should be restored');
        this.assert(restoredPatient2.firstName === 'Michael', 'Patient 2 data should be correct');

        // Test restore with invalid backup ID
        try {
            await dataStorage.restoreFromBackup('invalid-backup-id');
            this.assert(false, 'Invalid backup ID should fail');
        } catch (error) {
            this.assert(error.message.includes('not found') || error.message.includes('invalid'),
                'Should handle invalid backup ID');
        }

        // Clean up
        await dataStorage.deletePatient('backup-test-1');
        await dataStorage.deletePatient('backup-test-2');
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
        console.log('📊 Integration Test Results:');
        console.log(`✅ Passed: ${this.testResults.passed}`);
        console.log(`❌ Failed: ${this.testResults.failed}`);
        console.log(`📈 Success Rate: ${((this.testResults.passed / this.testResults.total) * 100).toFixed(1)}%`);
        console.log('='.repeat(50));
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = IntegrationTestSuite;
}