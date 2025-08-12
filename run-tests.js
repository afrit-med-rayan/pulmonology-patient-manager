/**
 * Simple Node.js Test Runner for Patient Validation Tests
 */

// Load required modules
const fs = require('fs');
const path = require('path');

// Mock DOM elements for Node.js environment
global.document = {
    createElement: () => ({
        textContent: '',
        innerHTML: ''
    })
};

// Load constants and utilities
const constants = require('./js/utils/constants.js');
const helpers = require('./js/utils/helpers.js');
const validation = require('./js/utils/validation.js');

// Make constants and helpers globally available
Object.assign(global, constants);
Object.assign(global, helpers);
Object.assign(global, validation);

// Load Patient model by requiring it directly
try {
    const PatientModule = require('./js/models/Patient.js');
    global.Patient = PatientModule;
} catch (error) {
    // Fallback: load and evaluate the code
    const patientCode = fs.readFileSync('./js/models/Patient.js', 'utf8');
    // Create a simple module context
    const module = { exports: {} };
    const patientCodeForEval = patientCode + '\nif (typeof Patient !== "undefined") module.exports = Patient;';
    eval(patientCodeForEval);
    global.Patient = module.exports;
}

// Simple test framework
let testResults = [];
let currentSuite = '';

global.describe = function (suiteName, testFunction) {
    currentSuite = suiteName;
    console.log(`\n=== ${suiteName} ===`);
    try {
        testFunction();
    } catch (error) {
        console.error(`Error in test suite ${suiteName}:`, error);
    }
};

global.test = function (testName, testFunction) {
    try {
        testFunction();
        testResults.push({
            suite: currentSuite,
            test: testName,
            passed: true,
            error: null
        });
        console.log(`✓ ${testName}`);
    } catch (error) {
        testResults.push({
            suite: currentSuite,
            test: testName,
            passed: false,
            error: error.message
        });
        console.log(`✗ ${testName}: ${error.message}`);
    }
};

global.beforeEach = function (setupFunction) {
    setupFunction();
};

global.expect = function (actual) {
    return {
        toBe: (expected) => {
            if (actual !== expected) {
                throw new Error(`Expected ${expected}, but got ${actual}`);
            }
        },
        toEqual: (expected) => {
            if (JSON.stringify(actual) !== JSON.stringify(expected)) {
                throw new Error(`Expected ${JSON.stringify(expected)}, but got ${JSON.stringify(actual)}`);
            }
        },
        toBeDefined: () => {
            if (actual === undefined) {
                throw new Error(`Expected value to be defined, but got undefined`);
            }
        },
        toBeNull: () => {
            if (actual !== null) {
                throw new Error(`Expected null, but got ${actual}`);
            }
        },
        toHaveLength: (expected) => {
            if (!actual || actual.length !== expected) {
                throw new Error(`Expected length ${expected}, but got ${actual ? actual.length : 'undefined'}`);
            }
        },
        toContain: (expected) => {
            if (!actual || !actual.includes(expected)) {
                throw new Error(`Expected array to contain ${expected}`);
            }
        },
        toBeGreaterThan: (expected) => {
            if (actual <= expected) {
                throw new Error(`Expected ${actual} to be greater than ${expected}`);
            }
        }
    };
};

// Load and run tests
try {
    console.log('Running Patient Management System Tests...\n');

    // Load test file
    const testCode = fs.readFileSync('./js/tests/patient-validation.test.js', 'utf8');
    // Remove the browser-specific parts and evaluate
    const testCodeForEval = testCode.replace(/if \(typeof describe.*[\s\S]*$/, '');
    eval(testCodeForEval);

    // Display summary
    const passed = testResults.filter(r => r.passed).length;
    const failed = testResults.filter(r => !r.passed).length;

    console.log('\n' + '='.repeat(50));
    console.log('TEST SUMMARY');
    console.log('='.repeat(50));
    console.log(`Total tests: ${testResults.length}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);

    if (failed > 0) {
        console.log('\nFailed tests:');
        testResults.filter(r => !r.passed).forEach(result => {
            console.log(`- ${result.suite} - ${result.test}: ${result.error}`);
        });
        process.exit(1);
    } else {
        console.log('\n🎉 All tests passed!');
        process.exit(0);
    }

} catch (error) {
    console.error('Error running tests:', error);
    process.exit(1);
}