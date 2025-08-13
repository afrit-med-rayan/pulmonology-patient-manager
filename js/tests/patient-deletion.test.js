/**
 * Patient Deletion Functionality Tests
 * Tests the complete patient deletion workflow including UI interactions
 */

// Mock localStorage for testing
const mockLocalStorage = {
    data: {},
    getItem(key) {
        return this.data[key] || null;
    },
    setItem(key, value) {
        this.data[key] = value;
    },
    removeItem(key) {
        delete this.data[key];
    },
    clear() {
        this.data = {};
    },
    get length() {
        return Object.keys(this.data).length;
    },
    key(index) {
        const keys = Object.keys(this.data);
        return keys[index] || null;
    }
};

// Mock DOM elements
const mockDOM = {
    elements: {},
    getElementById(id) {
        return this.elements[id] || null;
    },
    createElement(tag) {
        return {
            tagName: tag.toUpperCase(),
            innerHTML: '',
            classList: {
                add: () => { },
                remove: () => { },
                contains: () => false
            },
            addEventListener: () => { },
            removeEventListener: () => { },
            style: {},
            setAttribute: () => { },
            getAttribute: () => null
        };
    },
    querySelector(selector) {
        return this.elements[selector] || null;
    },
    querySelectorAll(selector) {
        return [];
    }
};

// Test suite for patient deletion
class PatientDeletionTests {
    constructor() {
        this.testResults = [];
        this.setupMocks();
    }

    setupMocks() {
        // Mock global objects
        global.localStorage = mockLocalStorage;
        global.document = mockDOM;
        global.window = { localStorage: mockLocalStorage };
        global.console = {
            log: () => { },
            error: () => { },
            warn: () => { },
            info: () => { }
        };

        // Mock modal container
        mockDOM.elements['modal-container'] = {
            innerHTML: '',
            classList: {
                add: () => { },
                remove: () => { },
                contains: () => false
            },
            querySelector: (selector) => {
                if (selector === '.cancel-delete-btn') {
                    return { addEventListener: () => { } };
                }
                if (selector === '.confirm-delete-btn') {
                    return { addEventListener: () => { } };
                }
                if (selector === '.ok-btn') {
                    return { addEventListener: () => { } };
                }
                return null;
            }
        };

        // Mock delete button
        mockDOM.elements['.delete-button'] = {
            disabled: false,
            innerHTML: 'Delete Patient',
            addEventListener: () => { }
        };
    }

    async runTest(testName, testFunction) {
        try {
            console.log(`\n🧪 Running: ${testName}`);
            await testFunction();
            console.log(`✅ ${testName} - PASSED`);
            this.testResults.push({ name: testName, status: 'PASSED' });
        } catch (error) {
            console.log(`❌ ${testName} - FAILED: ${error.message}`);
            this.testResults.push({ name: testName, status: 'FAILED', error: error.message });
        }
    }

