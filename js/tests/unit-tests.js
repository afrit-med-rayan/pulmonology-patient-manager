/**
 * Unit Tests for Patient Management System Core Components
 * Tests individual classes and functions in isolation
 */

class UnitTestSuite {
    constructor() {
        this.testResults = { passed: 0, failed: 0, total: 0 };
    }

    /**
     * Run all unit tests
     */
    async runAllUnitTests() {
        console.log('🧪 Running Unit Tests...');
        console.log('='.repeat(50));

        const tests = [
            () => this.testPatientModel(),
            () => this.testAuthenticationManager(),
            () => this.testDataStorageManager(),
            () => this.testPatientManager(),
            () => this.testValidationFunctions(),
            () => this.testUtilityFunctions(),
            () => this.testErrorHandling()
        ];

        for (const test of tests) {
            try {
                await test();
                this.testResults.passed++;
                console.log('✅ Test passed');
            } catch (error) {
                console.error(`❌ Test failed: ${error.message}`);
                this.testResults.failed++;
            }
            this.testResults.total++;
        }

        this.printResults();
        return this.testResults.failed === 0;
    }

    /**
     * Test Patient Model functionality
     */
    async testPatientModel() {
        console.log('Testing Patient Model...');

        // Test patient creation with valid data
        const patientData = {
            firstName: 'John',
            lastName: 'Doe',
            dateOfBirth: '1990-01-01',
            placeOfResidence: 'New York',
            gender: 'male'
        };

        const patient = new Patient(patientData);

        // Test basic properties
        this.assert(patient.getFullName() === 'John Doe', 'Patient full name should be correct');
        this.assert(patient.age > 0, 'Patient age should be calculated');
        this.assert(patient.id, 'Patient should have an ID');

        // Test visit management
        const visit = patient.addVisit({
            visitDate: '2024-01-15',
            medications: 'Aspirin',
            observations: 'Patient feeling better'
        });

        this.assert(patient.visits.length === 1, 'Visit should be added');
        this.assert(visit.id, 'Visit should have an ID');
        this.assert(visit.visitDate === '2024-01-15', 'Visit date should be correct');

        // Test visit update
        const updated = patient.updateVisit(visit.id, { medications: 'Ibuprofen' });
        this.assert(updated, 'Visit should be updated');
        this.assert(patient.visits[0].medications === 'Ibuprofen', 'Visit medication should be updated');

        // Test visit removal
        const removed = patient.removeVisit(visit.id);
        this.assert(removed, 'Visit should be removed');
        this.assert(patient.visits.length === 0, 'Visits array should be empty');

        // Test validation with valid data
        const validation = patient.validate();
        this.assert(validation.isValid, 'Valid patient should pass validation');
        this.assert(validation.errors.length === 0, 'Valid patient should have no errors');

        // Test validation with invalid data
        const invalidPatient = new Patient({
            firstName: '', // Empty first name
            lastName: 'Doe',
            dateOfBirth: '2030-01-01', // Future date
            placeOfResidence: 'New York',
            gender: 'invalid' // Invalid gender
        });

        const invalidValidation = invalidPatient.validate();
        this.assert(!invalidValidation.isValid, 'Invalid patient should fail validation');
        this.assert(invalidValidation.errors.length > 0, 'Invalid patient should have errors');

        // Test search matching
        this.assert(patient.matchesSearch('John'), 'Patient should match first name search');
        this.assert(patient.matchesSearch('Doe'), 'Patient should match last name search');
        this.assert(patient.matchesSearch('john doe'), 'Patient should match full name search (case insensitive)');
        this.assert(!patient.matchesSearch('Smith'), 'Patient should not match unrelated search');

        // Test JSON serialization
        const json = patient.toJSON();
        this.assert(json.firstName === 'John', 'JSON should contain correct data');
        this.assert(json.id === patient.id, 'JSON should contain patient ID');

        // Test JSON deserialization
        const fromJson = Patient.fromJSON(json);
        this.assert(fromJson.firstName === 'John', 'Patient should be created from JSON');
        this.assert(fromJson.id === patient.id, 'Patient from JSON should have same ID');

        // Test sanitization
        const xssPatient = new Patient({
            firstName: '<script>alert("xss")</script>John',
            lastName: 'Doe<img src="x" onerror="alert(1)">',
            dateOfBirth: '1990-01-01',
            placeOfResidence: 'New York',
            gender: 'male'
        });

        xssPatient.sanitize();
        this.assert(!xssPatient.firstName.includes('<script>'), 'XSS should be sanitized from first name');
        this.assert(!xssPatient.lastName.includes('<img'), 'HTML tags should be sanitized from last name');
    }

