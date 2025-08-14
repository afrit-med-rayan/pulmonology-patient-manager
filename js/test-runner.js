/**
 * Simple Test Runner for Integration Testing
 * Can be run from browser console or integrated into main app
 */

class SimpleTestRunner {
    constructor() {
        this.tests = [];
        this.results = [];
    }

    // Add a test
    addTest(name, testFunction, description = '') {
        this.tests.push({
            name,
            testFunction,
            description,
            status: 'pending'
        });
    }

    // Run all tests
    async runAllTests() {
        console.log('🧪 Starting Simple Test Runner...');
        console.log(`Running ${this.tests.length} tests...`);

        this.results = [];

        for (const test of this.tests) {
            await this.runSingleTest(test);
        }

        this.displayResults();
        return this.results;
    }

    // Run a single test
    async runSingleTest(test) {
        console.log(`🔍 Running: ${test.name}`);

        try {
            const startTime = performance.now();
            const result = await test.testFunction();
            const endTime = performance.now();

            const testResult = {
                name: test.name,
                description: test.description,
                status: result.success ? 'PASSED' : 'FAILED',
                error: result.error || null,
                details: result.details || null,
                duration: Math.round(endTime - startTime)
            };

            this.results.push(testResult);

            if (result.success) {
                console.log(`✅ ${test.name} - PASSED (${testResult.duration}ms)`);
            } else {
                console.log(`❌ ${test.name} - FAILED: ${result.error} (${testResult.duration}ms)`);
            }

        } catch (error) {
            const testResult = {
                name: test.name,
                description: test.description,
                status: 'ERROR',
                error: error.message,
                details: null,
                duration: 0
            };

            this.results.push(testResult);
            console.log(`💥 ${test.name} - ERROR: ${error.message}`);
        }
    }

    // Display test results summary
    displayResults() {
        const passed = this.results.filter(r => r.status === 'PASSED').length;
        const failed = this.results.filter(r => r.status === 'FAILED').length;
        const errors = this.results.filter(r => r.status === 'ERROR').length;
        const total = this.results.length;

        console.log('\n📊 Test Results Summary:');
        console.log('========================');
        console.log(`Total Tests: ${total}`);
        console.log(`Passed: ${passed} ✅`);
        console.log(`Failed: ${failed} ❌`);
        console.log(`Errors: ${errors} 💥`);
        console.log(`Success Rate: ${Math.round((passed / total) * 100)}%`);

        if (failed > 0 || errors > 0) {
            console.log('\n🚨 Failed/Error Tests:');
            this.results
                .filter(r => r.status !== 'PASSED')
                .forEach(result => {
                    console.log(`- ${result.name}: ${result.error}`);
                });
        }

        return {
            total,
            passed,
            failed,
            errors,
            successRate: Math.round((passed / total) * 100),
            results: this.results
        };
    }
}

// Create global test runner instance
window.testRunner = new SimpleTestRunner();