    async runAllTests() {
        console.log('🚀 Starting Patient Deletion Tests...\n');

        // Test 1: DataStorageManager deletePatient method
        await this.runTest('DataStorageManager.deletePatient - Basic functionality', async () => {
            const dataStorage = new DataStorageManager();
            await dataStorage.initializeStorage();

            // Create a test patient
            const testPatient = {
                id: 'test-delete-1',
                firstName: 'John',
                lastName: 'Doe',
                age: 30,
                gender: 'male',
                placeOfResidence: 'Test City'
            };

            // Save the patient first
            await dataStorage.savePatient(testPatient);

            // Verify patient exists
            const savedPatient = await dataStorage.loadPatient('test-delete-1');
            if (!savedPatient) {
                throw new Error('Patient was not saved properly');
            }

            // Delete the patient
            const deleteResult = await dataStorage.deletePatient('test-delete-1');

            if (!deleteResult.success) {
                throw new Error('Delete operation failed');
            }

            // Verify patient is deleted
            const deletedPatient = await dataStorage.loadPatient('test-delete-1');
            if (deletedPatient !== null) {
                throw new Error('Patient was not deleted from storage');
            }

            // Verify patient is removed from index
            if (dataStorage.patientsIndex.has('test-delete-1')) {
                throw new Error('Patient was not removed from index');
            }
        });

        // Test 2: PatientManager deletePatient method
        await this.runTest('PatientManager.deletePatient - Business logic', async () => {
            const dataStorage = new DataStorageManager();
            await dataStorage.initializeStorage();

            const patientManager = new PatientManager();
            await patientManager.initialize(dataStorage);

            // Create a test patient
            const testPatient = {
                firstName: 'Jane',
                lastName: 'Smith',
                age: 25,
                gender: 'female',
                placeOfResidence: 'Test Town'
            };

            // Create the patient
            const createResult = await patientManager.createPatient(testPatient);
            if (!createResult.success) {
                throw new Error('Failed to create test patient');
            }

            const patientId = createResult.patientId;

            // Delete the patient
            const deleteResult = await patientManager.deletePatient(patientId);

            if (!deleteResult.success) {
                throw new Error('PatientManager delete failed');
            }

            if (deleteResult.patientId !== patientId) {
                throw new Error('Wrong patient ID returned');
            }

            // Verify patient is gone
            const deletedPatient = await patientManager.getPatient(patientId);
            if (deletedPatient !== null) {
                throw new Error('Patient still exists after deletion');
            }
        });

        // Test 3: Error handling for non-existent patient
        await this.runTest('Delete non-existent patient - Error handling', async () => {
            const dataStorage = new DataStorageManager();
            await dataStorage.initializeStorage();

            const patientManager = new PatientManager();
            await patientManager.initialize(dataStorage);

            try {
                await patientManager.deletePatient('non-existent-id');
                throw new Error('Should have thrown error for non-existent patient');
            } catch (error) {
                if (!error.message.includes('Patient not found')) {
                    throw new Error('Wrong error message for non-existent patient');
                }
            }
        });

        // Test 4: PatientDetailView deletion UI components
        await this.runTest('PatientDetailView - Deletion UI components', async () => {
            // Create a mock patient
            const mockPatient = {
                id: 'test-ui-1',
                firstName: 'Test',
                lastName: 'Patient',
                age: 35,
                gender: 'male',
                placeOfResidence: 'UI Test City',
                visits: [],
                createdAt: Date.now(),
                updatedAt: Date.now(),
                getFullName: () => 'Test Patient',
                toJSON: () => mockPatient
            };

            const patientDetailView = new PatientDetailView(mockPatient);

            // Test render includes delete button
            const html = patientDetailView.render();
            if (!html.includes('Delete Patient')) {
                throw new Error('Delete button not found in rendered HTML');
            }

            if (!html.includes('btn-danger')) {
                throw new Error('Delete button does not have danger styling');
            }

            if (!html.includes('onclick="patientDetailView.handleDelete()"')) {
                throw new Error('Delete button does not have correct onclick handler');
            }
        });

        // Test 5: Confirmation dialog creation
        await this.runTest('PatientDetailView - Confirmation dialog', async () => {
            const mockPatient = {
                id: 'test-confirm-1',
                firstName: 'Confirm',
                lastName: 'Test',
                getFullName: () => 'Confirm Test'
            };

            const patientDetailView = new PatientDetailView(mockPatient);

            // Test confirmation dialog creation
            const confirmationPromise = patientDetailView.showDeleteConfirmationDialog('Confirm Test');

            // Check if modal content was set
            const modalContainer = mockDOM.elements['modal-container'];
            if (!modalContainer.innerHTML.includes('Confirm Patient Deletion')) {
                throw new Error('Confirmation dialog not properly created');
            }

            if (!modalContainer.innerHTML.includes('Confirm Test')) {
                throw new Error('Patient name not included in confirmation dialog');
            }

            if (!modalContainer.innerHTML.includes('This action cannot be undone')) {
                throw new Error('Warning message not included in confirmation dialog');
            }
        });

        // Test 6: Success dialog creation
        await this.runTest('PatientDetailView - Success dialog', async () => {
            const mockPatient = {
                id: 'test-success-1',
                firstName: 'Success',
                lastName: 'Test',
                getFullName: () => 'Success Test'
            };

            const patientDetailView = new PatientDetailView(mockPatient);

            // Test success dialog creation
            patientDetailView.showDeletionSuccessDialog('Success Test');

            // Check if modal content was set
            const modalContainer = mockDOM.elements['modal-container'];
            if (!modalContainer.innerHTML.includes('Patient Deleted Successfully')) {
                throw new Error('Success dialog not properly created');
            }

            if (!modalContainer.innerHTML.includes('Success Test')) {
                throw new Error('Patient name not included in success dialog');
            }

            if (!modalContainer.innerHTML.includes('successfully deleted')) {
                throw new Error('Success message not included in dialog');
            }
        });

        // Test 7: Loading state management
        await this.runTest('PatientDetailView - Loading state management', async () => {
            const mockPatient = {
                id: 'test-loading-1',
                firstName: 'Loading',
                lastName: 'Test',
                getFullName: () => 'Loading Test'
            };

            const patientDetailView = new PatientDetailView(mockPatient);

            // Test loading state
            patientDetailView.showDeletionLoadingState();

            const deleteButton = mockDOM.elements['.delete-button'];
            if (!deleteButton.disabled) {
                throw new Error('Delete button should be disabled during loading');
            }

            if (!deleteButton.innerHTML.includes('Deleting...')) {
                throw new Error('Delete button should show loading text');
            }

            // Test hiding loading state
            patientDetailView.hideDeletionLoadingState();

            if (deleteButton.disabled) {
                throw new Error('Delete button should be enabled after loading');
            }

            if (!deleteButton.innerHTML.includes('Delete Patient')) {
                throw new Error('Delete button should show normal text after loading');
            }
        });

        // Test 8: Complete deletion workflow
        await this.runTest('Complete deletion workflow integration', async () => {
            const dataStorage = new DataStorageManager();
            await dataStorage.initializeStorage();

            const patientManager = new PatientManager();
            await patientManager.initialize(dataStorage);

            // Create a test patient
            const testPatient = {
                firstName: 'Workflow',
                lastName: 'Test',
                age: 40,
                gender: 'female',
                placeOfResidence: 'Workflow City',
                visits: [
                    {
                        visitDate: '2024-01-15',
                        medications: 'Test medication',
                        observations: 'Test observation'
                    }
                ]
            };

            // Create the patient
            const createResult = await patientManager.createPatient(testPatient);
            if (!createResult.success) {
                throw new Error('Failed to create test patient for workflow');
            }

            const patientId = createResult.patientId;
            const patient = await patientManager.getPatient(patientId);

            // Create PatientDetailView
            const patientDetailView = new PatientDetailView(patient, patientManager);

            // Mock the confirmation to return true
            patientDetailView.showDeleteConfirmationDialog = async () => true;
            patientDetailView.showDeletionSuccessDialog = () => { };
            patientDetailView.showDeletionLoadingState = () => { };
            patientDetailView.hideDeletionLoadingState = () => { };
            patientDetailView.handleBack = () => { };

            // Execute deletion
            await patientDetailView.handleDelete();

            // Verify patient is deleted
            const deletedPatient = await patientManager.getPatient(patientId);
            if (deletedPatient !== null) {
                throw new Error('Patient was not deleted in complete workflow');
            }
        });

        // Test 9: Data integrity after deletion
        await this.runTest('Data integrity after deletion', async () => {
            const dataStorage = new DataStorageManager();
            await dataStorage.initializeStorage();

            // Create multiple patients
            const patients = [
                { id: 'integrity-1', firstName: 'Patient', lastName: 'One', age: 30, gender: 'male', placeOfResidence: 'City1' },
                { id: 'integrity-2', firstName: 'Patient', lastName: 'Two', age: 25, gender: 'female', placeOfResidence: 'City2' },
                { id: 'integrity-3', firstName: 'Patient', lastName: 'Three', age: 35, gender: 'male', placeOfResidence: 'City3' }
            ];

            // Save all patients
            for (const patient of patients) {
                await dataStorage.savePatient(patient);
            }

            // Verify all patients exist
            const initialCount = dataStorage.patientsIndex.size;
            if (initialCount !== 3) {
                throw new Error('Not all patients were saved');
            }

            // Delete middle patient
            await dataStorage.deletePatient('integrity-2');

            // Verify correct patient was deleted
            const deletedPatient = await dataStorage.loadPatient('integrity-2');
            if (deletedPatient !== null) {
                throw new Error('Target patient was not deleted');
            }

            // Verify other patients still exist
            const patient1 = await dataStorage.loadPatient('integrity-1');
            const patient3 = await dataStorage.loadPatient('integrity-3');

            if (!patient1 || !patient3) {
                throw new Error('Other patients were incorrectly deleted');
            }

            // Verify index integrity
            if (dataStorage.patientsIndex.size !== 2) {
                throw new Error('Index count is incorrect after deletion');
            }

            if (dataStorage.patientsIndex.has('integrity-2')) {
                throw new Error('Deleted patient still in index');
            }
        });

        // Test 10: Storage cleanup verification
        await this.runTest('Storage cleanup verification', async () => {
            const dataStorage = new DataStorageManager();
            await dataStorage.initializeStorage();

            // Create a patient with complex data
            const complexPatient = {
                id: 'cleanup-test',
                firstName: 'Cleanup',
                lastName: 'Test',
                age: 45,
                gender: 'female',
                placeOfResidence: 'Cleanup City',
                visits: [
                    {
                        visitDate: '2024-01-01',
                        medications: 'Complex medication list with multiple entries',
                        observations: 'Detailed observations with lots of text',
                        additionalComments: 'Additional comments for testing'
                    },
                    {
                        visitDate: '2024-02-01',
                        medications: 'Follow-up medications',
                        observations: 'Follow-up observations'
                    }
                ]
            };

            await dataStorage.savePatient(complexPatient);

            // Verify patient exists in storage
            const storedPatients = JSON.parse(localStorage.getItem('pms_patients') || '{}');
            if (!storedPatients['cleanup-test']) {
                throw new Error('Complex patient was not stored');
            }

            // Delete the patient
            await dataStorage.deletePatient('cleanup-test');

            // Verify complete removal from storage
            const updatedPatients = JSON.parse(localStorage.getItem('pms_patients') || '{}');
            if (updatedPatients['cleanup-test']) {
                throw new Error('Patient data was not completely removed from storage');
            }

            // Verify removal from index
            if (dataStorage.patientsIndex.has('cleanup-test')) {
                throw new Error('Patient was not removed from search index');
            }

            // Verify index file is updated
            const indexData = JSON.parse(localStorage.getItem('pms_patients_index') || '[]');
            const foundInIndex = indexData.find(p => p.id === 'cleanup-test');
            if (foundInIndex) {
                throw new Error('Patient was not removed from stored index');
            }
        });

        this.printResults();
    }

    printResults() {
        console.log('\n📊 Test Results Summary:');
        console.log('========================');

        const passed = this.testResults.filter(r => r.status === 'PASSED').length;
        const failed = this.testResults.filter(r => r.status === 'FAILED').length;

        console.log(`✅ Passed: ${passed}`);
        console.log(`❌ Failed: ${failed}`);
        console.log(`📈 Success Rate: ${((passed / this.testResults.length) * 100).toFixed(1)}%`);

        if (failed > 0) {
            console.log('\n❌ Failed Tests:');
            this.testResults
                .filter(r => r.status === 'FAILED')
                .forEach(r => console.log(`   - ${r.name}: ${r.error}`));
        }

        console.log('\n🎉 Patient Deletion Tests Complete!');
    }
}

// Export for use in test runner
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PatientDeletionTests;
}

// Auto-run if loaded directly
if (typeof window !== 'undefined') {
    window.PatientDeletionTests = PatientDeletionTests;
}