    /**
     * Test Authentication Manager functionality
     */
    async testAuthenticationManager() {
        console.log('Testing Authentication Manager...');

        const authManager = new AuthenticationManager();

        // Test initial state
        this.assert(!authManager.isAuthenticated(), 'Should not be authenticated initially');
        this.assert(authManager.getCurrentUser() === null, 'Current user should be null initially');

        // Test invalid login attempts
        try {
            await authManager.login('', '');
            this.assert(false, 'Empty credentials should be rejected');
        } catch (error) {
            this.assert(error.message.includes('required'), 'Should require username and password');
        }

        try {
            await authManager.login('invalid', 'invalid');
            this.assert(false, 'Invalid credentials should be rejected');
        } catch (error) {
            this.assert(error.message.includes('invalid'), 'Should reject invalid credentials');
        }

        // Test valid login
        const loginResult = await authManager.login('dr.sahboub', 'pneumo2024');
        this.assert(loginResult === true, 'Valid login should return true');
        this.assert(authManager.isAuthenticated(), 'Should be authenticated after valid login');

        // Test current user
        const user = authManager.getCurrentUser();
        this.assert(user !== null, 'Current user should not be null after login');
        this.assert(user.username === 'dr.sahboub', 'Username should be correct');
        this.assert(user.userId, 'User should have an ID');
        this.assert(user.loginTime, 'User should have login time');

        // Test session validation
        this.assert(authManager.isSessionValid(authManager.currentSession), 'Session should be valid');

        // Test activity update
        const originalActivity = user.lastActivity;
        authManager.updateLastActivity();
        const updatedUser = authManager.getCurrentUser();
        this.assert(updatedUser.lastActivity >= originalActivity, 'Last activity should be updated');

        // Test logout
        authManager.logout();
        this.assert(!authManager.isAuthenticated(), 'Should not be authenticated after logout');
        this.assert(authManager.getCurrentUser() === null, 'Current user should be null after logout');

        // Test lockout mechanism
        const attemptsInfo = authManager.getLoginAttemptsInfo();
        this.assert(typeof attemptsInfo.attempts === 'number', 'Should track login attempts');
        this.assert(typeof attemptsInfo.maxAttempts === 'number', 'Should have max attempts limit');
    }

