/**
 * Patient Modification Tests
 * Tests for patient record modification functionality
 */

// Mock dependencies
const mockPatientManager = {
    updatePatient: jest.fn(),
    getPatient: jest.fn()
};

const mockFormManager = {
    renderPatientForm: jest.fn(),
    initializeForm: jest.fn(),
    validateForm: jest.fn(),
    getFormData: jest.fn(),
    markFormAsSaved: jest.fn(),
    hasUnsavedChanges: jest.fn(),
    destroyForm: jest.fn()
};

// Mock patient data
const mockPatient = {
    id: 'test-patient-123',
    firstName: 'John',
    lastName: 'Doe',
    dateOfBirth: '1980-01-01',
    age: 44,
    gender: 'male',
    placeOfResidence: 'Test City',
    visits: [
        {
            id: 'visit-1',
            visitDate: '2024-01-15',
            medications: 'Test medication',
            observations: 'Test observations',
            additionalComments: 'Test comments'
        }
    ],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-15T00:00:00.000Z',
    getFullName: () => 'John Doe',
    toJSON: () => mockPatient
};

describe('PatientDetailView - Modification Functionality', () => {
    let patientDetailView;

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();

        // Create PatientDetailView instance
        patientDetailView = new PatientDetailView(mockPatient, mockPatientManager);
        patientDetailView.formManager = mockFormManager;
    });

    afterEach(() => {
        if (patientDetailView) {
            patientDetailView.destroy();
        }
    });

    describe('Edit Mode Toggle', () => {
        test('should enter edit mode when handleEdit is called', () => {
            expect(patientDetailView.isEditMode).toBe(false);

            patientDetailView.handleEdit();

            expect(patientDetailView.isEditMode).toBe(true);
            expect(patientDetailView.originalPatientData).toEqual(mockPatient);
        });

        test('should exit edit mode when toggleEditMode(false) is called', () => {
            patientDetailView.isEditMode = true;
            patientDetailView.originalPatientData = mockPatient;

            patientDetailView.toggleEditMode(false);

            expect(patientDetailView.isEditMode).toBe(false);
            expect(patientDetailView.originalPatientData).toBeNull();
        });

        test('should render edit mode HTML when in edit mode', () => {
            patientDetailView.isEditMode = true;
            mockFormManager.renderPatientForm.mockReturnValue('<form>Mock Form</form>');

            const html = patientDetailView.render();

            expect(html).toContain('edit-mode');
            expect(html).toContain('Edit Patient: John Doe');
            expect(html).toContain('Save Changes');
            expect(html).toContain('Cancel Edit');
            expect(mockFormManager.renderPatientForm).toHaveBeenCalledWith(
                'edit-patient-test-patient-123',
                mockPatient
            );
        });

        test('should render view mode HTML when not in edit mode', () => {
            patientDetailView.isEditMode = false;

            const html = patientDetailView.render();

            expect(html).not.toContain('edit-mode');
            expect(html).toContain('Edit Patient');
            expect(html).toContain('Delete Patient');
            expect(html).not.toContain('Save Changes');
        });
    });

    describe('Form Validation and Saving', () => {
        beforeEach(() => {
            patientDetailView.isEditMode = true;
            patientDetailView.originalPatientData = mockPatient;
        });

        test('should save patient changes when form is valid', async () => {
            const updatedData = { ...mockPatient, firstName: 'Jane' };
            const updateResult = { success: true, patient: updatedData };

            mockFormManager.validateForm.mockReturnValue({ isValid: true, errors: {} });
            mockFormManager.getFormData.mockReturnValue(updatedData);
            mockPatientManager.updatePatient.mockResolvedValue(updateResult);

            await patientDetailView.handleSave();

            expect(mockFormManager.validateForm).toHaveBeenCalledWith('edit-patient-test-patient-123');
            expect(mockFormManager.getFormData).toHaveBeenCalledWith('edit-patient-test-patient-123');
            expect(mockPatientManager.updatePatient).toHaveBeenCalledWith('test-patient-123', updatedData);
            expect(mockFormManager.markFormAsSaved).toHaveBeenCalledWith('edit-patient-test-patient-123');
            expect(patientDetailView.isEditMode).toBe(false);
        });

        test('should not save when form validation fails', async () => {
            mockFormManager.validateForm.mockReturnValue({
                isValid: false,
                errors: { firstName: 'Required field' }
            });

            await patientDetailView.handleSave();

            expect(mockFormManager.validateForm).toHaveBeenCalled();
            expect(mockPatientManager.updatePatient).not.toHaveBeenCalled();
            expect(patientDetailView.isEditMode).toBe(true);
        });

        test('should handle save errors gracefully', async () => {
            const error = new Error('Save failed');

            mockFormManager.validateForm.mockReturnValue({ isValid: true, errors: {} });
            mockFormManager.getFormData.mockReturnValue(mockPatient);
            mockPatientManager.updatePatient.mockRejectedValue(error);

            await patientDetailView.handleSave();

            expect(mockPatientManager.updatePatient).toHaveBeenCalled();
            expect(patientDetailView.isEditMode).toBe(true); // Should remain in edit mode
        });
    });

    describe('Change Tracking', () => {
        beforeEach(() => {
            patientDetailView.isEditMode = true;
            patientDetailView.originalPatientData = mockPatient;
        });

        test('should detect unsaved changes', () => {
            mockFormManager.hasUnsavedChanges.mockReturnValue(true);

            const hasChanges = patientDetailView.hasUnsavedChanges();

            expect(hasChanges).toBe(true);
            expect(mockFormManager.hasUnsavedChanges).toHaveBeenCalledWith('edit-patient-test-patient-123');
        });

        test('should return false for unsaved changes when not in edit mode', () => {
            patientDetailView.isEditMode = false;

            const hasChanges = patientDetailView.hasUnsavedChanges();

            expect(hasChanges).toBe(false);
            expect(mockFormManager.hasUnsavedChanges).not.toHaveBeenCalled();
        });

        test('should prompt user when canceling with unsaved changes', () => {
            mockFormManager.hasUnsavedChanges.mockReturnValue(true);
            window.confirm = jest.fn().mockReturnValue(false);

            patientDetailView.handleCancelEdit();

            expect(window.confirm).toHaveBeenCalledWith(
                expect.stringContaining('You have unsaved changes')
            );
            expect(patientDetailView.isEditMode).toBe(true); // Should remain in edit mode
        });

        test('should cancel edit when user confirms with unsaved changes', () => {
            mockFormManager.hasUnsavedChanges.mockReturnValue(true);
            window.confirm = jest.fn().mockReturnValue(true);

            patientDetailView.handleCancelEdit();

            expect(window.confirm).toHaveBeenCalled();
            expect(patientDetailView.isEditMode).toBe(false);
        });
    });

    describe('Navigation with Unsaved Changes', () => {
        beforeEach(() => {
            patientDetailView.isEditMode = true;
            patientDetailView.originalPatientData = mockPatient;
            window.app = { navigateToRoute: jest.fn() };
        });

        afterEach(() => {
            delete window.app;
        });

        test('should prompt user when navigating back with unsaved changes', () => {
            mockFormManager.hasUnsavedChanges.mockReturnValue(true);
            window.confirm = jest.fn().mockReturnValue(false);

            patientDetailView.handleBack();

            expect(window.confirm).toHaveBeenCalledWith(
                expect.stringContaining('You have unsaved changes')
            );
            expect(window.app.navigateToRoute).not.toHaveBeenCalled();
        });

        test('should navigate back when user confirms with unsaved changes', () => {
            mockFormManager.hasUnsavedChanges.mockReturnValue(true);
            window.confirm = jest.fn().mockReturnValue(true);

            patientDetailView.handleBack();

            expect(window.confirm).toHaveBeenCalled();
            expect(window.app.navigateToRoute).toHaveBeenCalledWith('search-patients');
        });

        test('should navigate back without prompt when no unsaved changes', () => {
            mockFormManager.hasUnsavedChanges.mockReturnValue(false);
            window.confirm = jest.fn();

            patientDetailView.handleBack();

            expect(window.confirm).not.toHaveBeenCalled();
            expect(window.app.navigateToRoute).toHaveBeenCalledWith('search-patients');
        });
    });

    describe('Keyboard Shortcuts', () => {
        beforeEach(() => {
            // Mock DOM
            document.querySelector = jest.fn().mockReturnValue(true);
            document.addEventListener = jest.fn();
            document.removeEventListener = jest.fn();
        });

        test('should set up keyboard shortcuts on initialize', () => {
            patientDetailView.initialize();

            expect(document.addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
        });

        test('should clean up keyboard shortcuts on destroy', () => {
            patientDetailView.initialize();
            patientDetailView.destroy();

            expect(document.removeEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
        });
    });

    describe('Form Manager Integration', () => {
        test('should initialize form manager when entering edit mode', () => {
            patientDetailView.formManager = null;

            patientDetailView.toggleEditMode(true);

            expect(patientDetailView.formManager).toBeInstanceOf(FormManager);
        });

        test('should clean up form manager on destroy', () => {
            patientDetailView.isEditMode = true;
            patientDetailView.formManager = mockFormManager;

            patientDetailView.destroy();

            expect(mockFormManager.destroyForm).toHaveBeenCalledWith('edit-patient-test-patient-123');
            expect(patientDetailView.formManager).toBeNull();
        });
    });
});

