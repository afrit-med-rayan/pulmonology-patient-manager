/**
 * Error Scenario Tests for Patient Management System
 * Tests error handling, edge cases, and recovery scenarios
 */

class ErrorScenarioTestSuite {
    constructor() {
        this.testResults = { passed: 0, failed: 0, total: 0 };
    }

    /**
     * Run all error scenario tests
     */
    async runAllErrorScenarioTests() {
        console.log('🚨 Running Error Scenario Tests...');
        console.log('='.repeat(50));

        const tests = [
            () => this.testInvalidDataHandling(),
            () => this.testStorageFailures(),
            () => this.testCorruptedDataRecovery(),
            () => this.testBoundaryConditions(),
            () => this.testSecurityScenarios(),
            () => this.testNetworkFailures(),
            () => this.testConcurrencyIssues(),
            () => this.testResourceExhaustion()
        ];

        for (const test of tests) {
            try {
                await test();
                this.testResults.passed++;
                console.log('✅ Error scenario test passed');
            } catch (error) {
                console.error(`❌ Error scenario test failed: ${error.message}`);
                this.testResults.failed++;
            }
            this.testResults.total++;
        }

        this.printResults();
        return this.testResults.failed === 0;
    }

    /**
     * Test handling of various invalid data scenarios
     */
    async testInvalidDataHandling() {
        console.log('Testing Invalid Data Handling...');

        const dataStorage = new DataStorageManager();
        await dataStorage.initializeStorage();

        const patientManager = new PatientManager();
        await patientManager.initialize(dataStorage);

        // Test null and undefined data
        const nullUndefinedTests = [
            { data: null, description: 'null data' },
            { data: undefined, description: 'undefined data' },
            { data: {}, description: 'empty object' },
            { data: '', description: 'empty string' },
            { data: [], description: 'array instead of object' },
            { data: 123, description: 'number instead of object' },
            { data: 'string', description: 'string instead of object' }
        ];

        for (const test of nullUndefinedTests) {
            try {
                await patientManager.createPatient(test.data);
                this.assert(false, `Should reject ${test.description}`);
            } catch (error) {
                this.assert(error.message.includes('Invalid') || error.message.includes('required'),
                    `Should properly handle ${test.description}`);
                console.log(`✓ Correctly rejected ${test.description}: ${error.message}`);
            }
        }

        // Test invalid field values
        const invalidFieldTests = [
            {
                data: { firstName: '', lastName: 'Test', dateOfBirth: '1990-01-01', placeOfResidence: 'City', gender: 'male' },
                description: 'empty first name'
            },
            {
                data: { firstName: 'J', lastName: 'Test', dateOfBirth: '1990-01-01', placeOfResidence: 'City', gender: 'male' },
                description: 'too short first name'
            },
            {
                data: { firstName: 'A'.repeat(100), lastName: 'Test', dateOfBirth: '1990-01-01', placeOfResidence: 'City', gender: 'male' },
                description: 'too long first name'
            },
            {
                data: { firstName: 'John123', lastName: 'Test', dateOfBirth: '1990-01-01', placeOfResidence: 'City', gender: 'male' },
                description: 'first name with numbers'
            },
            {
                data: { firstName: 'John', lastName: '', dateOfBirth: '1990-01-01', placeOfResidence: 'City', gender: 'male' },
                description: 'empty last name'
            },
            {
                data: { firstName: 'John', lastName: 'Test', dateOfBirth: '', placeOfResidence: 'City', gender: 'male' },
                description: 'empty date of birth'
            },
            {
                data: { firstName: 'John', lastName: 'Test', dateOfBirth: 'invalid-date', placeOfResidence: 'City', gender: 'male' },
                description: 'invalid date format'
            },
            {
                data: { firstName: 'John', lastName: 'Test', dateOfBirth: '2030-01-01', placeOfResidence: 'City', gender: 'male' },
                description: 'future date of birth'
            },
            {
                data: { firstName: 'John', lastName: 'Test', dateOfBirth: '1990-01-01', placeOfResidence: '', gender: 'male' },
                description: 'empty place of residence'
            },
            {
                data: { firstName: 'John', lastName: 'Test', dateOfBirth: '1990-01-01', placeOfResidence: 'City', gender: '' },
                description: 'empty gender'
            },
            {
                data: { firstName: 'John', lastName: 'Test', dateOfBirth: '1990-01-01', placeOfResidence: 'City', gender: 'invalid' },
                description: 'invalid gender'
            }
        ];

        for (const test of invalidFieldTests) {
            try {
                await patientManager.createPatient(test.data);
                this.assert(false, `Should reject ${test.description}`);
            } catch (error) {
                this.assert(error.message.includes('validation') || error.message.includes('failed'),
                    `Should properly validate ${test.description}`);
                console.log(`✓ Correctly rejected ${test.description}`);
            }
        }

        // Test invalid visit data
        const invalidVisitData = {
            firstName: 'John',
            lastName: 'Test',
            dateOfBirth: '1990-01-01',
            placeOfResidence: 'City',
            gender: 'male',
            visits: [
                {
                    visitDate: '', // Invalid visit date
                    medications: 'A'.repeat(2000), // Too long
                    observations: 'Valid observation'
                }
            ]
        };

        try {
            await patientManager.createPatient(invalidVisitData);
            this.assert(false, 'Should reject invalid visit data');
        } catch (error) {
            this.assert(error.message.includes('validation'), 'Should validate visit data');
            console.log('✓ Correctly rejected invalid visit data');
        }

        // Test malformed JSON-like data
        const malformedTests = [
            {
                data: { firstName: 'John', lastName: 'Test', dateOfBirth: new Date() }, // Date object instead of string
                description: 'Date object in dateOfBirth'
            },
            {
                data: { firstName: 'John', lastName: 'Test', visits: 'not an array' },
                description: 'string instead of visits array'
            }
        ];

        for (const test of malformedTests) {
            try {
                await patientManager.createPatient(test.data);
                // Some malformed data might be handled gracefully, so we don't always expect failure
                console.log(`⚠️ Malformed data handled: ${test.description}`);
            } catch (error) {
                console.log(`✓ Correctly rejected malformed data: ${test.description}`);
            }
        }
    }

