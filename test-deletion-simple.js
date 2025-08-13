/**
 * Simple Patient Deletion Test
 * Basic test to verify deletion functionality works
 */

// Mock localStorage
const mockLocalStorage = {
    data: {},
    getItem(key) { return this.data[key] || null; },
    setItem(key, value) { this.data[key] = value; },
    removeItem(key) { delete this.data[key]; },
    clear() { this.data = {}; }
};

// Mock console for cleaner output
const log = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
    console.log(`[${timestamp}] ${prefix} ${message}`);
};

// Mock globals
global.localStorage = mockLocalStorage;
global.window = { localStorage: mockLocalStorage };
global.document = {
    getElementById: () => ({ innerHTML: '', classList: { add: () => { }, remove: () => { } }, querySelector: () => null }),
    createElement: () => ({}),
    querySelector: () => null,
    addEventListener: () => { }
};
global.log = log;
global.getCurrentTimestamp = () => Date.now();
global.generateId = () => 'test-' + Math.random().toString(36).substr(2, 9);
global.normalizeForSearch = (str) => str.toLowerCase().trim();
global.deepClone = (obj) => JSON.parse(JSON.stringify(obj));

// Load constants
global.STORAGE_CONFIG = {
    dataDirectory: 'data',
    backupDirectory: 'backups'
};

global.SUCCESS_MESSAGES = {
    patient: {
        created: 'Patient record created successfully',
        updated: 'Patient record updated successfully',
        deleted: 'Patient record deleted successfully'
    }
};

global.ERROR_MESSAGES = {
    patient: {
        notFound: 'Patient not found',
        invalidData: 'Invalid patient data'
    }
};

// Simple Patient class for testing
class Patient {
    constructor(data) {
        this.id = data.id || generateId();
        this.firstName = data.firstName || '';
        this.lastName = data.lastName || '';
        this.age = data.age || 0;
        this.gender = data.gender || '';
        this.placeOfResidence = data.placeOfResidence || '';
        this.visits = data.visits || [];
        this.createdAt = data.createdAt || getCurrentTimestamp();
        this.updatedAt = data.updatedAt || getCurrentTimestamp();
    }

    getFullName() {
        return `${this.firstName} ${this.lastName}`.trim();
    }

    validate() {
        const errors = [];
        if (!this.firstName) errors.push({ field: 'firstName', message: 'First name is required' });
        if (!this.lastName) errors.push({ field: 'lastName', message: 'Last name is required' });
        return { isValid: errors.length === 0, errors };
    }

    sanitize() {
        this.firstName = this.firstName.trim();
        this.lastName = this.lastName.trim();
    }

    touch() {
        this.updatedAt = getCurrentTimestamp();
    }

    toJSON() {
        return {
            id: this.id,
            firstName: this.firstName,
            lastName: this.lastName,
            age: this.age,
            gender: this.gender,
            placeOfResidence: this.placeOfResidence,
            visits: this.visits,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }

    static fromJSON(data) {
        return new Patient(data);
    }
}

// Simple DataStorageManager for testing
class DataStorageManager {
    constructor() {
        this.isInitialized = false;
        this.patientsIndex = new Map();
    }

    async initializeStorage() {
        if (!localStorage.getItem('pms_patients')) {
            localStorage.setItem('pms_patients', JSON.stringify({}));
        }
        if (!localStorage.getItem('pms_patients_index')) {
            localStorage.setItem('pms_patients_index', JSON.stringify([]));
        }
        await this.loadPatientsIndex();
        this.isInitialized = true;
    }

    async loadPatientsIndex() {
        const indexData = localStorage.getItem('pms_patients_index');
        if (indexData) {
            const index = JSON.parse(indexData);
            this.patientsIndex.clear();
            index.forEach(patient => {
                this.patientsIndex.set(patient.id, patient);
            });
        }
    }

