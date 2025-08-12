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
     * Render patient form HTML
     * @param {string} formId - Unique form identifier
     * @param {Object} data - Initial form data
     * @returns {string} HTML string for the form
     */
    renderPatientForm(formId, data = {}) {
        // Store original data for change tracking
        this.originalData[formId] = deepClone(data);
        this.unsavedChanges[formId] = false;
        this.validationErrors[formId] = {};

        const patient = data.id ? data : PATIENT_SCHEMA;
        const visits = patient.visits || [];

        return `
            <form id="${formId}" class="patient-form" novalidate>
                <input type="hidden" name="id" value="${patient.id || ''}" />
                
                <!-- Personal Information Section -->
                <div class="form-section">
                    <h3 class="form-section-title">Personal Information</h3>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="${formId}-firstName" class="form-label">
                                First Name <span class="required">*</span>
                            </label>
                            <input 
                                type="text" 
                                id="${formId}-firstName" 
                                name="firstName" 
                                class="form-control" 
                                value="${patient.firstName || ''}"
                                placeholder="Enter first name"
                                maxlength="50"
                                required
                            />
                            <div class="form-error" id="${formId}-firstName-error"></div>
                        </div>
                        
                        <div class="form-group">
                            <label for="${formId}-lastName" class="form-label">
                                Last Name <span class="required">*</span>
                            </label>
                            <input 
                                type="text" 
                                id="${formId}-lastName" 
                                name="lastName" 
                                class="form-control" 
                                value="${patient.lastName || ''}"
                                placeholder="Enter last name"
                                maxlength="50"
                                required
                            />
                            <div class="form-error" id="${formId}-lastName-error"></div>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="${formId}-dateOfBirth" class="form-label">
                                Date of Birth <span class="required">*</span>
                            </label>
                            <input 
                                type="date" 
                                id="${formId}-dateOfBirth" 
                                name="dateOfBirth" 
                                class="form-control" 
                                value="${formatDateForInput(patient.dateOfBirth)}"
                                max="${formatDateForInput(new Date())}"
                                required
                            />
                            <div class="form-error" id="${formId}-dateOfBirth-error"></div>
                        </div>
                        
                        <div class="form-group">
                            <label for="${formId}-age" class="form-label">Age</label>
                            <input 
                                type="number" 
                                id="${formId}-age" 
                                name="age" 
                                class="form-control" 
                                value="${patient.age || ''}"
                                min="0" 
                                max="150"
                                readonly
                                placeholder="Calculated from birth date"
                            />
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="${formId}-placeOfResidence" class="form-label">
                                Place of Residence <span class="required">*</span>
                            </label>
                            <input 
                                type="text" 
                                id="${formId}-placeOfResidence" 
                                name="placeOfResidence" 
                                class="form-control" 
                                value="${patient.placeOfResidence || ''}"
                                placeholder="Enter place of residence"
                                maxlength="100"
                                required
                            />
                            <div class="form-error" id="${formId}-placeOfResidence-error"></div>
                        </div>
                        
                        <div class="form-group">
                            <label for="${formId}-gender" class="form-label">
                                Gender <span class="required">*</span>
                            </label>
                            <select 
                                id="${formId}-gender" 
                                name="gender" 
                                class="form-control" 
                                required
                            >
                                <option value="">Select gender</option>
                                <option value="male" ${patient.gender === 'male' ? 'selected' : ''}>Male</option>
                                <option value="female" ${patient.gender === 'female' ? 'selected' : ''}>Female</option>
                                <option value="other" ${patient.gender === 'other' ? 'selected' : ''}>Other</option>
                            </select>
                            <div class="form-error" id="${formId}-gender-error"></div>
                        </div>
                    </div>
                </div>

                <!-- Visits Section -->
                <div class="form-section">
                    <div class="form-section-header">
                        <h3 class="form-section-title">Medical Visits</h3>
                        <button type="button" class="btn btn-secondary btn-sm add-visit-btn" data-form-id="${formId}">
                            Add Visit
                        </button>
                    </div>
                    
                    <div id="${formId}-visits-container" class="visits-container">
                        ${this.renderVisits(formId, visits)}
                    </div>
                </div>

                <!-- Form Actions -->
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary cancel-btn" data-form-id="${formId}">
                        Cancel
                    </button>
                    <button type="submit" class="btn btn-primary save-btn" data-form-id="${formId}">
                        Save Patient
                    </button>
                </div>
            </form>
        `;
    }

    /**
     * Render visits HTML
     * @param {string} formId - Form identifier
     * @param {Array} visits - Array of visit objects
     * @returns {string} HTML string for visits
     */
    renderVisits(formId, visits = []) {
        if (visits.length === 0) {
            return `
                <div class="no-visits-message">
                    <p>No visits recorded yet. Click "Add Visit" to add the first visit.</p>
                </div>
            `;
        }

        return visits.map((visit, index) => this.renderVisit(formId, visit, index)).join('');
    }

    /**
     * Render single visit HTML
     * @param {string} formId - Form identifier
     * @param {Object} visit - Visit object
     * @param {number} index - Visit index
     * @returns {string} HTML string for single visit
     */
    renderVisit(formId, visit, index) {
        const visitId = visit.id || generateId();

        return `
            <div class="visit-item" data-visit-id="${visitId}" data-visit-index="${index}">
                <div class="visit-header">
                    <h4 class="visit-title">Visit ${index + 1}</h4>
                    <button type="button" class="btn btn-danger btn-sm remove-visit-btn" 
                            data-form-id="${formId}" data-visit-index="${index}">
                        Remove
                    </button>
                </div>
                
                <input type="hidden" name="visits[${index}][id]" value="${visitId}" />
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="${formId}-visit-${index}-date" class="form-label">
                            Visit Date <span class="required">*</span>
                        </label>
                        <input 
                            type="date" 
                            id="${formId}-visit-${index}-date" 
                            name="visits[${index}][visitDate]" 
                            class="form-control" 
                            value="${formatDateForInput(visit.visitDate)}"
                            max="${formatDateForInput(new Date())}"
                            required
                        />
                        <div class="form-error" id="${formId}-visit-${index}-date-error"></div>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="${formId}-visit-${index}-medications" class="form-label">
                        Medications Prescribed
                    </label>
                    <textarea 
                        id="${formId}-visit-${index}-medications" 
                        name="visits[${index}][medications]" 
                        class="form-control" 
                        rows="3"
                        placeholder="Enter medications prescribed during this visit"
                        maxlength="1000"
                    >${visit.medications || ''}</textarea>
                    <div class="form-error" id="${formId}-visit-${index}-medications-error"></div>
                </div>
                
                <div class="form-group">
                    <label for="${formId}-visit-${index}-observations" class="form-label">
                        Observations and Notes
                    </label>
                    <textarea 
                        id="${formId}-visit-${index}-observations" 
                        name="visits[${index}][observations]" 
                        class="form-control" 
                        rows="4"
                        placeholder="Enter observations and notes from this visit"
                        maxlength="2000"
                    >${visit.observations || ''}</textarea>
                    <div class="form-error" id="${formId}-visit-${index}-observations-error"></div>
                </div>
                
                <div class="form-group">
                    <label for="${formId}-visit-${index}-comments" class="form-label">
                        Additional Comments
                    </label>
                    <textarea 
                        id="${formId}-visit-${index}-comments" 
                        name="visits[${index}][additionalComments]" 
                        class="form-control" 
                        rows="3"
                        placeholder="Enter any additional comments"
                        maxlength="1000"
                    >${visit.additionalComments || ''}</textarea>
                    <div class="form-error" id="${formId}-visit-${index}-comments-error"></div>
                </div>
            </div>
        `;
    }

    /**
     * Initialize form after rendering
     * @param {string} formId - Form identifier
     */
    initializeForm(formId) {
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

        // Date of birth change - update age
        const dobField = form.querySelector('[name="dateOfBirth"]');
        if (dobField) {
            dobField.addEventListener('change', () => {
                this.updateAge(formId);
            });
        }

        // Add visit button
        const addVisitBtn = form.querySelector('.add-visit-btn');
        if (addVisitBtn) {
            addVisitBtn.addEventListener('click', () => {
                this.addVisit(formId);
            });
        }

        // Remove visit buttons (delegated event)
        form.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-visit-btn')) {
                const visitIndex = parseInt(e.target.dataset.visitIndex);
                this.removeVisit(formId, visitIndex);
            }
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
     * Update age field based on date of birth
     * @param {string} formId - Form identifier
     */
    updateAge(formId) {
        const form = this.forms[formId];
        const dobField = form.querySelector('[name="dateOfBirth"]');
        const ageField = form.querySelector('[name="age"]');

        if (dobField && ageField && dobField.value) {
            const age = calculateAge(dobField.value);
            ageField.value = age;
            this.checkForChanges(formId);
        }
    }

    /**
     * Add a new visit to the form
     * @param {string} formId - Form identifier
     */
    addVisit(formId) {
        const form = this.forms[formId];
        const visitsContainer = form.querySelector(`#${formId}-visits-container`);
        const noVisitsMessage = visitsContainer.querySelector('.no-visits-message');

        // Remove "no visits" message if present
        if (noVisitsMessage) {
            noVisitsMessage.remove();
        }

        // Get current visit count
        const existingVisits = visitsContainer.querySelectorAll('.visit-item');
        const visitIndex = existingVisits.length;

        // Create new visit
        const newVisit = {
            id: generateId(),
            visitDate: formatDateForInput(new Date()),
            medications: '',
            observations: '',
            additionalComments: ''
        };

        // Add visit HTML
        const visitHtml = this.renderVisit(formId, newVisit, visitIndex);
        visitsContainer.insertAdjacentHTML('beforeend', visitHtml);

        // Set up event listeners for new visit
        const newVisitElement = visitsContainer.querySelector(`[data-visit-index="${visitIndex}"]`);
        this.setupVisitEventListeners(formId, newVisitElement, visitIndex);

        // Mark as changed
        this.checkForChanges(formId);

        // Scroll to new visit
        newVisitElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    /**
     * Remove a visit from the form
     * @param {string} formId - Form identifier
     * @param {number} visitIndex - Index of visit to remove
     */
    removeVisit(formId, visitIndex) {
        const form = this.forms[formId];
        const visitsContainer = form.querySelector(`#${formId}-visits-container`);
        const visitElement = visitsContainer.querySelector(`[data-visit-index="${visitIndex}"]`);

        if (visitElement) {
            visitElement.remove();

            // Reindex remaining visits
            this.reindexVisits(formId);

            // Check if no visits remain
            const remainingVisits = visitsContainer.querySelectorAll('.visit-item');
            if (remainingVisits.length === 0) {
                visitsContainer.innerHTML = `
                    <div class="no-visits-message">
                        <p>No visits recorded yet. Click "Add Visit" to add the first visit.</p>
                    </div>
                `;
            }

            // Mark as changed
            this.checkForChanges(formId);
        }
    }

    /**
     * Reindex visits after removal
     * @param {string} formId - Form identifier
     */
    reindexVisits(formId) {
        const form = this.forms[formId];
        const visitsContainer = form.querySelector(`#${formId}-visits-container`);
        const visitElements = visitsContainer.querySelectorAll('.visit-item');

        visitElements.forEach((visitElement, newIndex) => {
            // Update data attributes
            visitElement.dataset.visitIndex = newIndex;

            // Update visit title
            const title = visitElement.querySelector('.visit-title');
            if (title) {
                title.textContent = `Visit ${newIndex + 1}`;
            }

            // Update form field names and IDs
            const inputs = visitElement.querySelectorAll('input, textarea');
            inputs.forEach(input => {
                const name = input.name;
                if (name && name.includes('visits[')) {
                    input.name = name.replace(/visits\[\d+\]/, `visits[${newIndex}]`);
                }

                const id = input.id;
                if (id && id.includes('-visit-')) {
                    input.id = id.replace(/-visit-\d+-/, `-visit-${newIndex}-`);
                }
            });

            // Update labels
            const labels = visitElement.querySelectorAll('label');
            labels.forEach(label => {
                const forAttr = label.getAttribute('for');
                if (forAttr && forAttr.includes('-visit-')) {
                    label.setAttribute('for', forAttr.replace(/-visit-\d+-/, `-visit-${newIndex}-`));
                }
            });

            // Update error containers
            const errorContainers = visitElement.querySelectorAll('.form-error');
            errorContainers.forEach(container => {
                const id = container.id;
                if (id && id.includes('-visit-')) {
                    container.id = id.replace(/-visit-\d+-/, `-visit-${newIndex}-`);
                }
            });

            // Update remove button
            const removeBtn = visitElement.querySelector('.remove-visit-btn');
            if (removeBtn) {
                removeBtn.dataset.visitIndex = newIndex;
            }
        });
    }

    /**
     * Set up event listeners for a specific visit
     * @param {string} formId - Form identifier
     * @param {Element} visitElement - Visit DOM element
     * @param {number} visitIndex - Visit index
     */
    setupVisitEventListeners(formId, visitElement, visitIndex) {
        const inputs = visitElement.querySelectorAll('input, textarea');

        inputs.forEach(input => {
            // Validate on blur
            input.addEventListener('blur', () => {
                this.validateField(formId, input);
            });

            // Clear errors on input
            input.addEventListener('input', () => {
                this.clearFieldError(formId, input);
                this.checkForChanges(formId);
            });

            // Track changes
            input.addEventListener('change', () => {
                this.checkForChanges(formId);
            });
        });
    }

    /**
     * Validate a single form field
     * @param {string} formId - Form identifier
     * @param {Element} field - Field element to validate
     */
    validateField(formId, field) {
        const fieldName = field.name;
        const fieldValue = field.value.trim();
        const errors = [];

        // Skip validation for hidden fields
        if (field.type === 'hidden') return true;

        // Required field validation
        if (field.required && !fieldValue) {
            errors.push(ERROR_MESSAGES.validation.required);
        }

        // Field-specific validation
        if (fieldValue) {
            if (fieldName === 'firstName' || fieldName === 'lastName') {
                const rules = VALIDATION_RULES.patient[fieldName];
                if (fieldValue.length < rules.minLength) {
                    errors.push(ERROR_MESSAGES.validation.minLength.replace('{min}', rules.minLength));
                }
                if (fieldValue.length > rules.maxLength) {
                    errors.push(ERROR_MESSAGES.validation.maxLength.replace('{max}', rules.maxLength));
                }
                if (!rules.pattern.test(fieldValue)) {
                    errors.push('Only letters, spaces, hyphens, and apostrophes are allowed');
                }
            }

            if (fieldName === 'dateOfBirth' || fieldName.includes('visitDate')) {
                const date = new Date(fieldValue);
                const today = new Date();
                today.setHours(23, 59, 59, 999); // Allow today's date
                if (isNaN(date.getTime())) {
                    errors.push(ERROR_MESSAGES.validation.date);
                } else if (date > today) {
                    errors.push(ERROR_MESSAGES.validation.future);
                }
            }

            if (fieldName === 'placeOfResidence') {
                const rules = VALIDATION_RULES.patient.placeOfResidence;
                if (fieldValue.length < rules.minLength) {
                    errors.push(ERROR_MESSAGES.validation.minLength.replace('{min}', rules.minLength));
                }
                if (fieldValue.length > rules.maxLength) {
                    errors.push(ERROR_MESSAGES.validation.maxLength.replace('{max}', rules.maxLength));
                }
            }

            // Validate textarea fields for visits
            if (fieldName.includes('medications') || fieldName.includes('observations') || fieldName.includes('additionalComments')) {
                if (fieldValue.length > 2000) {
                    errors.push('Text is too long (maximum 2000 characters)');
                }
            }
        }

        // Display errors
        if (errors.length > 0) {
            this.showFieldError(formId, field, errors[0]);
            return false;
        } else {
            this.clearFieldError(formId, field);
            return true;
        }
    }

    /**
     * Show field validation error
     * @param {string} formId - Form identifier
     * @param {Element} field - Field element
     * @param {string} message - Error message
     */
    showFieldError(formId, field, message) {
        field.classList.add('error');

        const errorId = field.id + '-error';
        const errorContainer = document.getElementById(errorId);

        if (errorContainer) {
            errorContainer.textContent = message;
            errorContainer.style.display = 'block';
        }
    }

    /**
     * Clear field validation error
     * @param {string} formId - Form identifier
     * @param {Element} field - Field element
     */
    clearFieldError(formId, field) {
        field.classList.remove('error');

        const errorId = field.id + '-error';
        const errorContainer = document.getElementById(errorId);

        if (errorContainer) {
            errorContainer.textContent = '';
            errorContainer.style.display = 'none';
        }
    }

    /**
     * Validate entire form
     * @param {string} formId - Form identifier
     * @returns {Object} Validation result
     */
    validateForm(formId) {
        const form = this.forms[formId];
        const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
        let isValid = true;
        const errors = {};

        // Validate each field
        inputs.forEach(input => {
            if (!this.validateField(formId, input)) {
                isValid = false;
                errors[input.name] = 'Validation failed';
            }
        });

        this.validationErrors[formId] = errors;
        return { isValid, errors };
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
            if (key.includes('[')) {
                // Handle array fields (visits)
                const match = key.match(/(\w+)\[(\d+)\]\[(\w+)\]/);
                if (match) {
                    const [, arrayName, index, fieldName] = match;
                    if (!data[arrayName]) data[arrayName] = [];
                    if (!data[arrayName][index]) data[arrayName][index] = {};
                    data[arrayName][index][fieldName] = value;
                }
            } else {
                data[key] = value;
            }
        }

        // Calculate age if date of birth is provided
        if (data.dateOfBirth) {
            data.age = calculateAge(data.dateOfBirth);
        }

        // Clean up visits array (remove empty slots and add timestamps)
        if (data.visits) {
            data.visits = data.visits.filter(visit => visit && visit.visitDate).map(visit => ({
                ...visit,
                id: visit.id || generateId(),
                createdAt: visit.createdAt || getCurrentTimestamp()
            }));
        }

        // Add timestamps for new records
        if (!data.id) {
            data.id = generateId();
            data.createdAt = getCurrentTimestamp();
        }
        data.updatedAt = getCurrentTimestamp();

        return data;
    }

    /**
     * Handle form submission
     * @param {string} formId - Form identifier
     */
    async handleFormSubmit(formId) {
        const validation = this.validateForm(formId);

        if (!validation.isValid) {
            // Scroll to first error
            const firstError = document.querySelector(`#${formId} .form-control.error`);
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                firstError.focus();
            }
            return;
        }

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
     * Check if form has unsaved changes
     * @param {string} formId - Form identifier
     * @returns {boolean} True if form has unsaved changes
     */
    hasUnsavedChanges(formId) {
        return this.unsavedChanges[formId] || false;
    }

    /**
     * Reset form to original state
     * @param {string} formId - Form identifier
     */
    resetForm(formId) {
        const form = this.forms[formId];
        if (form) {
            form.reset();
            this.unsavedChanges[formId] = false;
            this.validationErrors[formId] = {};

            // Clear all error messages
            const errorContainers = form.querySelectorAll('.form-error');
            errorContainers.forEach(container => {
                container.textContent = '';
                container.style.display = 'none';
            });

            // Remove error classes
            const errorFields = form.querySelectorAll('.form-control.error');
            errorFields.forEach(field => {
                field.classList.remove('error');
            });
        }
    }

    /**
     * Destroy form and clean up
     * @param {string} formId - Form identifier
     */
    destroyForm(formId) {
        delete this.forms[formId];
        delete this.unsavedChanges[formId];
        delete this.validationErrors[formId];
        delete this.originalData[formId];
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FormManager;
}