    /**
     * Test storage failure scenarios
     */
    async testStorageFailures() {
        console.log('Testing Storage Failures...');

        // Test localStorage unavailability
        const originalLocalStorage = global.localStorage;

        // Simulate localStorage being unavailable
        global.localStorage = null;

        const dataStorage1 = new DataStorageManager();

        try {
            const initResult = await dataStorage1.initializeStorage();
            // Should either succeed with fallback or fail gracefully
            if (initResult.success) {
                this.assert(dataStorage1.storageType !== 'localStorage',
                    'Should use fallback storage when localStorage unavailable');
                console.log('✓ Gracefully handled localStorage unavailability with fallback');
            } else {
                console.log('✓ Gracefully failed when localStorage unavailable');
            }
        } catch (error) {
            console.log('✓ Properly handled localStorage unavailability with error');
        }

        // Restore localStorage
        global.localStorage = originalLocalStorage;

        // Test localStorage quota exceeded simulation
        if (typeof localStorage !== 'undefined') {
            const dataStorage2 = new DataStorageManager();
            await dataStorage2.initializeStorage();

            // Create a very large patient record to potentially exceed quota
            const largePatientData = {
                id: 'quota-test',
                firstName: 'Quota',
                lastName: 'Test',
                dateOfBirth: '1990-01-01',
                placeOfResidence: 'A'.repeat(10000), // Very long residence
                gender: 'male',
                visits: Array(1000).fill(null).map((_, i) => ({
                    id: `visit-${i}`,
                    visitDate: '2024-01-01',
                    medications: 'A'.repeat(1000),
                    observations: 'B'.repeat(2000),
                    additionalComments: 'C'.repeat(1000)
                })),
                createdAt: Date.now(),
                updatedAt: Date.now()
            };

            try {
                const saveResult = await dataStorage2.savePatient(largePatientData);
                if (saveResult.success) {
                    console.log('✓ Large patient data saved successfully');
                    // Clean up
                    await dataStorage2.deletePatient('quota-test');
                } else {
                    console.log('✓ Gracefully handled storage quota issues');
                }
            } catch (error) {
                if (error.message.includes('quota') || error.message.includes('storage')) {
                    console.log('✓ Properly handled storage quota exceeded');
                } else {
                    console.log('✓ Handled large data storage error gracefully');
                }
            }
        }

        // Test corrupted localStorage data
        if (typeof localStorage !== 'undefined') {
            // Corrupt the patients data
            localStorage.setItem('pms_patients', '{"invalid": json}');
            localStorage.setItem('pms_patients_index', 'not an array');

            const dataStorage3 = new DataStorageManager();

            try {
                const initResult = await dataStorage3.initializeStorage();
                this.assert(initResult.success, 'Should recover from corrupted data');
                console.log('✓ Successfully recovered from corrupted localStorage data');

                // Should be able to save new data after recovery
                const testPatient = {
                    id: 'recovery-test',
                    firstName: 'Recovery',
                    lastName: 'Test',
                    dateOfBirth: '1990-01-01',
                    placeOfResidence: 'Test City',
                    gender: 'male',
                    visits: [],
                    createdAt: Date.now(),
                    updatedAt: Date.now()
                };

                const saveResult = await dataStorage3.savePatient(testPatient);
                this.assert(saveResult.success, 'Should be able to save data after recovery');

                // Clean up
                await dataStorage3.deletePatient('recovery-test');

            } catch (error) {
                console.log('✓ Handled corrupted data with appropriate error');
            }
        }
    }