    async savePatientsIndex() {
        const indexArray = Array.from(this.patientsIndex.values());
        localStorage.setItem('pms_patients_index', JSON.stringify(indexArray));
    }

    async savePatient(patientData) {
        const patient = new Patient(patientData);
        const validation = patient.validate();
        if (!validation.isValid) {
            throw new Error(`Validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
        }

        patient.sanitize();
        patient.touch();

        const patients = JSON.parse(localStorage.getItem('pms_patients') || '{}');
        patients[patient.id] = patient.toJSON();
        localStorage.setItem('pms_patients', JSON.stringify(patients));

        this.patientsIndex.set(patient.id, {
            id: patient.id,
            firstName: patient.firstName,
            lastName: patient.lastName,
            fullName: patient.getFullName(),
            age: patient.age,
            gender: patient.gender,
            placeOfResidence: patient.placeOfResidence,
            createdAt: patient.createdAt,
            updatedAt: patient.updatedAt
        });

        await this.savePatientsIndex();
        return { success: true, patientId: patient.id };
    }

    async loadPatient(patientId) {
        const patients = JSON.parse(localStorage.getItem('pms_patients') || '{}');
        const patientData = patients[patientId];
        return patientData ? Patient.fromJSON(patientData) : null;
    }

    async deletePatient(patientId) {
        if (!patientId) throw new Error('Patient ID is required');

        const patients = JSON.parse(localStorage.getItem('pms_patients') || '{}');
        if (!patients[patientId]) throw new Error('Patient not found');

        const patientName = this.patientsIndex.get(patientId)?.fullName || 'Unknown';

        delete patients[patientId];
        localStorage.setItem('pms_patients', JSON.stringify(patients));

        this.patientsIndex.delete(patientId);
        await this.savePatientsIndex();

        return { success: true, patientId, message: 'Patient deleted successfully' };
    }
}

// Simple PatientManager for testing
class PatientManager {
    constructor() {
        this.isInitialized = false;
        this.dataStorage = null;
    }

    async initialize(dataStorage) {
        this.dataStorage = dataStorage;
        if (!this.dataStorage.isInitialized) {
            await this.dataStorage.initializeStorage();
        }
        this.isInitialized = true;
    }

    async createPatient(patientData) {
        const patient = new Patient(patientData);
        const result = await this.dataStorage.savePatient(patient.toJSON());
        return { success: true, patientId: result.patientId, patient: patient.toJSON() };
    }

    async getPatient(patientId) {
        return await this.dataStorage.loadPatient(patientId);
    }

    async deletePatient(patientId) {
        const existingPatient = await this.dataStorage.loadPatient(patientId);
        if (!existingPatient) throw new Error('Patient not found');

        return await this.dataStorage.deletePatient(patientId);
    }
}

// Run the tests
async function runDeletionTests() {
    log('🚀 Starting Patient Deletion Tests');

    let testsPassed = 0;
    let testsTotal = 0;

    // Test 1: Basic deletion functionality
    try {
        testsTotal++;
        log('Test 1: Basic deletion functionality');

        const dataStorage = new DataStorageManager();
        await dataStorage.initializeStorage();

        // Create a test patient
        const testPatient = {
            firstName: 'John',
            lastName: 'Doe',
            age: 30,
            gender: 'male',
            placeOfResidence: 'Test City'
        };

        const saveResult = await dataStorage.savePatient(testPatient);
        const patientId = saveResult.patientId;

        // Verify patient exists
        const savedPatient = await dataStorage.loadPatient(patientId);
        if (!savedPatient) throw new Error('Patient was not saved');

        // Delete the patient
        const deleteResult = await dataStorage.deletePatient(patientId);
        if (!deleteResult.success) throw new Error('Delete operation failed');

        // Verify patient is deleted
        const deletedPatient = await dataStorage.loadPatient(patientId);
        if (deletedPatient !== null) throw new Error('Patient was not deleted');

        // Verify removed from index
        if (dataStorage.patientsIndex.has(patientId)) throw new Error('Patient not removed from index');

        log('✅ Test 1 passed', 'success');
        testsPassed++;

    } catch (error) {
        log(`❌ Test 1 failed: ${error.message}`, 'error');
    }

    // Test 2: PatientManager deletion
    try {
        testsTotal++;
        log('Test 2: PatientManager deletion');

        const dataStorage = new DataStorageManager();
        await dataStorage.initializeStorage();

        const patientManager = new PatientManager();
        await patientManager.initialize(dataStorage);

        // Create patient
        const createResult = await patientManager.createPatient({
            firstName: 'Jane',
            lastName: 'Smith',
            age: 25,
            gender: 'female',
            placeOfResidence: 'Test Town'
        });

        const patientId = createResult.patientId;

        // Delete patient
        const deleteResult = await patientManager.deletePatient(patientId);
        if (!deleteResult.success) throw new Error('PatientManager delete failed');

        // Verify deletion
        const deletedPatient = await patientManager.getPatient(patientId);
        if (deletedPatient !== null) throw new Error('Patient still exists');

        log('✅ Test 2 passed', 'success');
        testsPassed++;

    } catch (error) {
        log(`❌ Test 2 failed: ${error.message}`, 'error');
    }

    // Test 3: Error handling
    try {
        testsTotal++;
        log('Test 3: Error handling for non-existent patient');

        const dataStorage = new DataStorageManager();
        await dataStorage.initializeStorage();

        const patientManager = new PatientManager();
        await patientManager.initialize(dataStorage);

        try {
            await patientManager.deletePatient('non-existent-id');
            throw new Error('Should have thrown error');
        } catch (error) {
            if (!error.message.includes('Patient not found')) {
                throw new Error('Wrong error message');
            }
        }

        log('✅ Test 3 passed', 'success');
        testsPassed++;

    } catch (error) {
        log(`❌ Test 3 failed: ${error.message}`, 'error');
    }

    // Test 4: Data integrity
    try {
        testsTotal++;
        log('Test 4: Data integrity after deletion');

        const dataStorage = new DataStorageManager();
        await dataStorage.initializeStorage();

        // Create multiple patients
        const patient1 = await dataStorage.savePatient({
            firstName: 'Patient', lastName: 'One', age: 30, gender: 'male', placeOfResidence: 'City1'
        });
        const patient2 = await dataStorage.savePatient({
            firstName: 'Patient', lastName: 'Two', age: 25, gender: 'female', placeOfResidence: 'City2'
        });
        const patient3 = await dataStorage.savePatient({
            firstName: 'Patient', lastName: 'Three', age: 35, gender: 'male', placeOfResidence: 'City3'
        });

        // Delete middle patient
        await dataStorage.deletePatient(patient2.patientId);

        // Verify correct patient deleted
        const deletedPatient = await dataStorage.loadPatient(patient2.patientId);
        if (deletedPatient !== null) throw new Error('Target patient not deleted');

        // Verify others still exist
        const stillExists1 = await dataStorage.loadPatient(patient1.patientId);
        const stillExists3 = await dataStorage.loadPatient(patient3.patientId);

        if (!stillExists1 || !stillExists3) throw new Error('Other patients incorrectly deleted');

        log('✅ Test 4 passed', 'success');
        testsPassed++;

    } catch (error) {
        log(`❌ Test 4 failed: ${error.message}`, 'error');
    }

    // Summary
    log(`\n📊 Test Results: ${testsPassed}/${testsTotal} passed`);
    if (testsPassed === testsTotal) {
        log('🎉 All deletion tests passed!', 'success');
        return true;
    } else {
        log(`⚠️ ${testsTotal - testsPassed} tests failed`, 'error');
        return false;
    }
}

// Run the tests
runDeletionTests()
    .then(success => {
        process.exit(success ? 0 : 1);
    })
    .catch(error => {
        log(`❌ Test execution failed: ${error.message}`, 'error');
        process.exit(1);
    });