    /**
     * Test Data Storage Manager functionality
     */
    async testDataStorageManager() {
        console.log('Testing Data Storage Manager...');

        const dataStorage = new DataStorageManager();

        // Test initialization
        this.assert(!dataStorage.isInitialized, 'Should not be initialized initially');

        const initResult = await dataStorage.initializeStorage();
        this.assert(initResult.success, 'Initialization should succeed');
        this.assert(dataStorage.isInitialized, 'Should be initialized after init');

        // Test patient saving
        const patientData = {
            id: 'test-patient-1',
            firstName: 'Jane',
            lastName: 'Smith',
            dateOfBirth: '1985-05-15',
            placeOfResidence: 'Boston',
            gender: 'female',
            visits: [{
                id: 'visit-1',
                visitDate: '2024-01-15',
                medications: 'Albuterol',
                observations: 'Improved breathing',
                additionalComments: 'Continue treatment'
            }],
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        const saveResult = await dataStorage.savePatient(patientData);
        this.assert(saveResult.success, 'Patient should be saved successfully');
        this.assert(saveResult.patientId === 'test-patient-1', 'Save result should include patient ID');

        // Test patient loading
        const loadedPatient = await dataStorage.loadPatient('test-patient-1');
        this.assert(loadedPatient !== null, 'Patient should be loaded');
        this.assert(loadedPatient.firstName === 'Jane', 'Loaded patient should have correct first name');
        this.assert(loadedPatient.visits.length === 1, 'Loaded patient should have visits');

        // Test patient search
        const searchResults = await dataStorage.searchPatients({ searchTerm: 'Jane' });
        this.assert(searchResults.length > 0, 'Search should find the patient');
        this.assert(searchResults[0].firstName === 'Jane', 'Search result should be correct');

        // Test search with no results
        const noResults = await dataStorage.searchPatients({ searchTerm: 'NonExistent' });
        this.assert(noResults.length === 0, 'Search should return empty array for no matches');

        // Test getting all patients
        const allPatients = await dataStorage.getAllPatients();
        this.assert(allPatients.length >= 1, 'Should retrieve all patients');

        // Test statistics
        const stats = await dataStorage.getStatistics();
        this.assert(stats.totalPatients >= 1, 'Statistics should show correct patient count');
        this.assert(stats.genderDistribution, 'Statistics should include gender distribution');

        // Test patient deletion
        const deleteResult = await dataStorage.deletePatient('test-patient-1');
        this.assert(deleteResult.success, 'Patient should be deleted successfully');

        const deletedPatient = await dataStorage.loadPatient('test-patient-1');
        this.assert(deletedPatient === null, 'Deleted patient should not be found');

        // Test error handling
        try {
            await dataStorage.loadPatient('');
            this.assert(false, 'Empty patient ID should throw error');
        } catch (error) {
            this.assert(error.message.includes('required'), 'Should require patient ID');
        }

        try {
            await dataStorage.deletePatient('non-existent');
            this.assert(false, 'Non-existent patient deletion should throw error');
        } catch (error) {
            this.assert(error.message.includes('not found'), 'Should handle non-existent patient');
        }
    }

    /**
     * Test Patient Manager functionality
     */
    async testPatientManager() {
        console.log('Testing Patient Manager...');

        const dataStorage = new DataStorageManager();
        await dataStorage.initializeStorage();

        const patientManager = new PatientManager();

        // Test initialization
        this.assert(!patientManager.isReady(), 'Should not be ready initially');

        const initResult = await patientManager.initialize(dataStorage);
        this.assert(initResult.success, 'Initialization should succeed');
        this.assert(patientManager.isReady(), 'Should be ready after initialization');

        // Test patient creation
        const patientData = {
            firstName: 'Bob',
            lastName: 'Johnson',
            dateOfBirth: '1975-08-20',
            placeOfResidence: 'Chicago',
            gender: 'male'
        };

        const createResult = await patientManager.createPatient(patientData);
        this.assert(createResult.success, 'Patient creation should succeed');
        this.assert(createResult.patientId, 'Create result should include patient ID');
        this.assert(createResult.patient, 'Create result should include patient data');

        const patientId = createResult.patientId;

        // Test patient retrieval
        const retrievedPatient = await patientManager.getPatient(patientId);
        this.assert(retrievedPatient !== null, 'Patient should be retrieved');
        this.assert(retrievedPatient.firstName === 'Bob', 'Retrieved patient should have correct data');

        // Test patient update
        const updateData = { placeOfResidence: 'Detroit' };
        const updateResult = await patientManager.updatePatient(patientId, updateData);
        this.assert(updateResult.success, 'Patient update should succeed');

        const updatedPatient = await patientManager.getPatient(patientId);
        this.assert(updatedPatient.placeOfResidence === 'Detroit', 'Patient should be updated');

        // Test patient search
        const searchResults = await patientManager.searchPatients('Bob');
        this.assert(searchResults.length > 0, 'Search should find the patient');

        // Test getting all patients
        const allPatients = await patientManager.getAllPatients();
        this.assert(allPatients.length >= 1, 'Should get all patients');

        // Test statistics
        const stats = await patientManager.getPatientStatistics();
        this.assert(stats.totalPatients >= 1, 'Statistics should be available');

        // Test validation
        const validationResult = patientManager.validatePatientData(patientData);
        this.assert(validationResult.isValid, 'Valid data should pass validation');

        const invalidValidation = patientManager.validatePatientData({ firstName: '' });
        this.assert(!invalidValidation.isValid, 'Invalid data should fail validation');

        // Test patient deletion
        const deleteResult = await patientManager.deletePatient(patientId);
        this.assert(deleteResult.success, 'Patient deletion should succeed');

        const deletedPatient = await patientManager.getPatient(patientId);
        this.assert(deletedPatient === null, 'Deleted patient should not be found');

        // Test error handling
        try {
            await patientManager.createPatient(null);
            this.assert(false, 'Null data should throw error');
        } catch (error) {
            this.assert(error.message.includes('Invalid'), 'Should handle invalid data');
        }

        try {
            await patientManager.getPatient('');
            this.assert(false, 'Empty ID should throw error');
        } catch (error) {
            this.assert(error.message.includes('required'), 'Should require patient ID');
        }
    }

    /**
     * Test validation functions
     */
    async testValidationFunctions() {
        console.log('Testing Validation Functions...');

        // Test first name validation
        const validFirstName = validateFirstName('John');
        this.assert(validFirstName.isValid, 'Valid first name should pass');

        const emptyFirstName = validateFirstName('');
        this.assert(!emptyFirstName.isValid, 'Empty first name should fail');

        const shortFirstName = validateFirstName('J');
        this.assert(!shortFirstName.isValid, 'Too short first name should fail');

        const invalidFirstName = validateFirstName('John123');
        this.assert(!invalidFirstName.isValid, 'First name with numbers should fail');

        // Test last name validation
        const validLastName = validateLastName('Doe');
        this.assert(validLastName.isValid, 'Valid last name should pass');

        const emptyLastName = validateLastName('');
        this.assert(!emptyLastName.isValid, 'Empty last name should fail');

        // Test date of birth validation
        const validDate = validateDateOfBirth('1990-01-01');
        this.assert(validDate.isValid, 'Valid date should pass');

        const emptyDate = validateDateOfBirth('');
        this.assert(!emptyDate.isValid, 'Empty date should fail');

        const futureDate = validateDateOfBirth('2030-01-01');
        this.assert(!futureDate.isValid, 'Future date should fail');

        const invalidDate = validateDateOfBirth('invalid-date');
        this.assert(!invalidDate.isValid, 'Invalid date format should fail');

        // Test gender validation
        const validGender = validateGender('male');
        this.assert(validGender.isValid, 'Valid gender should pass');

        const validGenderFemale = validateGender('female');
        this.assert(validGenderFemale.isValid, 'Female gender should pass');

        const validGenderOther = validateGender('other');
        this.assert(validGenderOther.isValid, 'Other gender should pass');

        const emptyGender = validateGender('');
        this.assert(!emptyGender.isValid, 'Empty gender should fail');

        const invalidGender = validateGender('invalid');
        this.assert(!invalidGender.isValid, 'Invalid gender should fail');

        // Test place of residence validation
        const validPlace = validatePlaceOfResidence('New York');
        this.assert(validPlace.isValid, 'Valid place should pass');

        const emptyPlace = validatePlaceOfResidence('');
        this.assert(!emptyPlace.isValid, 'Empty place should fail');

        // Test visit validation
        const validVisit = {
            visitDate: '2024-01-15',
            medications: 'Aspirin',
            observations: 'Patient feeling better',
            additionalComments: 'Continue treatment'
        };

        const visitValidation = validateVisit(validVisit);
        this.assert(visitValidation.isValid, 'Valid visit should pass validation');

        const invalidVisit = {
            visitDate: '', // Empty date
            medications: 'A'.repeat(2000), // Too long
            observations: 'Valid observation'
        };

        const invalidVisitValidation = validateVisit(invalidVisit);
        this.assert(!invalidVisitValidation.isValid, 'Invalid visit should fail validation');
    }

    /**
     * Test utility functions
     */
    async testUtilityFunctions() {
        console.log('Testing Utility Functions...');

        // Test ID generation
        const id1 = generateId();
        const id2 = generateId();
        this.assert(id1 !== id2, 'Generated IDs should be unique');
        this.assert(id1.length > 0, 'Generated ID should not be empty');
        this.assert(typeof id1 === 'string', 'Generated ID should be a string');

        // Test timestamp generation
        const timestamp1 = getCurrentTimestamp();
        await new Promise(resolve => setTimeout(resolve, 10)); // Wait 10ms
        const timestamp2 = getCurrentTimestamp();
        this.assert(timestamp2 > timestamp1, 'Timestamps should be increasing');

        // Test age calculation
        const age30 = calculateAge('1994-01-01');
        this.assert(age30 >= 29 && age30 <= 31, 'Age calculation should be approximately correct');

        const age0 = calculateAge(null);
        this.assert(age0 === 0, 'Null date should return age 0');

        const ageInvalid = calculateAge('invalid-date');
        this.assert(ageInvalid === 0, 'Invalid date should return age 0');

        // Test HTML sanitization
        const cleanText = sanitizeHtml('Hello World');
        this.assert(cleanText === 'Hello World', 'Clean text should remain unchanged');

        const xssText = sanitizeHtml('<script>alert("xss")</script>Hello');
        this.assert(!xssText.includes('<script>'), 'Script tags should be removed');
        this.assert(xssText.includes('Hello'), 'Safe content should remain');

        const htmlText = sanitizeHtml('<div>Hello <b>World</b></div>');
        this.assert(!htmlText.includes('<div>'), 'HTML tags should be removed');
        this.assert(htmlText.includes('Hello'), 'Text content should remain');

        // Test search term matching
        this.assert(containsSearchTerm('John Doe', 'john'), 'Should match case-insensitive');
        this.assert(containsSearchTerm('John Doe', 'doe'), 'Should match partial text');
        this.assert(!containsSearchTerm('John Doe', 'smith'), 'Should not match unrelated text');
        this.assert(!containsSearchTerm('', 'test'), 'Empty string should not match');
        this.assert(containsSearchTerm('test', ''), 'Empty search term should match anything');

        // Test debounce function
        let callCount = 0;
        const debouncedFn = debounce(() => callCount++, 100);

        debouncedFn();
        debouncedFn();
        debouncedFn();

        this.assert(callCount === 0, 'Debounced function should not execute immediately');

        // Wait for debounce to execute
        await new Promise(resolve => setTimeout(resolve, 150));
        this.assert(callCount === 1, 'Debounced function should execute once after delay');
    }

    /**
     * Test error handling
     */
    async testErrorHandling() {
        console.log('Testing Error Handling...');

        const errorHandler = new ErrorHandler();

        // Test error handling without throwing
        const testError = new Error('Test error message');
        try {
            errorHandler.handleError(testError, 'testContext');
            this.assert(true, 'Error handler should not throw');
        } catch (error) {
            this.assert(false, 'Error handler should handle errors gracefully');
        }

        // Test user-friendly message generation
        const userMessage = errorHandler.getUserFriendlyMessage(testError);
        this.assert(typeof userMessage === 'string', 'Should return user-friendly message');
        this.assert(userMessage.length > 0, 'User message should not be empty');

        // Test different error types
        const networkError = new Error('Network request failed');
        const networkMessage = errorHandler.getUserFriendlyMessage(networkError);
        this.assert(networkMessage.includes('connection') || networkMessage.includes('network'),
            'Network errors should have appropriate message');

        const validationError = new Error('Validation failed: First name is required');
        const validationMessage = errorHandler.getUserFriendlyMessage(validationError);
        this.assert(validationMessage.includes('required') || validationMessage.includes('validation'),
            'Validation errors should have appropriate message');

        // Test error logging
        const originalConsoleError = console.error;
        let loggedError = null;
        console.error = (message) => { loggedError = message; };

        errorHandler.handleError(testError, 'testContext');
        this.assert(loggedError !== null, 'Error should be logged');
        this.assert(loggedError.includes('testContext'), 'Log should include context');

        // Restore console.error
        console.error = originalConsoleError;
    }

    /**
     * Assert helper function
     */
    assert(condition, message) {
        if (!condition) {
            throw new Error(`Assertion failed: ${message}`);
        }
    }

    /**
     * Print test results
     */
    printResults() {
        console.log('\n' + '='.repeat(50));
        console.log('📊 Unit Test Results:');
        console.log(`✅ Passed: ${this.testResults.passed}`);
        console.log(`❌ Failed: ${this.testResults.failed}`);
        console.log(`📈 Success Rate: ${((this.testResults.passed / this.testResults.total) * 100).toFixed(1)}%`);
        console.log('='.repeat(50));
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UnitTestSuite;
}