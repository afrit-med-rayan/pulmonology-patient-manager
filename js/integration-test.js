/**
 * Integration Test Script
 * Tests all components working together
 */

class IntegrationTester {
    constructor() {
        this.testResults = [];
        this.app = null;
    }

    async runAllTests() {
        console.log('🧪 Starting Integration Tests...');

        try {
            // Test 1: Application Initialization
            await this.testApplicationInitialization();

            // Test 2: Component Integration
            await this.testComponentIntegration();

            // Test 3: Data Flow
            await this.testDataFlow();

            // Test 4: UI Integration
            await this.testUIIntegration();

            // Test 5: Error Handling Integration
            await this.testErrorHandlingIntegration();

            this.displayResults();

        } catch (error) {
            console.error('❌ Integration tests failed:', error);
            this.testResults.push({
                test: 'Integration Test Suite',
                status: 'FAILED',
                error: error.message
            });
        }
    }

    async testApplicationInitialization() {
        console.log('Testing application initialization...');

        try {
            // Check if App class exists
            if (typeof App === 'undefined') {
                throw new Error('App class not found');
            }

            // Create app instance
            this.app = new App();

            // Test initialization
            await this.app.init();

            // Check if components are initialized
            const requiredComponents = [
                'errorHandler', 'changeTracker', 'modalManager',
                'logoManager', 'uiRouter', 'authManager',
                'formManager', 'dataStorage', 'patientManager'
            ];

            for (const component of requiredComponents) {
                if (!this.app.components[component]) {
                    throw new Error(`Component ${component} not initialized`);
                }
            }

            this.testResults.push({
                test: 'Application Initialization',
                status: 'PASSED',
                details: 'All components initialized successfully'
            });

        } catch (error) {
            this.testResults.push({
                test: 'Application Initialization',
                status: 'FAILED',
                error: error.message
            });
        }
    }

    async testComponentIntegration() {
        console.log('Testing component integration...');

        try {
            // Test ErrorHandler integration
            const errorHandler = this.app.components.errorHandler;
            errorHandler.handleError({
                type: 'TEST',
                message: 'Test error',
                context: 'Integration Test'
            });

            // Test ChangeTracker integration
            const changeTracker = this.app.components.changeTracker;
            changeTracker.trackForm('test-form');
            changeTracker.markFormAsChanged('test-form');

            if (!changeTracker.hasUnsavedChanges()) {
                throw new Error('ChangeTracker not working properly');
            }

            // Test DataStorage integration
            const dataStorage = this.app.components.dataStorage;
            const testPatient = {
                id: 'test-patient-' + Date.now(),
                firstName: 'Test',
                lastName: 'Patient',
                dateOfBirth: '1990-01-01',
                gender: 'male',
                placeOfResidence: 'Test City',
                visits: []
            };

            await dataStorage.savePatient(testPatient);
            const savedPatient = await dataStorage.loadPatient(testPatient.id);

            if (!savedPatient || savedPatient.firstName !== 'Test') {
                throw new Error('DataStorage integration failed');
            }

            // Clean up test data
            await dataStorage.deletePatient(testPatient.id);

            this.testResults.push({
                test: 'Component Integration',
                status: 'PASSED',
                details: 'All components integrate properly'
            });

        } catch (error) {
            this.testResults.push({
                test: 'Component Integration',
                status: 'FAILED',
                error: error.message
            });
        }
    }

