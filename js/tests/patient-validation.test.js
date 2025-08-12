/**
 * Unit Tests for Patient Data Model and Validation
 * Tests for Patient class and validation utilities
 */

// Mock constants and helpers for testing
const VALIDATION_RULES = {
    patient: {
        firstName: {
            required: true,
            minLength: 2,
            maxLength: 50,
            pattern: /^[a-zA-Z\s\-']+$/
        },
        lastName: {
            required: true,
            minLength: 2,
            maxLength: 50,
            pattern: /^[a-zA-Z\s\-']+$/
        },
        dateOfBirth: {
            required: true,
            maxDate: new Date()
        },
        placeOfResidence: {
            required: true,
            minLength: 2,
            maxLength: 100
        },
        gender: {
            required: true,
            options: ['male', 'female', 'other']
        }
    }
};

const ERROR_MESSAGES = {
    validation: {
        required: 'This field is required',
        minLength: 'Must be at least {min} characters long',
        maxLength: 'Must be no more than {max} characters long',
        pattern: 'Please enter a valid value',
        date: 'Please enter a valid date',
        future: 'Date cannot be in the future'
    }
};

// Mock helper functions
function generateId() {
    return 'test-id-' + Math.random().toString(36).substr(2, 9);
}

function getCurrentTimestamp() {
    return Date.now();
}

function calculateAge(dateOfBirth) {
    if (!dateOfBirth) return 0;
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

function sanitizeHtml(html) {
    if (!html) return '';
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
}

function containsSearchTerm(str, searchTerm) {
    if (!str || !searchTerm) return false;
    return str.toLowerCase().includes(searchTerm.toLowerCase());
}

// Test Suite for Patient Model
describe('Patient Model Tests', () => {

    describe('Patient Constructor', () => {
        test('should create patient with default values', () => {
            const patient = new Patient();

            expect(patient.id).toBeDefined();
            expect(patient.firstName).toBe('');
            expect(patient.lastName).toBe('');
            expect(patient.dateOfBirth).toBeNull();
            expect(patient.age).toBe(0);
            expect(patient.placeOfResidence).toBe('');
            expect(patient.gender).toBe('');
            expect(patient.visits).toEqual([]);
            expect(patient.createdAt).toBeDefined();
            expect(patient.updatedAt).toBeDefined();
        });

        test('should create patient with provided data', () => {
            const patientData = {
                firstName: 'John',
                lastName: 'Doe',
                dateOfBirth: '1990-01-01',
                placeOfResidence: 'New York',
                gender: 'male'
            };

            const patient = new Patient(patientData);

            expect(patient.firstName).toBe('John');
            expect(patient.lastName).toBe('Doe');
            expect(patient.dateOfBirth).toBe('1990-01-01');
            expect(patient.placeOfResidence).toBe('New York');
            expect(patient.gender).toBe('male');
        });
    });

    describe('Patient Age Calculation', () => {
        test('should calculate age correctly', () => {
            const patient = new Patient({
                dateOfBirth: '1990-01-01'
            });

            const expectedAge = calculateAge('1990-01-01');
            expect(patient.calculateAge()).toBe(expectedAge);
        });

        test('should return 0 for invalid date of birth', () => {
            const patient = new Patient();
            expect(patient.calculateAge()).toBe(0);
        });

        test('should update age when updateAge is called', () => {
            const patient = new Patient({
                dateOfBirth: '1990-01-01',
                age: 25 // Incorrect age
            });

            patient.updateAge();
            const expectedAge = calculateAge('1990-01-01');
            expect(patient.age).toBe(expectedAge);
        });
    });

    describe('Patient Visit Management', () => {
        let patient;

        beforeEach(() => {
            patient = new Patient({
                firstName: 'John',
                lastName: 'Doe'
            });
        });

        test('should add visit successfully', () => {
            const visitData = {
                visitDate: '2024-01-15',
                medications: 'Aspirin',
                observations: 'Patient feeling better'
            };

            const visit = patient.addVisit(visitData);

            expect(visit.id).toBeDefined();
            expect(visit.visitDate).toBe('2024-01-15');
            expect(visit.medications).toBe('Aspirin');
            expect(visit.observations).toBe('Patient feeling better');
            expect(patient.visits).toHaveLength(1);
        });

        test('should update visit successfully', () => {
            const visit = patient.addVisit({
                visitDate: '2024-01-15',
                medications: 'Aspirin'
            });

            const updated = patient.updateVisit(visit.id, {
                medications: 'Ibuprofen',
                observations: 'Updated observations'
            });

            expect(updated).toBe(true);
            expect(patient.visits[0].medications).toBe('Ibuprofen');
            expect(patient.visits[0].observations).toBe('Updated observations');
        });

        test('should return false when updating non-existent visit', () => {
            const updated = patient.updateVisit('non-existent-id', {
                medications: 'Test'
            });

            expect(updated).toBe(false);
        });

        test('should remove visit successfully', () => {
            const visit = patient.addVisit({
                visitDate: '2024-01-15'
            });

            const removed = patient.removeVisit(visit.id);

            expect(removed).toBe(true);
            expect(patient.visits).toHaveLength(0);
        });

        test('should return false when removing non-existent visit', () => {
            const removed = patient.removeVisit('non-existent-id');
            expect(removed).toBe(false);
        });

        test('should get latest visit', () => {
            patient.addVisit({ visitDate: '2024-01-10' });
            patient.addVisit({ visitDate: '2024-01-15' });
            patient.addVisit({ visitDate: '2024-01-05' });

            const latest = patient.getLatestVisit();
            expect(latest.visitDate).toBe('2024-01-15');
        });

        test('should return null for latest visit when no visits exist', () => {
            const latest = patient.getLatestVisit();
            expect(latest).toBeNull();
        });

        test('should get visits sorted by date', () => {
            patient.addVisit({ visitDate: '2024-01-10' });
            patient.addVisit({ visitDate: '2024-01-15' });
            patient.addVisit({ visitDate: '2024-01-05' });

            const sorted = patient.getVisitsSortedByDate();
            expect(sorted[0].visitDate).toBe('2024-01-15');
            expect(sorted[1].visitDate).toBe('2024-01-10');
            expect(sorted[2].visitDate).toBe('2024-01-05');
        });
    });

    describe('Patient Validation', () => {
        test('should validate valid patient data', () => {
            const patient = new Patient({
                firstName: 'John',
                lastName: 'Doe',
                dateOfBirth: '1990-01-01',
                placeOfResidence: 'New York',
                gender: 'male'
            });

            const result = patient.validate();
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        test('should fail validation for missing required fields', () => {
            const patient = new Patient();
            const result = patient.validate();

            expect(result.isValid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);

            const fieldErrors = result.errors.map(error => error.field);
            expect(fieldErrors).toContain('firstName');
            expect(fieldErrors).toContain('lastName');
            expect(fieldErrors).toContain('dateOfBirth');
            expect(fieldErrors).toContain('placeOfResidence');
            expect(fieldErrors).toContain('gender');
        });

        test('should fail validation for invalid first name', () => {
            const patient = new Patient({
                firstName: 'J', // Too short
                lastName: 'Doe',
                dateOfBirth: '1990-01-01',
                placeOfResidence: 'New York',
                gender: 'male'
            });

            const result = patient.validate();
            expect(result.isValid).toBe(false);

            const firstNameError = result.errors.find(error => error.field === 'firstName');
            expect(firstNameError).toBeDefined();
        });

        test('should fail validation for invalid date of birth', () => {
            const futureDate = new Date();
            futureDate.setFullYear(futureDate.getFullYear() + 1);

            const patient = new Patient({
                firstName: 'John',
                lastName: 'Doe',
                dateOfBirth: futureDate.toISOString().split('T')[0],
                placeOfResidence: 'New York',
                gender: 'male'
            });

            const result = patient.validate();
            expect(result.isValid).toBe(false);

            const dobError = result.errors.find(error => error.field === 'dateOfBirth');
            expect(dobError).toBeDefined();
        });

        test('should fail validation for invalid gender', () => {
            const patient = new Patient({
                firstName: 'John',
                lastName: 'Doe',
                dateOfBirth: '1990-01-01',
                placeOfResidence: 'New York',
                gender: 'invalid-gender'
            });

            const result = patient.validate();
            expect(result.isValid).toBe(false);

            const genderError = result.errors.find(error => error.field === 'gender');
            expect(genderError).toBeDefined();
        });
    });

    describe('Patient Utility Methods', () => {
        let patient;

        beforeEach(() => {
            patient = new Patient({
                firstName: 'John',
                lastName: 'Doe',
                dateOfBirth: '1990-01-01',
                placeOfResidence: 'New York',
                gender: 'male'
            });
        });

        test('should get full name', () => {
            expect(patient.getFullName()).toBe('John Doe');
        });

        test('should get display name with age', () => {
            patient.updateAge();
            const displayName = patient.getDisplayName();
            expect(displayName).toContain('John Doe');
            expect(displayName).toContain('years old');
        });

        test('should match search terms', () => {
            expect(patient.matchesSearch('John')).toBe(true);
            expect(patient.matchesSearch('Doe')).toBe(true);
            expect(patient.matchesSearch('john doe')).toBe(true);
            expect(patient.matchesSearch('New York')).toBe(true);
            expect(patient.matchesSearch('Smith')).toBe(false);
        });

        test('should sanitize patient data', () => {
            patient.firstName = '<script>alert("xss")</script>John';
            patient.lastName = 'Doe<img src="x" onerror="alert(1)">';

            patient.sanitize();

            expect(patient.firstName).not.toContain('<script>');
            expect(patient.lastName).not.toContain('<img');
        });

        test('should convert to JSON', () => {
            const json = patient.toJSON();

            expect(json.id).toBe(patient.id);
            expect(json.firstName).toBe('John');
            expect(json.lastName).toBe('Doe');
            expect(json.dateOfBirth).toBe('1990-01-01');
            expect(json.placeOfResidence).toBe('New York');
            expect(json.gender).toBe('male');
        });

        test('should create from JSON', () => {
            const json = {
                id: 'test-id',
                firstName: 'Jane',
                lastName: 'Smith',
                dateOfBirth: '1985-05-15',
                placeOfResidence: 'Boston',
                gender: 'female'
            };

            const patient = Patient.fromJSON(json);

            expect(patient.id).toBe('test-id');
            expect(patient.firstName).toBe('Jane');
            expect(patient.lastName).toBe('Smith');
            expect(patient.dateOfBirth).toBe('1985-05-15');
            expect(patient.placeOfResidence).toBe('Boston');
            expect(patient.gender).toBe('female');
        });

        test('should create new empty patient', () => {
            const newPatient = Patient.createNew();

            expect(newPatient.id).toBeDefined();
            expect(newPatient.firstName).toBe('');
            expect(newPatient.lastName).toBe('');
            expect(newPatient.visits).toEqual([]);
        });
    });
});

// Test Suite for Validation Functions
describe('Validation Functions Tests', () => {

    describe('validateFirstName', () => {
        test('should validate valid first name', () => {
            const result = validateFirstName('John');
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        test('should fail for empty first name', () => {
            const result = validateFirstName('');
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain(ERROR_MESSAGES.validation.required);
        });

        test('should fail for too short first name', () => {
            const result = validateFirstName('J');
            expect(result.isValid).toBe(false);
            expect(result.errors.some(error => error.includes('at least'))).toBe(true);
        });

        test('should fail for invalid characters', () => {
            const result = validateFirstName('John123');
            expect(result.isValid).toBe(false);
            expect(result.errors.some(error => error.includes('letters'))).toBe(true);
        });
    });

    describe('validateDateOfBirth', () => {
        test('should validate valid date of birth', () => {
            const result = validateDateOfBirth('1990-01-01');
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        test('should fail for empty date', () => {
            const result = validateDateOfBirth('');
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain(ERROR_MESSAGES.validation.required);
        });

        test('should fail for future date', () => {
            const futureDate = new Date();
            futureDate.setFullYear(futureDate.getFullYear() + 1);

            const result = validateDateOfBirth(futureDate.toISOString().split('T')[0]);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain(ERROR_MESSAGES.validation.future);
        });

        test('should fail for invalid date format', () => {
            const result = validateDateOfBirth('invalid-date');
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain(ERROR_MESSAGES.validation.date);
        });
    });

    describe('validateGender', () => {
        test('should validate valid gender options', () => {
            expect(validateGender('male').isValid).toBe(true);
            expect(validateGender('female').isValid).toBe(true);
            expect(validateGender('other').isValid).toBe(true);
            expect(validateGender('Male').isValid).toBe(true); // Case insensitive
        });

        test('should fail for empty gender', () => {
            const result = validateGender('');
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain(ERROR_MESSAGES.validation.required);
        });

        test('should fail for invalid gender', () => {
            const result = validateGender('invalid');
            expect(result.isValid).toBe(false);
            expect(result.errors.some(error => error.includes('must be one of'))).toBe(true);
        });
    });

    describe('validatePatientForm', () => {
        test('should validate complete valid form', () => {
            const formData = {
                firstName: 'John',
                lastName: 'Doe',
                dateOfBirth: '1990-01-01',
                placeOfResidence: 'New York',
                gender: 'male'
            };

            const result = validatePatientForm(formData);
            expect(result.isValid).toBe(true);
            expect(Object.keys(result.errors)).toHaveLength(0);
        });

        test('should fail for incomplete form', () => {
            const formData = {
                firstName: 'John'
                // Missing other required fields
            };

            const result = validatePatientForm(formData);
            expect(result.isValid).toBe(false);
            expect(Object.keys(result.errors).length).toBeGreaterThan(0);
        });
    });

    describe('validateVisit', () => {
        test('should validate valid visit', () => {
            const visit = {
                visitDate: '2024-01-15',
                medications: 'Aspirin',
                observations: 'Patient feeling better',
                additionalComments: 'Follow up in 2 weeks'
            };

            const result = validateVisit(visit);
            expect(result.isValid).toBe(true);
            expect(Object.keys(result.errors)).toHaveLength(0);
        });

        test('should fail for missing visit date', () => {
            const visit = {
                medications: 'Aspirin'
            };

            const result = validateVisit(visit);
            expect(result.isValid).toBe(false);
            expect(result.errors.visitDate).toBeDefined();
        });

        test('should fail for too long text fields', () => {
            const longText = 'a'.repeat(2001);
            const visit = {
                visitDate: '2024-01-15',
                observations: longText
            };

            const result = validateVisit(visit);
            expect(result.isValid).toBe(false);
            expect(result.errors.observations).toBeDefined();
        });
    });
});

// Run tests if in test environment
if (typeof describe === 'function') {
    console.log('Patient validation tests loaded successfully');
} else {
    console.log('Test framework not available - tests not executed');
}