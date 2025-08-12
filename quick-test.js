// Quick test to verify Patient model functionality
const constants = require('./js/utils/constants.js');
const helpers = require('./js/utils/helpers.js');
const validation = require('./js/utils/validation.js');

// Make available globally
Object.assign(global, constants);
Object.assign(global, helpers);
Object.assign(global, validation);

// Mock DOM for Node.js
global.document = {
    createElement: () => ({
        textContent: '',
        innerHTML: ''
    })
};

// Load Patient
const PatientModule = require('./js/models/Patient.js');
const Patient = PatientModule;

console.log('Testing Patient Model...\n');

// Test 1: Create patient
const patient = new Patient({
    firstName: 'John',
    lastName: 'Doe',
    dateOfBirth: '1990-01-01',
    placeOfResidence: 'New York',
    gender: 'male'
});

console.log('1. Patient created:', patient.getFullName());

// Test 2: Validate patient
const validation1 = patient.validate();
console.log('2. Validation result:', validation1.isValid ? 'PASS' : 'FAIL');
if (!validation1.isValid) {
    console.log('   Errors:', validation1.errors);
}

// Test 3: Add visit
const visit = patient.addVisit({
    visitDate: '2024-01-15',
    medications: 'Aspirin',
    observations: 'Patient feeling better'
});

console.log('3. Visit added:', visit.id ? 'PASS' : 'FAIL');
console.log('   Visits count:', patient.visits.length);

// Test 4: Update visit
const updated = patient.updateVisit(visit.id, {
    medications: 'Ibuprofen'
});

console.log('4. Visit updated:', updated ? 'PASS' : 'FAIL');
console.log('   Updated medication:', patient.visits[0].medications);

// Test 5: Get latest visit
const latest = patient.getLatestVisit();
console.log('5. Latest visit:', latest ? 'PASS' : 'FAIL');
console.log('   Latest visit date:', latest ? latest.visitDate : 'null');

// Test 6: Form validation
const formData = {
    firstName: 'Jane',
    lastName: 'Smith',
    dateOfBirth: '1985-05-15',
    placeOfResidence: 'Boston',
    gender: 'female'
};

const formValidation = validatePatientForm(formData);
console.log('6. Form validation:', formValidation.isValid ? 'PASS' : 'FAIL');

console.log('\nAll basic tests completed!');