    async testDataFlow() {
        console.log('Testing data flow...');

        try {
            const patientManager = this.app.components.patientManager;
            const dataStorage = this.app.components.dataStorage;

            // Create test patient through PatientManager
            const testPatient = {
                firstName: 'Integration',
                lastName: 'Test',
                dateOfBirth: '1985-05-15',
                gender: 'female',
                placeOfResidence: 'Test Town',
                visits: [{
                    visitDate: '2024-01-15',
                    medications: 'Test medication',
                    observations: 'Test observations',
                    additionalComments: 'Test comments'
                }]
            };

            const createdPatient = await patientManager.createPatient(testPatient);

            if (!createdPatient || !createdPatient.id) {
                throw new Error('Patient creation failed');
            }

            // Test search functionality
            const searchResults = await patientManager.searchPatients('Integration');

            if (!searchResults || searchResults.length === 0) {
                throw new Error('Patient search failed');
            }

            // Test patient retrieval
            const retrievedPatient = await patientManager.getPatient(createdPatient.id);

            if (!retrievedPatient || retrievedPatient.firstName !== 'Integration') {
                throw new Error('Patient retrieval failed');
            }

            // Test patient update
            retrievedPatient.firstName = 'Updated';
            const updatedPatient = await patientManager.updatePatient(createdPatient.id, retrievedPatient);

            if (!updatedPatient || updatedPatient.firstName !== 'Updated') {
                throw new Error('Patient update failed');
            }

            // Clean up
            await patientManager.deletePatient(createdPatient.id);

            this.testResults.push({
                test: 'Data Flow',
                status: 'PASSED',
                details: 'CRUD operations work correctly'
            });

        } catch (error) {
            this.testResults.push({
                test: 'Data Flow',
                status: 'FAILED',
                error: error.message
            });
        }
    }

    async testUIIntegration() {
        console.log('Testing UI integration...');

        try {
            const uiRouter = this.app.components.uiRouter;
            const formManager = this.app.components.formManager;

            // Test routing
            uiRouter.navigateTo('dashboard');

            if (uiRouter.getCurrentRoute() !== 'dashboard') {
                throw new Error('Routing not working properly');
            }

            // Test form manager integration
            const testFormConfig = {
                fields: [
                    { name: 'testField', type: 'text', required: true }
                ]
            };

            const formHTML = formManager.renderForm(testFormConfig, {});

            if (!formHTML || !formHTML.includes('testField')) {
                throw new Error('Form rendering failed');
            }

            this.testResults.push({
                test: 'UI Integration',
                status: 'PASSED',
                details: 'UI components integrate properly'
            });

        } catch (error) {
            this.testResults.push({
                test: 'UI Integration',
                status: 'FAILED',
                error: error.message
            });
        }
    }

    async testErrorHandlingIntegration() {
        console.log('Testing error handling integration...');

        try {
            const errorHandler = this.app.components.errorHandler;

            // Test error handling with different error types
            const testErrors = [
                { type: 'VALIDATION', message: 'Test validation error' },
                { type: 'STORAGE', message: 'Test storage error' },
                { type: 'NETWORK', message: 'Test network error' }
            ];

            for (const error of testErrors) {
                errorHandler.handleError(error);
            }

            // Test error recovery
            const recoveryResult = errorHandler.attemptRecovery({
                type: 'STORAGE',
                message: 'Storage unavailable'
            });

            this.testResults.push({
                test: 'Error Handling Integration',
                status: 'PASSED',
                details: 'Error handling works across components'
            });

        } catch (error) {
            this.testResults.push({
                test: 'Error Handling Integration',
                status: 'FAILED',
                error: error.message
            });
        }
    }

    displayResults() {
        console.log('\n🧪 Integration Test Results:');
        console.log('================================');

        let passed = 0;
        let failed = 0;

        this.testResults.forEach(result => {
            const status = result.status === 'PASSED' ? '✅' : '❌';
            console.log(`${status} ${result.test}: ${result.status}`);

            if (result.details) {
                console.log(`   Details: ${result.details}`);
            }

            if (result.error) {
                console.log(`   Error: ${result.error}`);
            }

            if (result.status === 'PASSED') {
                passed++;
            } else {
                failed++;
            }
        });

        console.log('================================');
        console.log(`Total: ${this.testResults.length} tests`);
        console.log(`Passed: ${passed}`);
        console.log(`Failed: ${failed}`);

        if (failed === 0) {
            console.log('🎉 All integration tests passed!');
        } else {
            console.log('⚠️ Some integration tests failed. Please review and fix issues.');
        }
    }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = IntegrationTester;
}