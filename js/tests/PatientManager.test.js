/**
 * Patient Manager Tests
 * Tests for patient creation functionality
 */

// Mock dependencies for testing
class MockDataStorageManager {
    constructor() {
        this.isInitialized = true;
        this.patients = {};
        this.patientsIndex = new Map();
    }

    async initializeStorage() {
        return { success: true };
    }

    async savePatient(patientData) {
        this.patients[patientData.id] = patientData;
        this.patientsIndex.set(patientData.id, {
            id: patientData.id,
            firstName: patientData.firstName,
            lastName: patientData.lastName,
            fullName: `${patientData.firstName} ${patientData.lastName}`,
            age: patientData.age,
            gender: patientData.gender,
            placeOfResidence: patientData.placeOfResidence,
            createdAt: patientData.createdAt,
            updatedAt: patientData.updatedAt
        });
        return { success: true, message: 'Patient saved successfully' };
    }

    async loadPatient(patientId) {
        const patientData = this.patients[patientId];
        return patientData ? Patient.fromJSON(patientData) : null;
    }
}

/**
 * Test patient creation functionality
 */
async function testPatientCreation() {
    console.log('Testing patient creation functionality...');

    try {
        // Initialize components
        const mockStorage = new MockDataStorageManager();
        const patientManager = new PatientManager();
        await patientManager.initialize(mockStorage);

        // Test data
        const testPatientData = {
            firstName: 'John',
            lastName: 'Doe',
            dateOfBirth: '1980-05-15',
            placeOfResidence: 'New York',
            gender: 'male',
            visits: [
                {
                    visitDate: '2024-01-15',
                    medications: 'Albuterol inhaler',
                    observations: 'Patient shows improvement in breathing',
                    additionalComments: 'Follow up in 2 weeks'
                }
            ]
        };

        // Test 1: Create patient with valid data
        console.log('Test 1: Creating patient with valid data...');
        const result = await patientManager.createPatient(testPatientData);

        if (result.success) {
            console.log('✓ Patient created successfully');
            console.log('  Patient ID:', result.patientId);
            console.log('  Patient Name:', result.patient.firstName, result.patient.lastName);
            console.log('  Age:', result.patient.age);
        } else {
            console.error('✗ Failed to create patient:', result.message);
            return false;
        }

        // Test 2: Verify patient can be retrieved
        console.log('Test 2: Retrieving created patient...');
        const retrievedPatient = await patientManager.getPatient(result.patientId);

        if (retrievedPatient) {
            console.log('✓ Patient retrieved successfully');
            console.log('  Full Name:', retrievedPatient.getFullName());
            console.log('  Age:', retrievedPatient.age);
            console.log('  Visits:', retrievedPatient.visits.length);
        } else {
            console.error('✗ Failed to retrieve patient');
            return false;
        }

        // Test 3: Test validation with invalid data
        console.log('Test 3: Testing validation with invalid data...');
        const invalidData = {
            firstName: '', // Empty first name should fail
            lastName: 'Test',
            dateOfBirth: '2030-01-01', // Future date should fail
            placeOfResidence: 'Test City',
            gender: 'invalid' // Invalid gender should fail
        };

        try {
            await patientManager.createPatient(invalidData);
            console.error('✗ Validation should have failed but didn\'t');
            return false;
        } catch (error) {
            console.log('✓ Validation correctly rejected invalid data');
            console.log('  Error:', error.message);
        }

        // Test 4: Test patient statistics
        console.log('Test 4: Testing patient statistics...');
        const stats = await patientManager.getPatientStatistics();

        if (stats && stats.totalPatients >= 1) {
            console.log('✓ Statistics retrieved successfully');
            console.log('  Total Patients:', stats.totalPatients);
            console.log('  Storage Type:', stats.storageType);
        } else {
            console.error('✗ Failed to retrieve statistics');
            return false;
        }

        console.log('All tests passed! ✓');
        return true;

    } catch (error) {
        console.error('Test failed with error:', error);
        return false;
    }
}

/**
 * Test form integration
 */
function testFormIntegration() {
    console.log('Testing form integration...');

    // Test form data extraction
    const mockFormData = {
        firstName: 'Jane',
        lastName: 'Smith',
        dateOfBirth: '1985-03-20',
        age: 39,
        placeOfResidence: 'Los Angeles',
        gender: 'female',
        visits: [
            {
                id: 'visit-1',
                visitDate: '2024-02-01',
                medications: 'Prednisone',
                observations: 'Reduced inflammation',
                additionalComments: 'Continue current treatment'
            }
        ]
    };

    // Validate form data structure
    const patient = new Patient(mockFormData);
    const validation = patient.validate();

    if (validation.isValid) {
        console.log('✓ Form data validation passed');
        console.log('  Patient:', patient.getFullName());
        console.log('  Age:', patient.age);
        console.log('  Visits:', patient.visits.length);
        return true;
    } else {
        console.error('✗ Form data validation failed');
        console.error('  Errors:', validation.errors);
        return false;
    }
}

/**
 * Run all tests
 */
async function runPatientManagerTests() {
    console.log('=== Patient Manager Tests ===');

    const test1 = await testPatientCreation();
    const test2 = testFormIntegration();

    const allPassed = test1 && test2;

    console.log('=== Test Results ===');
    console.log('Patient Creation Tests:', test1 ? 'PASSED' : 'FAILED');
    console.log('Form Integration Tests:', test2 ? 'PASSED' : 'FAILED');
    console.log('Overall Result:', allPassed ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED');

    return allPassed;
}

// Export for use in test runner
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        testPatientCreation,
        testFormIntegration,
        runPatientManagerTests
    };
}