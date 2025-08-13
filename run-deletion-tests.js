/**
 * Node.js Test Runner for Patient Deletion Tests
 * Runs the deletion tests in a Node.js environment
 */

// Mock browser globals for Node.js environment
global.window = {};
global.document = {
    getElementById: () => null,
    createElement: () => ({}),
    querySelector: () => null,
    querySelectorAll: () => [],
    addEventListener: () => { }
};

// Load required modules
const fs = require('fs');
const path = require('path');

// Function to load and execute JavaScript files
function loadScript(filePath) {
    const fullPath = path.join(__dirname, filePath);
    const content = fs.readFileSync(fullPath, 'utf8');

    // Create a function to execute the script in the global context
    const script = new Function('require', 'module', 'exports', '__filename', '__dirname', content);
    const moduleObj = { exports: {} };

    try {
        script(require, moduleObj, moduleObj.exports, fullPath, path.dirname(fullPath));

        // If the module exports something, make it globally available
        if (moduleObj.exports && typeof moduleObj.exports === 'function') {
            const moduleName = path.basename(filePath, '.js');
            global[moduleName] = moduleObj.exports;
        }
    } catch (error) {
        console.error(`Error loading ${filePath}:`, error.message);
        throw error;
    }
}

// Load dependencies in order
try {
    console.log('🔄 Loading dependencies...');

    loadScript('js/utils/constants.js');
    loadScript('js/utils/helpers.js');
    loadScript('js/utils/validation.js');
    loadScript('js/models/Patient.js');
    loadScript('js/components/DataStorageManager.js');
    loadScript('js/components/PatientManager.js');
    loadScript('js/components/PatientDetailView.js');
    loadScript('js/tests/patient-deletion.test.js');

    console.log('✅ Dependencies loaded successfully');

    // Run the tests
    async function runTests() {
        console.log('\n🚀 Starting Patient Deletion Tests...\n');

        const testSuite = new PatientDeletionTests();
        await testSuite.runAllTests();

        // Exit with appropriate code
        const failed = testSuite.testResults.filter(r => r.status === 'FAILED').length;
        process.exit(failed > 0 ? 1 : 0);
    }

    runTests().catch(error => {
        console.error('❌ Test execution failed:', error);
        process.exit(1);
    });

} catch (error) {
    console.error('❌ Failed to load dependencies:', error);
    process.exit(1);
}