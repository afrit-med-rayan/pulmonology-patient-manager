/**
 * Simple Test Runner for Data Storage Manager
 * Runs basic functionality tests without requiring Jest
 */

// Load required modules
const path = require('path');
const fs = require('fs');

// Mock global objects for browser environment
global.window = {
    localStorage: null,
    showDirectoryPicker: undefined
};

global.document = {
    createElement: () => ({ textContent: '', innerHTML: '' })
};

global.console = console;

// Load application files
function loadFile(filePath) {
    const fullPath = path.join(__dirname, '..', filePath);
    const content = fs.readFileSync(fullPath, 'utf8');
    eval(content);
}

// Load dependencies
try {
    loadFile('utils/constants.js');
    loadFile('utils/helpers.js');
    loadFile('models/Patient.js');
    loadFile('components/DataStorageManager.js');
} catch (error) {
    console.error('Error loading dependencies:', error.message);
    process.exit(1);
}

// Mock localStorage implementation
class TestLocalStorage {
    constructor() {
        this.store = {};
        this.length = 0;
    }

    getItem(key) {
        return this.store[key] || null;
    }

    setItem(key, value) {
        if (!this.store.hasOwnProperty(key)) {
            this.length++;
        }
        this.store[key] = String(value);
    }

    removeItem(key) {
        if (this.store.hasOwnProperty(key)) {
            delete this.store[key];
            this.length--;
        }
    }

    key(index) {
        const keys = Object.keys(this.store);
        return keys[index] || null;
    }

    clear() {
        this.store = {};
        this.length = 0;
    }
}

// Test utilities
function assert(condition, message) {
    if (!condition) {
        throw new Error(`Assertion failed: ${message}`);
    }
}

function assertEqual(actual, expected, message) {
    if (actual !== expected) {
        throw new Error(`Assertion failed: ${message}. Expected: ${expected}, Actual: ${actual}`);
    }
}

// Test data
const testPatientData = {
    id: 'test-patient-1',
    firstName: 'John',
    lastName: 'Doe',
    dateOfBirth: '1980-01-15',
    age: 44,
    placeOfResidence: 'New York',
    gender: 'male',
    visits: [
        {
            id: 'visit-1',
            visitDate: '2024-01-15',
            medications: 'Albuterol inhaler',
            observations: 'Mild wheezing, improved from last visit',
            additionalComments: 'Patient reports better sleep',
            createdAt: 1705123200000
        }
    ],
    createdAt: 1705123200000,
    updatedAt: 1705123200000
};