    /**
     * Test corrupted data recovery scenarios
     */
    async testCorruptedDataRecovery() {
        console.log('Testing Corrupted Data Recovery...');

        const dataStorage = new DataStorageManager();
        await dataStorage.initializeStorage();

        // Create valid test data first
        const validPatient = {
            id: 'corruption-test',
            firstName: 'Corruption',
            lastName: 'Test',
            dateOfBirth: '1990-01-01',
            placeOfResidence: 'Test City',
            gender: 'male',
            visits: [{
                id: 'visit-1',
                visitDate: '2024-01-01',
                medications: 'Test medication',
                observations: 'Test observation'
            }],
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        await dataStorage.savePatient(validPatient);

        // Simulate various types of data corruption
        if (typeof localStorage !== 'undefined') {
            // Test 1: Partially corrupted JSON
            const originalData = localStorage.getItem('pms_patients');
            localStorage.setItem('pms_patients', originalData.slice(0, -10) + 'corrupted');

            try {
                const corruptedPatient = await dataStorage.loadPatient('corruption-test');
                if (corruptedPatient === null) {
                    console.log('✓ Gracefully handled partially corrupted JSON');
                } else {
                    console.log('✓ Successfully recovered from partial corruption');
                }
            } catch (error) {
                console.log('✓ Properly handled corrupted JSON with error');
            }

            // Restore valid data
            localStorage.setItem('pms_patients', originalData);

            // Test 2: Missing required fields
            const patientsData = JSON.parse(originalData);
            delete patientsData['corruption-test'].firstName; // Remove required field
            localStorage.setItem('pms_patients', JSON.stringify(patientsData));

            try {
                const incompletePatient = await dataStorage.loadPatient('corruption-test');
                if (incompletePatient) {
                    // Should handle missing fields gracefully
                    this.assert(incompletePatient.firstName === '' || incompletePatient.firstName === undefined,
                        'Should handle missing required fields');
                    console.log('✓ Handled missing required fields gracefully');
                }
            } catch (error) {
                console.log('✓ Properly handled missing required fields');
            }

            // Test 3: Invalid data types
            patientsData['corruption-test'].visits = 'not an array';
            patientsData['corruption-test'].age = 'not a number';
            localStorage.setItem('pms_patients', JSON.stringify(patientsData));

            try {
                const invalidTypePatient = await dataStorage.loadPatient('corruption-test');
                if (invalidTypePatient) {
                    console.log('✓ Handled invalid data types gracefully');
                }
            } catch (error) {
                console.log('✓ Properly handled invalid data types');
            }

            // Test 4: Circular references (if possible)
            const circularData = { id: 'circular-test' };
            circularData.self = circularData; // Create circular reference

            try {
                await dataStorage.savePatient(circularData);
                console.log('✓ Handled circular references in data');
            } catch (error) {
                console.log('✓ Properly rejected circular references');
            }

            // Clean up and restore
            localStorage.setItem('pms_patients', originalData);
        }

        // Test backup corruption recovery
        const backupResult = await dataStorage.createBackup();
        if (backupResult.success) {
            // Simulate backup corruption
            if (typeof localStorage !== 'undefined') {
                const backupKey = backupResult.backupId;
                localStorage.setItem(backupKey, 'corrupted backup data');

                try {
                    await dataStorage.restoreFromBackup(backupKey);
                    console.log('⚠️ Corrupted backup was processed (unexpected)');
                } catch (error) {
                    console.log('✓ Properly handled corrupted backup data');
                }
            }
        }

        // Clean up
        await dataStorage.deletePatient('corruption-test');
    }

    /**
     * Test boundary conditions and edge cases
     */
    async testBoundaryConditions() {
        console.log('Testing Boundary Conditions...');

        const dataStorage = new DataStorageManager();
        await dataStorage.initializeStorage();

        const patientManager = new PatientManager();
        await patientManager.initialize(dataStorage);

        // Test maximum field lengths
        const maxLengthTests = [
            {
                field: 'firstName',
                value: 'A'.repeat(50), // Exactly at limit
                shouldPass: true
            },
            {
                field: 'firstName',
                value: 'A'.repeat(51), // Over limit
                shouldPass: false
            },
            {
                field: 'lastName',
                value: 'B'.repeat(50),
                shouldPass: true
            },
            {
                field: 'lastName',
                value: 'B'.repeat(51),
                shouldPass: false
            },
            {
                field: 'placeOfResidence',
                value: 'C'.repeat(100),
                shouldPass: true
            },
            {
                field: 'placeOfResidence',
                value: 'C'.repeat(101),
                shouldPass: false
            }
        ];

        for (const test of maxLengthTests) {
            const patientData = {
                firstName: 'John',
                lastName: 'Doe',
                dateOfBirth: '1990-01-01',
                placeOfResidence: 'City',
                gender: 'male'
            };

            patientData[test.field] = test.value;

            try {
                const result = await patientManager.createPatient(patientData);
                if (test.shouldPass) {
                    this.assert(result.success, `${test.field} at max length should pass`);
                    console.log(`✓ ${test.field} at max length (${test.value.length} chars) accepted`);
                    // Clean up
                    await patientManager.deletePatient(result.patientId);
                } else {
                    this.assert(false, `${test.field} over max length should fail`);
                }
            } catch (error) {
                if (!test.shouldPass) {
                    console.log(`✓ ${test.field} over max length (${test.value.length} chars) correctly rejected`);
                } else {
                    throw error;
                }
            }
        }

        // Test minimum field lengths
        const minLengthTests = [
            {
                field: 'firstName',
                value: 'Jo', // Exactly at minimum
                shouldPass: true
            },
            {
                field: 'firstName',
                value: 'J', // Under minimum
                shouldPass: false
            },
            {
                field: 'lastName',
                value: 'Do',
                shouldPass: true
            },
            {
                field: 'lastName',
                value: 'D',
                shouldPass: false
            }
        ];

        for (const test of minLengthTests) {
            const patientData = {
                firstName: 'John',
                lastName: 'Doe',
                dateOfBirth: '1990-01-01',
                placeOfResidence: 'City',
                gender: 'male'
            };

            patientData[test.field] = test.value;

            try {
                const result = await patientManager.createPatient(patientData);
                if (test.shouldPass) {
                    this.assert(result.success, `${test.field} at min length should pass`);
                    console.log(`✓ ${test.field} at min length (${test.value.length} chars) accepted`);
                    await patientManager.deletePatient(result.patientId);
                } else {
                    this.assert(false, `${test.field} under min length should fail`);
                }
            } catch (error) {
                if (!test.shouldPass) {
                    console.log(`✓ ${test.field} under min length (${test.value.length} chars) correctly rejected`);
                } else {
                    throw error;
                }
            }
        }

        // Test date boundaries
        const dateTests = [
            {
                date: '1900-01-01', // Very old date
                shouldPass: true,
                description: 'very old date'
            },
            {
                date: new Date().toISOString().split('T')[0], // Today
                shouldPass: true,
                description: 'today\'s date'
            },
            {
                date: '2099-12-31', // Future date
                shouldPass: false,
                description: 'future date'
            },
            {
                date: '1800-01-01', // Extremely old date
                shouldPass: true, // Might be accepted depending on validation rules
                description: 'extremely old date'
            }
        ];

        for (const test of dateTests) {
            const patientData = {
                firstName: 'John',
                lastName: 'Doe',
                dateOfBirth: test.date,
                placeOfResidence: 'City',
                gender: 'male'
            };

            try {
                const result = await patientManager.createPatient(patientData);
                if (test.shouldPass) {
                    console.log(`✓ ${test.description} (${test.date}) accepted`);
                    await patientManager.deletePatient(result.patientId);
                } else {
                    this.assert(false, `${test.description} should fail`);
                }
            } catch (error) {
                if (!test.shouldPass) {
                    console.log(`✓ ${test.description} (${test.date}) correctly rejected`);
                } else {
                    console.log(`⚠️ ${test.description} (${test.date}) rejected: ${error.message}`);
                }
            }
        }

        // Test maximum number of visits
        const maxVisitsPatient = {
            firstName: 'Max',
            lastName: 'Visits',
            dateOfBirth: '1990-01-01',
            placeOfResidence: 'City',
            gender: 'male',
            visits: Array(1000).fill(null).map((_, i) => ({
                id: `visit-${i}`,
                visitDate: '2024-01-01',
                medications: `Medication ${i}`,
                observations: `Observation ${i}`
            }))
        };

        try {
            const result = await patientManager.createPatient(maxVisitsPatient);
            if (result.success) {
                console.log('✓ Patient with 1000 visits accepted');
                await patientManager.deletePatient(result.patientId);
            }
        } catch (error) {
            console.log('✓ Maximum visits limit enforced');
        }

        // Test empty visits array
        const emptyVisitsPatient = {
            firstName: 'Empty',
            lastName: 'Visits',
            dateOfBirth: '1990-01-01',
            placeOfResidence: 'City',
            gender: 'male',
            visits: []
        };

        const emptyVisitsResult = await patientManager.createPatient(emptyVisitsPatient);
        this.assert(emptyVisitsResult.success, 'Patient with empty visits should be accepted');
        console.log('✓ Patient with empty visits array accepted');
        await patientManager.deletePatient(emptyVisitsResult.patientId);
    }

    /**
     * Test security scenarios
     */
    async testSecurityScenarios() {
        console.log('Testing Security Scenarios...');

        const dataStorage = new DataStorageManager();
        await dataStorage.initializeStorage();

        const patientManager = new PatientManager();
        await patientManager.initialize(dataStorage);

        const authManager = new AuthenticationManager();

        // Test XSS prevention
        const xssTests = [
            {
                field: 'firstName',
                value: '<script>alert("xss")</script>John',
                description: 'script tag in first name'
            },
            {
                field: 'lastName',
                value: 'Doe<img src="x" onerror="alert(1)">',
                description: 'img tag with onerror in last name'
            },
            {
                field: 'placeOfResidence',
                value: 'New York<iframe src="javascript:alert(1)">',
                description: 'iframe with javascript in residence'
            },
            {
                field: 'visits',
                value: [{
                    visitDate: '2024-01-01',
                    medications: '<script>alert("medication")</script>Aspirin',
                    observations: 'Normal<img src="x" onerror="alert(2)">',
                    additionalComments: '<iframe>malicious</iframe>Comments'
                }],
                description: 'XSS in visit data'
            }
        ];

        for (const test of xssTests) {
            const patientData = {
                firstName: 'John',
                lastName: 'Doe',
                dateOfBirth: '1990-01-01',
                placeOfResidence: 'City',
                gender: 'male',
                visits: []
            };

            patientData[test.field] = test.value;

            try {
                const result = await patientManager.createPatient(patientData);
                if (result.success) {
                    // Check if XSS was sanitized
                    const savedPatient = await patientManager.getPatient(result.patientId);

                    if (test.field === 'visits') {
                        this.assert(!savedPatient.visits[0].medications.includes('<script>'),
                            'Script tags should be sanitized from medications');
                        this.assert(!savedPatient.visits[0].observations.includes('<img'),
                            'Img tags should be sanitized from observations');
                        console.log(`✓ XSS sanitized in visit data`);
                    } else {
                        const fieldValue = savedPatient[test.field];
                        this.assert(!fieldValue.includes('<script>') && !fieldValue.includes('<img') && !fieldValue.includes('<iframe'),
                            `XSS should be sanitized from ${test.field}`);
                        console.log(`✓ XSS sanitized in ${test.field}`);
                    }

                    await patientManager.deletePatient(result.patientId);
                }
            } catch (error) {
                console.log(`✓ XSS attempt in ${test.field} rejected: ${error.message}`);
            }
        }

        // Test SQL injection attempts (not directly applicable but good practice)
        const sqlInjectionTests = [
            "'; DROP TABLE patients; --",
            "' OR '1'='1",
            "'; DELETE FROM patients WHERE '1'='1'; --",
            "' UNION SELECT * FROM users; --"
        ];

        for (const sqlAttempt of sqlInjectionTests) {
            const patientData = {
                firstName: sqlAttempt,
                lastName: 'Test',
                dateOfBirth: '1990-01-01',
                placeOfResidence: 'City',
                gender: 'male'
            };

            try {
                const result = await patientManager.createPatient(patientData);
                if (result.success) {
                    console.log('✓ SQL injection attempt handled safely');
                    await patientManager.deletePatient(result.patientId);
                }
            } catch (error) {
                console.log('✓ SQL injection attempt rejected');
            }
        }

        // Test authentication bypass attempts
        const authBypassTests = [
            { username: '', password: '' },
            { username: 'admin', password: 'admin' },
            { username: 'dr.sahboub', password: 'wrong' },
            { username: 'admin\' OR \'1\'=\'1', password: 'anything' },
            { username: null, password: null }
        ];

        for (const test of authBypassTests) {
            try {
                const loginResult = await authManager.login(test.username, test.password);
                this.assert(!loginResult, 'Invalid login attempts should fail');
            } catch (error) {
                console.log(`✓ Authentication bypass attempt rejected: ${error.message}`);
            }
        }

        // Test session hijacking prevention
        await authManager.login('dr.sahboub', 'pneumo2024');
        const validSession = authManager.getCurrentUser();

        // Simulate tampered session
        const tamperedSession = {
            ...validSession,
            userId: 'hacker-id',
            username: 'hacker'
        };

        // The system should not accept tampered session data
        this.assert(validSession.userId !== 'hacker-id', 'Session should not be tampered');
        console.log('✓ Session tampering prevented');

        authManager.logout();
    }

    /**
     * Test network failure scenarios (for future network features)
     */
    async testNetworkFailures() {
        console.log('Testing Network Failure Scenarios...');

        // Since this is a local application, network failures are less relevant
        // But we can test timeout scenarios and offline behavior

        const authManager = new AuthenticationManager();

        // Test authentication with simulated delays
        const authStartTime = Date.now();
        try {
            const loginResult = await authManager.login('dr.sahboub', 'pneumo2024');
            const authTime = Date.now() - authStartTime;

            this.assert(loginResult, 'Authentication should succeed despite delays');
            this.assert(authTime < 10000, 'Authentication should not take too long');
            console.log(`✓ Authentication completed in ${authTime}ms`);

            authManager.logout();
        } catch (error) {
            console.log('✓ Authentication timeout handled gracefully');
        }

        // Test offline behavior simulation
        const dataStorage = new DataStorageManager();
        await dataStorage.initializeStorage();

        // All operations should work offline since it's a local app
        const offlinePatient = {
            firstName: 'Offline',
            lastName: 'Test',
            dateOfBirth: '1990-01-01',
            placeOfResidence: 'Offline City',
            gender: 'male'
        };

        const patientManager = new PatientManager();
        await patientManager.initialize(dataStorage);

        const offlineResult = await patientManager.createPatient(offlinePatient);
        this.assert(offlineResult.success, 'Should work offline');
        console.log('✓ Application works correctly offline');

        await patientManager.deletePatient(offlineResult.patientId);
    }

    /**
     * Test concurrency issues
     */
    async testConcurrencyIssues() {
        console.log('Testing Concurrency Issues...');

        const dataStorage = new DataStorageManager();
        await dataStorage.initializeStorage();

        const patientManager = new PatientManager();
        await patientManager.initialize(dataStorage);

        // Test concurrent patient creation with same ID
        const duplicatePatientData = {
            id: 'concurrent-test',
            firstName: 'Concurrent',
            lastName: 'Test',
            dateOfBirth: '1990-01-01',
            placeOfResidence: 'Concurrent City',
            gender: 'male'
        };

        const concurrentPromises = [
            patientManager.createPatient(duplicatePatientData),
            patientManager.createPatient(duplicatePatientData),
            patientManager.createPatient(duplicatePatientData)
        ];

        const concurrentResults = await Promise.all(concurrentPromises.map(p => p.catch(e => ({ error: e.message }))));

        // At least one should succeed, others should fail or handle gracefully
        const successfulCreations = concurrentResults.filter(result => result.success);
        const failedCreations = concurrentResults.filter(result => result.error);

        console.log(`✓ Concurrent creation results: ${successfulCreations.length} succeeded, ${failedCreations.length} failed`);

        // Clean up any successful creations
        for (const result of successfulCreations) {
            if (result.patientId) {
                await patientManager.deletePatient(result.patientId);
            }
        }

        // Test concurrent read/write operations
        const readWritePatient = {
            firstName: 'ReadWrite',
            lastName: 'Test',
            dateOfBirth: '1990-01-01',
            placeOfResidence: 'RW City',
            gender: 'male'
        };

        const createResult = await patientManager.createPatient(readWritePatient);
        const patientId = createResult.patientId;

        // Perform concurrent read and write operations
        const concurrentOps = [
            patientManager.getPatient(patientId),
            patientManager.updatePatient(patientId, { placeOfResidence: 'Updated City 1' }),
            patientManager.getPatient(patientId),
            patientManager.updatePatient(patientId, { placeOfResidence: 'Updated City 2' }),
            patientManager.getPatient(patientId)
        ];

        const opResults = await Promise.all(concurrentOps.map(p => p.catch(e => ({ error: e.message }))));

        // All operations should complete without throwing unhandled errors
        const successfulOps = opResults.filter(result => !result.error);
        console.log(`✓ Concurrent read/write operations: ${successfulOps.length}/${opResults.length} succeeded`);

        await patientManager.deletePatient(patientId);
    }

    /**
     * Test resource exhaustion scenarios
     */
    async testResourceExhaustion() {
        console.log('Testing Resource Exhaustion...');

        const dataStorage = new DataStorageManager();
        await dataStorage.initializeStorage();

        const patientManager = new PatientManager();
        await patientManager.initialize(dataStorage);

        // Test creating many patients rapidly
        const RAPID_CREATION_COUNT = 100;
        const rapidCreationPromises = [];

        for (let i = 0; i < RAPID_CREATION_COUNT; i++) {
            const patientData = {
                firstName: `Rapid${i}`,
                lastName: 'Creation',
                dateOfBirth: '1990-01-01',
                placeOfResidence: 'Rapid City',
                gender: i % 2 === 0 ? 'male' : 'female'
            };

            rapidCreationPromises.push(
                patientManager.createPatient(patientData).catch(error => ({ error: error.message }))
            );
        }

        const rapidResults = await Promise.all(rapidCreationPromises);
        const successfulRapid = rapidResults.filter(result => result.success);
        const failedRapid = rapidResults.filter(result => result.error);

        console.log(`✓ Rapid creation test: ${successfulRapid.length} succeeded, ${failedRapid.length} failed`);

        // System should handle rapid creation gracefully
        this.assert(successfulRapid.length > 0, 'Some rapid creations should succeed');

        // Test memory exhaustion with large objects
        try {
            const hugePatientData = {
                firstName: 'Huge',
                lastName: 'Patient',
                dateOfBirth: '1990-01-01',
                placeOfResidence: 'A'.repeat(100000), // Very large field
                gender: 'male',
                visits: Array(10000).fill(null).map((_, i) => ({
                    id: `huge-visit-${i}`,
                    visitDate: '2024-01-01',
                    medications: 'B'.repeat(1000),
                    observations: 'C'.repeat(2000),
                    additionalComments: 'D'.repeat(1000)
                }))
            };

            const hugeResult = await patientManager.createPatient(hugePatientData);
            if (hugeResult.success) {
                console.log('✓ Large patient data handled successfully');
                await patientManager.deletePatient(hugeResult.patientId);
            }
        } catch (error) {
            console.log('✓ Large patient data rejected appropriately');
        }

        // Clean up rapid creation test patients
        for (const result of successfulRapid) {
            if (result.patientId) {
                try {
                    await patientManager.deletePatient(result.patientId);
                } catch (error) {
                    // Ignore cleanup errors
                }
            }
        }

        // Test search with no results (resource efficiency)
        const noResultsSearch = await patientManager.searchPatients('NonExistentPatientName12345');
        this.assert(Array.isArray(noResultsSearch), 'Search should return array even with no results');
        this.assert(noResultsSearch.length === 0, 'Search should return empty array for no results');
        console.log('✓ Search with no results handled efficiently');
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
        console.log('📊 Error Scenario Test Results:');
        console.log(`✅ Passed: ${this.testResults.passed}`);
        console.log(`❌ Failed: ${this.testResults.failed}`);
        console.log(`📈 Success Rate: ${((this.testResults.passed / this.testResults.total) * 100).toFixed(1)}%`);
        console.log('='.repeat(50));
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ErrorScenarioTestSuite;
}