// Define integration tests
function setupIntegrationTests() {
    const runner = window.testRunner;

    // Test 1: Application Initialization
    runner.addTest('app-initialization', async () => {
        if (typeof App === 'undefined') {
            return { success: false, error: 'App class not defined' };
        }

        if (!window.app) {
            return { success: false, error: 'App instance not found' };
        }

        if (!window.app.isInitialized) {
            return { success: false, error: 'App not initialized' };
        }

        return {
            success: true,
            details: 'App class exists and is initialized'
        };
    }, 'Verify application initializes correctly');

    // Test 2: Component Availability
    runner.addTest('component-availability', async () => {
        const requiredComponents = [
            'errorHandler', 'changeTracker', 'modalManager', 'logoManager',
            'uiRouter', 'authManager', 'formManager', 'dataStorage', 'patientManager'
        ];

        if (!window.app || !window.app.components) {
            return { success: false, error: 'App components not available' };
        }

        const missing = requiredComponents.filter(comp => !window.app.components[comp]);

        if (missing.length > 0) {
            return {
                success: false,
                error: `Missing components: ${missing.join(', ')}`,
                details: { missing, available: Object.keys(window.app.components) }
            };
        }

        return {
            success: true,
            details: `All ${requiredComponents.length} components available`
        };
    }, 'Verify all required components are loaded');

    // Test 3: Security Hardening
    runner.addTest('security-hardening', async () => {
        if (!window.securityHardening) {
            return { success: false, error: 'Security hardening not initialized' };
        }

        // Check CSP header
        const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
        if (!cspMeta) {
            return { success: false, error: 'CSP header not found' };
        }

        return {
            success: true,
            details: 'Security hardening active with CSP'
        };
    }, 'Verify security hardening is active');

    // Test 4: Data Storage
    runner.addTest('data-storage', async () => {
        if (!window.app?.components?.dataStorage) {
            return { success: false, error: 'DataStorage component not available' };
        }

        // Test localStorage availability
        try {
            localStorage.setItem('test-key', 'test-value');
            const value = localStorage.getItem('test-key');
            localStorage.removeItem('test-key');

            if (value !== 'test-value') {
                return { success: false, error: 'localStorage not working correctly' };
            }
        } catch (error) {
            return { success: false, error: 'localStorage not available' };
        }

        return {
            success: true,
            details: 'Data storage component available and localStorage working'
        };
    }, 'Verify data storage functionality');

    // Test 5: Patient Manager
    runner.addTest('patient-manager', async () => {
        if (!window.app?.components?.patientManager) {
            return { success: false, error: 'PatientManager component not available' };
        }

        const patientManager = window.app.components.patientManager;

        // Check if key methods exist
        const requiredMethods = ['createPatient', 'searchPatients', 'getPatient', 'updatePatient', 'deletePatient'];
        const missingMethods = requiredMethods.filter(method => typeof patientManager[method] !== 'function');

        if (missingMethods.length > 0) {
            return {
                success: false,
                error: `Missing methods: ${missingMethods.join(', ')}`
            };
        }

        return {
            success: true,
            details: 'PatientManager component available with all required methods'
        };
    }, 'Verify patient management functionality');

    // Test 6: UI Components
    runner.addTest('ui-components', async () => {
        const requiredElements = ['app', 'main-content', 'toast-container', 'modal-container'];
        const missingElements = requiredElements.filter(id => !document.getElementById(id));

        if (missingElements.length > 0) {
            return {
                success: false,
                error: `Missing HTML elements: ${missingElements.join(', ')}`
            };
        }

        // Check if CSS is loaded
        const cssLoaded = document.querySelectorAll('link[rel="stylesheet"]').length > 0;
        if (!cssLoaded) {
            return { success: false, error: 'No CSS files loaded' };
        }

        return {
            success: true,
            details: 'All required UI elements present and CSS loaded'
        };
    }, 'Verify UI components are present');

    // Test 7: Form Manager
    runner.addTest('form-manager', async () => {
        if (!window.app?.components?.formManager) {
            return { success: false, error: 'FormManager component not available' };
        }

        const formManager = window.app.components.formManager;

        // Test basic form rendering
        try {
            const testConfig = {
                fields: [{ name: 'test', type: 'text', required: true }]
            };

            const formHTML = formManager.renderForm(testConfig, {});

            if (!formHTML || !formHTML.includes('test')) {
                return { success: false, error: 'Form rendering failed' };
            }
        } catch (error) {
            return { success: false, error: `Form rendering error: ${error.message}` };
        }

        return {
            success: true,
            details: 'FormManager component working correctly'
        };
    }, 'Verify form management functionality');

    // Test 8: Error Handling
    runner.addTest('error-handling', async () => {
        if (!window.app?.components?.errorHandler) {
            return { success: false, error: 'ErrorHandler component not available' };
        }

        const errorHandler = window.app.components.errorHandler;

        // Test error handling
        try {
            errorHandler.handleError({
                type: 'TEST',
                message: 'Test error',
                context: 'Integration Test'
            });
        } catch (error) {
            return { success: false, error: `Error handling failed: ${error.message}` };
        }

        return {
            success: true,
            details: 'ErrorHandler component working correctly'
        };
    }, 'Verify error handling functionality');
}

// Auto-setup tests when script loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(setupIntegrationTests, 2000); // Wait for app to initialize
    });
} else {
    setTimeout(setupIntegrationTests, 2000);
}

// Convenience function to run tests from console
window.runIntegrationTests = async () => {
    console.log('🚀 Running integration tests...');
    return await window.testRunner.runAllTests();
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SimpleTestRunner, setupIntegrationTests };
}