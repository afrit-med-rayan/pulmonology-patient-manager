/**
 * Form Manager Component
 * Handles form rendering, validation, and state management
 */

class FormManager {
    constructor() {
        this.forms = {};
        this.unsavedChanges = {};
        this.validationErrors = {};
        this.originalData = {};
    }

    /**
     * Initialize form after rendering
     * @param {string} formId - Form identifier
     * @param {Object} options - Initialization options
     */
    initializeForm(formId, options = {}) {
        const form = document.getElementById(formId);
        if (!form) return;

        // Store form reference
        this.forms[formId] = form;

        // Set up event listeners
        this.setupFormEventListeners(formId);

        // Initialize change tracking
        this.trackChanges(formId);

        // Set up real-time validation
        this.setupRealTimeValidation(formId);

        // Integrate with global change tracker if available
        this.integrateWithChangeTracker(formId, options);
    }

    /**
     * Integrate form with global change tracker
     * @param {string} formId - Form identifier
     * @param {Object} options - Integration options
     */
    integrateWithChangeTracker(formId, options = {}) {
        try {
            if (typeof window !== 'undefined' && window.app && window.app.components.changeTracker) {
                const changeTracker = window.app.components.changeTracker;

                // Determine display name for the form
                let displayName = options.displayName || formId;
                if (formId.includes('patient')) {
                    displayName = options.displayName || 'Patient Form';
                }

                // Track the form
                changeTracker.trackForm(formId, {
                    displayName: displayName,
                    description: options.description || `Form: ${displayName}`,
                    onChangeCallback: (hasChanges, trackingInfo) => {
                        // Update local tracking
                        this.unsavedChanges[formId] = hasChanges;

                        // Call custom callback if provided
                        if (options.onChangeCallback) {
                            options.onChangeCallback(hasChanges, trackingInfo);
                        }
                    }
                });

                console.log(`Integrated form ${formId} with change tracker`);
            }
        } catch (error) {
            console.error('Error integrating form with change tracker:', error);
        }
    }

    /**
     * Set up form event listeners
     * @param {string} formId - Form identifier
     */
    setupFormEventListeners(formId) {
        const form = this.forms[formId];

        // Form submission
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmit(formId);
        });

        // Cancel button
        const cancelBtn = form.querySelector('.cancel-btn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.handleCancel(formId);
            });
        }
    }

    /**
     * Set up real-time validation
     * @param {string} formId - Form identifier
     */
    setupRealTimeValidation(formId) {
        const form = this.forms[formId];
        const inputs = form.querySelectorAll('input, select, textarea');

        inputs.forEach(input => {
            // Validate on blur
            input.addEventListener('blur', () => {
                this.validateField(formId, input);
            });

            // Clear errors on input
            input.addEventListener('input', () => {
                this.clearFieldError(formId, input);
            });
        });
    }

    /**
     * Track form changes
     * @param {string} formId - Form identifier
     */
    trackChanges(formId) {
        const form = this.forms[formId];
        const inputs = form.querySelectorAll('input, select, textarea');

        inputs.forEach(input => {
            input.addEventListener('input', () => {
                this.checkForChanges(formId);
            });

            input.addEventListener('change', () => {
                this.checkForChanges(formId);
            });
        });
    }

    /**
     * Check if form has unsaved changes
     * @param {string} formId - Form identifier
     */
    checkForChanges(formId) {
        const currentData = this.getFormData(formId);
        const originalData = this.originalData[formId] || {};

        this.unsavedChanges[formId] = !isEqual(currentData, originalData);
    }

    /**
     * Validate a single form field
     * @param {string} formId - Form identifier
     * @param {Element} field - Field element to validate
     */
    validateField(formId, field) {
        // Basic validation - can be expanded
        return true;
    }

    /**
     * Clear field validation error
     * @param {string} formId - Form identifier
     * @param {Element} field - Field element
     */
    clearFieldError(formId, field) {
        field.classList.remove('error');
    }

    /**
     * Get form data as object
     * @param {string} formId - Form identifier
     * @returns {Object} Form data
     */
    getFormData(formId) {
        const form = this.forms[formId];
        const formData = new FormData(form);
        const data = {};

        // Convert FormData to object
        for (const [key, value] of formData.entries()) {
            data[key] = value;
        }

        return data;
    }

    /**
     * Handle form submission
     * @param {string} formId - Form identifier
     */
    async handleFormSubmit(formId) {
        const formData = this.getFormData(formId);

        // Emit form submit event
        const event = new CustomEvent('formSubmit', {
            detail: { formId, data: formData }
        });
        document.dispatchEvent(event);
    }

    /**
     * Handle form cancel
     * @param {string} formId - Form identifier
     */
    handleCancel(formId) {
        if (this.hasUnsavedChanges(formId)) {
            const confirmed = confirm('You have unsaved changes. Are you sure you want to cancel?');
            if (!confirmed) return;
        }

        // Emit form cancel event
        const event = new CustomEvent('formCancel', {
            detail: { formId }
        });
        document.dispatchEvent(event);
    }

    /**
     * Mark form as saved (clear unsaved changes)
     * @param {string} formId - Form identifier
     */
    markFormAsSaved(formId) {
        this.unsavedChanges[formId] = false;

        // Update original data to current data
        const currentData = this.getFormData(formId);
        this.originalData[formId] = deepClone(currentData);

        // Update global change tracker if available
        try {
            if (typeof window !== 'undefined' && window.app && window.app.components.changeTracker) {
                window.app.components.changeTracker.markFormAsSaved(formId);
            }
        } catch (error) {
            console.error('Error updating change tracker:', error);
        }

        console.log(`Form ${formId} marked as saved`);
    }

    /**
     * Destroy form and clean up tracking
     * @param {string} formId - Form identifier
     */
    destroyForm(formId) {
        // Remove from local tracking
        delete this.forms[formId];
        delete this.unsavedChanges[formId];
        delete this.validationErrors[formId];
        delete this.originalData[formId];

        // Remove from global change tracker if available
        try {
            if (typeof window !== 'undefined' && window.app && window.app.components.changeTracker) {
                window.app.components.changeTracker.untrackForm(formId);
            }
        } catch (error) {
            console.error('Error removing form from change tracker:', error);
        }

        console.log(`Form ${formId} destroyed and cleaned up`);
    }

    /**
     * Check if form has unsaved changes
     * @param {string} formId - Form identifier
     * @returns {boolean} True if form has unsaved changes
     */
    hasUnsavedChanges(formId) {
        return this.unsavedChanges[formId] || false;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FormManager;
}