// Test runner
async function runTests() {
    console.log('🧪 Starting Data Storage Manager Tests...\n');

    let testsPassed = 0;
    let testsFailed = 0;

    // Setup
    const mockLocalStorage = new TestLocalStorage();
    global.window.localStorage = mockLocalStorage;
    global.localStorage = mockLocalStorage;

    try {
        // Test 1: Initialization
        console.log('📋 Test 1: DataStorageManager Initialization');
        const dataStorageManager = new DataStorageManager();

        assert(dataStorageManager.isInitialized === false, 'Should not be initialized initially');
        assert(dataStorageManager.storageType === 'localStorage', 'Should default to localStorage');
        assert(dataStorageManager.patientsIndex.size === 0, 'Should have empty patients index');

        console.log('✅ Initialization test passed');
        testsPassed++;

        // Test 2: Storage Initialization
        console.log('\n📋 Test 2: Storage Initialization');
        const initResult = await dataStorageManager.initializeStorage();

        assert(initResult.success === true, 'Initialization should succeed');
        assert(initResult.storageType === 'localStorage', 'Should use localStorage');
        assert(dataStorageManager.isInitialized === true, 'Should be initialized after init');
        assert(mockLocalStorage.getItem('pms_patients') === '{}', 'Should create empty patients storage');
        assert(mockLocalStorage.getItem('pms_patients_index') === '[]', 'Should create empty index');

        console.log('✅ Storage initialization test passed');
        testsPassed++;

        // Test 3: Save Patient
        console.log('\n📋 Test 3: Save Patient');
        const patient = new Patient(testPatientData);
        const saveResult = await dataStorageManager.savePatient(patient.toJSON());

        assert(saveResult.success === true, 'Save should succeed');
        assert(saveResult.patientId === testPatientData.id, 'Should return correct patient ID');
        assert(dataStorageManager.patientsIndex.has(testPatientData.id), 'Should add to index');

        const storedPatients = JSON.parse(mockLocalStorage.getItem('pms_patients'));
        assert(storedPatients[testPatientData.id] !== undefined, 'Should store patient data');

        console.log('✅ Save patient test passed');
        testsPassed++;

        // Test 4: Load Patient
        console.log('\n📋 Test 4: Load Patient');
        const loadedPatient = await dataStorageManager.loadPatient(testPatientData.id);

        assert(loadedPatient !== null, 'Should load patient');
        assert(loadedPatient.id === testPatientData.id, 'Should have correct ID');
        assert(loadedPatient.firstName === testPatientData.firstName, 'Should have correct first name');
        assert(loadedPatient.lastName === testPatientData.lastName, 'Should have correct last name');

        console.log('✅ Load patient test passed');
        testsPassed++;

        // Test 5: Search Patients
        console.log('\n📋 Test 5: Search Patients');
        const searchResults = await dataStorageManager.searchPatients({ searchTerm: 'John' });

        assert(searchResults.length === 1, 'Should find one patient');
        assert(searchResults[0].firstName === 'John', 'Should find correct patient');

        console.log('✅ Search patients test passed');
        testsPassed++;

        // Test 6: Delete Patient
        console.log('\n📋 Test 6: Delete Patient');
        const deleteResult = await dataStorageManager.deletePatient(testPatientData.id);

        assert(deleteResult.success === true, 'Delete should succeed');
        assert(deleteResult.patientId === testPatientData.id, 'Should return correct patient ID');
        assert(!dataStorageManager.patientsIndex.has(testPatientData.id), 'Should remove from index');

        const patientsAfterDelete = JSON.parse(mockLocalStorage.getItem('pms_patients'));
        assert(patientsAfterDelete[testPatientData.id] === undefined, 'Should remove from storage');

        console.log('✅ Delete patient test passed');
        testsPassed++;

        // Test 7: Statistics
        console.log('\n📋 Test 7: Statistics');
        // Add patient back for statistics test
        await dataStorageManager.savePatient(patient.toJSON());

        const stats = await dataStorageManager.getStatistics();

        assert(stats.totalPatients === 1, 'Should have correct patient count');
        assert(stats.genderDistribution.male === 1, 'Should have correct gender distribution');
        assert(stats.storageType === 'localStorage', 'Should report correct storage type');

        console.log('✅ Statistics test passed');
        testsPassed++;

        // Test 8: Backup and Restore
        console.log('\n📋 Test 8: Backup and Restore');
        const backupResult = await dataStorageManager.createBackup();

        assert(backupResult.success === true, 'Backup should succeed');
        assert(backupResult.patientsCount === 1, 'Should backup correct number of patients');
        assert(backupResult.backupId.startsWith('pms_backup_'), 'Should have correct backup ID format');

        // Clear data and restore
        await dataStorageManager.clearAllData();
        assert(dataStorageManager.patientsIndex.size === 0, 'Should clear all data');

        const restoreResult = await dataStorageManager.restoreFromBackup(backupResult.backupId);
        assert(restoreResult.success === true, 'Restore should succeed');
        assert(dataStorageManager.patientsIndex.size === 1, 'Should restore patient data');

        console.log('✅ Backup and restore test passed');
        testsPassed++;

        // Test 9: Storage Usage
        console.log('\n📋 Test 9: Storage Usage');
        const usage = await dataStorageManager.getStorageUsage();

        assert(usage.totalSize > 0, 'Should report storage usage');
        assert(usage.patientsCount === 1, 'Should report correct patient count');
        assert(usage.storageType === 'localStorage', 'Should report correct storage type');

        console.log('✅ Storage usage test passed');
        testsPassed++;

        // Test 10: Error Handling
        console.log('\n📋 Test 10: Error Handling');
        try {
            await dataStorageManager.loadPatient('');
            assert(false, 'Should throw error for empty patient ID');
        } catch (error) {
            assert(error.message.includes('Patient ID is required'), 'Should throw correct error');
        }

        try {
            await dataStorageManager.deletePatient('non-existent');
            assert(false, 'Should throw error for non-existent patient');
        } catch (error) {
            assert(error.message.includes('Patient not found'), 'Should throw correct error');
        }

        console.log('✅ Error handling test passed');
        testsPassed++;

    } catch (error) {
        console.log(`❌ Test failed: ${error.message}`);
        testsFailed++;
    }

    // Summary
    console.log('\n📊 Test Results Summary:');
    console.log(`✅ Tests Passed: ${testsPassed}`);
    console.log(`❌ Tests Failed: ${testsFailed}`);
    console.log(`📈 Success Rate: ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1)}%`);

    if (testsFailed === 0) {
        console.log('\n🎉 All tests passed! Data Storage Manager is working correctly.');
        return true;
    } else {
        console.log('\n⚠️  Some tests failed. Please review the implementation.');
        return false;
    }
}

// Run tests
runTests().then(success => {
    process.exit(success ? 0 : 1);
}).catch(error => {
    console.error('Test runner error:', error);
    process.exit(1);
});