describe('Patient Modification Integration Tests', () => {
    let patientManager;
    let formManager;
    let patientDetailView;
    let mockPatient;

    beforeEach(() => {
        // Create real instances for integration testing
        patientManager = new PatientManager();
        formManager = new FormManager();

        mockPatient = new Patient({
            id: 'integration-test-123',
            firstName: 'Integration',
            lastName: 'Test',
            dateOfBirth: '1990-01-01',
            age: 34,
            gender: 'female',
            placeOfResidence: 'Test City',
            visits: []
        });

        patientDetailView = new PatientDetailView(mockPatient, patientManager);
    });

    afterEach(() => {
        if (patientDetailView) {
            patientDetailView.destroy();
        }
    });

    test('should complete full edit workflow', async () => {
        // Mock DOM elements
        document.getElementById = jest.fn().mockReturnValue({
            innerHTML: '',
            parentElement: { innerHTML: '' },
            querySelectorAll: jest.fn().mockReturnValue([]),
            addEventListener: jest.fn()
        });

        // Enter edit mode
        patientDetailView.handleEdit();
        expect(patientDetailView.isEditMode).toBe(true);

        // Simulate form changes
        patientDetailView.formManager = {
            validateForm: jest.fn().mockReturnValue({ isValid: true, errors: {} }),
            getFormData: jest.fn().mockReturnValue({
                ...mockPatient.toJSON(),
                firstName: 'Updated'
            }),
            markFormAsSaved: jest.fn(),
            hasUnsavedChanges: jest.fn().mockReturnValue(true),
            destroyForm: jest.fn()
        };

        // Mock patient manager update
        patientManager.updatePatient = jest.fn().mockResolvedValue({
            success: true,
            patient: { ...mockPatient.toJSON(), firstName: 'Updated' }
        });

        // Save changes
        await patientDetailView.handleSave();

        expect(patientManager.updatePatient).toHaveBeenCalled();
        expect(patientDetailView.isEditMode).toBe(false);
    });
});