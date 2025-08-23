/**
 * Composant Gestionnaire de Formulaires
 * Gère le rendu, la validation et la gestion d'état des formulaires
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

        const patient = data.id ? data : PATIENT_SCHEMA || {};
        const visits = patient.visits || [];

        return `
            <form id="${formId}" class="patient-form" novalidate>
                <input type="hidden" name="id" value="${patient.id || ''}" />
                
                <!-- Personal Information Section -->
                <div class="form-section">
                    <h3 class="form-section-title">Informations Personnelles</h3>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="${formId}-firstName" class="form-label">
                                Prénom <span class="required">*</span>
                            </label>
                            <input 
                                type="text" 
                                id="${formId}-firstName" 
                                name="firstName" 
                                class="form-control" 
                                value="${patient.firstName || ''}"
                                placeholder="Entrez le prénom"
                                maxlength="50"
                                required
                            />
                            <div class="form-error" id="${formId}-firstName-error"></div>
                        </div>
                        
                        <div class="form-group">
                            <label for="${formId}-lastName" class="form-label">
                                Nom de famille <span class="required">*</span>
                            </label>
                            <input 
                                type="text" 
                                id="${formId}-lastName" 
                                name="lastName" 
                                class="form-control" 
                                value="${patient.lastName || ''}"
                                placeholder="Entrez le nom de famille"
                                maxlength="50"
                                required
                            />
                            <div class="form-error" id="${formId}-lastName-error"></div>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="${formId}-dateOfBirth" class="form-label">
                                Date de naissance <span class="required">*</span>
                            </label>
                            <input 
                                type="date" 
                                id="${formId}-dateOfBirth" 
                                name="dateOfBirth" 
                                class="form-control" 
                                value="${this.formatDateForInput(patient.dateOfBirth)}"
                                max="${this.getTodayDateString()}"
                                required
                            />
                            <div class="form-error" id="${formId}-dateOfBirth-error"></div>
                        </div>
                        
                        <div class="form-group">
                            <label for="${formId}-dateAge" class="form-label">Âge calculé</label>
                            <input 
                                type="number" 
                                id="${formId}-dateAge" 
                                name="dateAge" 
                                class="form-control" 
                                value="${patient.dateAge || ''}"
                                min="0" 
                                max="150"
                                readonly
                                placeholder="Calculé à partir de la date de naissance"
                            />
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="${formId}-placeOfResidence" class="form-label">
                                Lieu de résidence <span class="required">*</span>
                            </label>
                            <input 
                                type="text" 
                                id="${formId}-placeOfResidence" 
                                name="placeOfResidence" 
                                class="form-control" 
                                value="${patient.placeOfResidence || ''}"
                                placeholder="Entrez le lieu de résidence"
                                maxlength="100"
                                required
                            />
                            <div class="form-error" id="${formId}-placeOfResidence-error"></div>
                        </div>
                        
                        <div class="form-group">
                            <label for="${formId}-age" class="form-label">
                                Âge <span class="required">*</span>
                            </label>
                            <input 
                                type="number" 
                                id="${formId}-age" 
                                name="age" 
                                class="form-control" 
                                value="${patient.age || ''}"
                                min="0" 
                                max="150"
                                placeholder="Entrez l'âge"
                                required
                            />
                            <div class="form-error" id="${formId}-age-error"></div>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="${formId}-atcdsMedicaux" class="form-label">
                                ATCDS MEDICAUX
                            </label>
                            <textarea 
                                id="${formId}-atcdsMedicaux" 
                                name="atcdsMedicaux" 
                                class="form-control" 
                                rows="4"
                                placeholder="Entrez les antécédents médicaux"
                                maxlength="2000"
                            >${patient.atcdsMedicaux || ''}</textarea>
                            <div class="form-error" id="${formId}-atcdsMedicaux-error"></div>
                        </div>
                        
                        <div class="form-group">
                            <label for="${formId}-atcdsChirurgicaux" class="form-label">
                                ATCDS CHIRURGICAUX
                            </label>
                            <textarea 
                                id="${formId}-atcdsChirurgicaux" 
                                name="atcdsChirurgicaux" 
                                class="form-control" 
                                rows="4"
                                placeholder="Entrez les antécédents chirurgicaux"
                                maxlength="2000"
                            >${patient.atcdsChirurgicaux || ''}</textarea>
                            <div class="form-error" id="${formId}-atcdsChirurgicaux-error"></div>
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
        const visitId = visit.id || this.generateId();

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
                            value="${this.formatDateForInput(visit.visitDate)}"
                            max="${this.getTodayDateString()}"
                            required
                        />
                        <div class="form-error" id="${formId}-visit-${index}-date-error"></div>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="${formId}-visit-${index}-consultation" class="form-label">
                        CONSULTATION
                    </label>
                    <textarea 
                        id="${formId}-visit-${index}-consultation" 
                        name="visits[${index}][consultation]" 
                        class="form-control" 
                        rows="4"
                        placeholder="Entrez les observations cliniques, les symptômes et les notes médicales"
                        maxlength="2000"
                    >${visit.consultation || ''}</textarea>
                    <div class="form-error" id="${formId}-visit-${index}-consultation-error"></div>
                </div>
                
                <div class="form-group">
                    <label for="${formId}-visit-${index}-billan" class="form-label">
                        BILLAN
                    </label>
                    <textarea 
                        id="${formId}-visit-${index}-billan" 
                        name="visits[${index}][billan]" 
                        class="form-control" 
                        rows="4"
                        placeholder="Entrez les remarques sur le bilan"
                        maxlength="2000"
                    >${visit.billan || ''}</textarea>
                    <div class="form-error" id="${formId}-visit-${index}-billan-error"></div>
                </div>
                
                <div class="form-group">
                    <label for="${formId}-visit-${index}-cat" class="form-label">
                        CAT
                    </label>
                    <textarea 
                        id="${formId}-visit-${index}-cat" 
                        name="visits[${index}][cat]" 
                        class="form-control" 
                        rows="3"
                        placeholder="Entrez les médicaments prescrits lors de cette visite"
                        maxlength="1000"
                    >${visit.cat || ''}</textarea>
                    <div class="form-error" id="${formId}-visit-${index}-cat-error"></div>
                </div>
                
                <div class="form-group">
                    <label for="${formId}-visit-${index}-examenClinique" class="form-label">
                        EXAMEN CLINIQUE
                    </label>
                    <textarea 
                        id="${formId}-visit-${index}-examenClinique" 
                        name="visits[${index}][examenClinique]" 
                        class="form-control" 
                        rows="4"
                        placeholder="Entrez les remarques sur l'examen clinique"
                        maxlength="2000"
                    >${visit.examenClinique || ''}</textarea>
                    <div class="form-error" id="${formId}-visit-${index}-examenClinique-error"></div>
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
     * Format date for input field
     * @param {string|Date} date - Date to format
     * @returns {string} Formatted date string
     */
    formatDateForInput(date) {
        if (!date) return '';

        try {
            const d = new Date(date);
            if (isNaN(d.getTime())) return '';

            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');

            return `${year}-${month}-${day}`;
        } catch (error) {
            console.error('Error formatting date:', error);
            return '';
        }
    }

    /**
     * Get today's date as a string for date input max attribute
     * @returns {string} Today's date in YYYY-MM-DD format
     */
    getTodayDateString() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    /**
     * Generate unique ID
     * @returns {string} Unique identifier
     */
    generateId() {
        return 'id_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
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
     * Update age field based on date of birth
     * @param {string} formId - Form identifier
     */
    updateAge(formId) {
        const form = this.forms[formId];
        const dobField = form.querySelector('[name="dateOfBirth"]');
        const dateAgeField = form.querySelector('[name="dateAge"]');

        if (dobField && dateAgeField && dobField.value) {
            const age = this.calculateAge(dobField.value);
            dateAgeField.value = age;
            this.checkForChanges(formId);
        }
    }

    /**
     * Calculate age from date of birth
     * @param {string} dateOfBirth - Date of birth string
     * @returns {number} Age in years
     */
    calculateAge(dateOfBirth) {
        try {
            const today = new Date();
            const birthDate = new Date(dateOfBirth);
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();

            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }

            return Math.max(0, age);
        } catch (error) {
            console.error('Error calculating age:', error);
            return 0;
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
            id: this.generateId(),
            visitDate: this.formatDateForInput(new Date()),
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
        const fieldName = field.name;
        const fieldValue = field.value.trim();
        const errors = [];

        // Skip validation for hidden fields
        if (field.type === 'hidden') return true;

        try {
            // Required field validation
            if (field.required && !fieldValue) {
                errors.push('This field is required');
            }

            // Field-specific validation
            if (fieldValue) {
                if (fieldName === 'firstName' || fieldName === 'lastName') {
                    if (fieldValue.length < 2) {
                        errors.push('Must be at least 2 characters long');
                    }
                    if (fieldValue.length > 50) {
                        errors.push('Must be less than 50 characters');
                    }
                    if (!/^[a-zA-Z\s\-']+$/.test(fieldValue)) {
                        errors.push('Only letters, spaces, hyphens, and apostrophes are allowed');
                    }
                }

                if (fieldName === 'dateOfBirth' || fieldName.includes('visitDate')) {
                    const date = new Date(fieldValue);
                    const today = new Date();
                    today.setHours(23, 59, 59, 999);

                    if (isNaN(date.getTime())) {
                        errors.push('Please enter a valid date');
                    } else if (date > today) {
                        errors.push('Date cannot be in the future');
                    }
                }

                if (fieldName === 'placeOfResidence') {
                    if (fieldValue.length < 2) {
                        errors.push('Must be at least 2 characters long');
                    }
                    if (fieldValue.length > 100) {
                        errors.push('Must be less than 100 characters');
                    }
                }

                if (fieldName === 'age') {
                    const age = parseInt(fieldValue);
                    if (isNaN(age) || age < 0 || age > 150) {
                        errors.push('Please enter a valid age between 0 and 150');
                    }
                }

                // Validate medical and surgical history fields
                if (fieldName === 'atcdsMedicaux' || fieldName === 'atcdsChirurgicaux') {
                    if (fieldValue.length > 2000) {
                        errors.push('Text is too long (maximum 2000 characters)');
                    }
                }

                // Validate textarea fields for visits
                if (fieldName.includes('consultation') || fieldName.includes('billan') || fieldName.includes('cat') || fieldName.includes('examenClinique')) {
                    if (fieldValue.length > 2000) {
                        errors.push('Text is too long (maximum 2000 characters)');
                    }
                }
            }

            // Display errors or clear them
            if (errors.length > 0) {
                this.showFieldError(formId, field, errors[0]);
                return false;
            } else {
                this.clearFieldError(formId, field);
                return true;
            }

        } catch (error) {
            // Handle validation errors
            if (typeof window !== 'undefined' && window.app && window.app.components.errorHandler) {
                window.app.components.errorHandler.handleError({
                    type: window.app.components.errorHandler.errorTypes.CLIENT,
                    message: 'Error validating form field',
                    error: error,
                    context: `Field Validation - ${formId}.${fieldName}`,
                    formId: formId,
                    fieldName: fieldName
                });
            }

            console.error('Field validation error:', error);
            return false;
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

        // Add error indicator
        this.addFieldErrorIndicator(field);
    }

    /**
     * Clear field validation error
     * @param {string} formId - Form identifier
     * @param {Element} field - Field element
     */
    clearFieldError(formId, field) {
        field.classList.remove('error');
        field.classList.add('valid');

        const errorId = field.id + '-error';
        const errorContainer = document.getElementById(errorId);

        if (errorContainer) {
            errorContainer.textContent = '';
            errorContainer.style.display = 'none';
        }

        // Remove error indicator and add success indicator
        this.removeFieldErrorIndicator(field);
        this.addFieldSuccessIndicator(field);
    }

    /**
     * Add error indicator to field
     * @param {Element} field - Field element
     */
    addFieldErrorIndicator(field) {
        this.removeFieldIndicators(field);

        const indicator = document.createElement('span');
        indicator.className = 'field-error-indicator';
        indicator.innerHTML = '✗';
        indicator.setAttribute('aria-hidden', 'true');

        const parent = field.parentElement;
        if (parent && parent.style.position !== 'relative') {
            parent.style.position = 'relative';
        }
        parent.appendChild(indicator);
    }

    /**
     * Add success indicator to field
     * @param {Element} field - Field element
     */
    addFieldSuccessIndicator(field) {
        // Only add success indicator for required fields that have values
        if (!field.required || !field.value.trim()) {
            return;
        }

        this.removeFieldIndicators(field);

        const indicator = document.createElement('span');
        indicator.className = 'field-success-indicator';
        indicator.innerHTML = '✓';
        indicator.setAttribute('aria-hidden', 'true');

        const parent = field.parentElement;
        if (parent && parent.style.position !== 'relative') {
            parent.style.position = 'relative';
        }
        parent.appendChild(indicator);
    }

    /**
     * Remove all field indicators
     * @param {Element} field - Field element
     */
    removeFieldIndicators(field) {
        const parent = field.parentElement;
        if (parent) {
            const indicators = parent.querySelectorAll('.field-error-indicator, .field-success-indicator');
            indicators.forEach(indicator => indicator.remove());
        }
    }

    /**
     * Remove error indicator from field
     * @param {Element} field - Field element
     */
    removeFieldErrorIndicator(field) {
        const parent = field.parentElement;
        if (parent) {
            const indicator = parent.querySelector('.field-error-indicator');
            if (indicator) {
                indicator.remove();
            }
        }
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
            data.age = this.calculateAge(data.dateOfBirth);
        }

        // Clean up visits array (remove empty slots and add timestamps)
        if (data.visits) {
            data.visits = data.visits.filter(visit => visit && visit.visitDate).map(visit => ({
                ...visit,
                id: visit.id || this.generateId(),
                createdAt: visit.createdAt || this.getCurrentTimestamp()
            }));
        }

        // Add timestamps for new records
        if (!data.id) {
            data.id = this.generateId();
            data.createdAt = this.getCurrentTimestamp();
        }
        data.updatedAt = this.getCurrentTimestamp();

        return data;
    }

    /**
     * Get current timestamp
     * @returns {number} Current timestamp
     */
    getCurrentTimestamp() {
        return Date.now();
    }

    /**
     * Handle form submission
     * @param {string} formId - Form identifier
     */
    async handleFormSubmit(formId) {
        try {
            // Validate form before submission
            const validation = this.validateForm(formId);

            if (!validation.isValid) {
                // Show validation errors
                this.showValidationErrors(formId, validation.errors);

                // Use ErrorHandler if available
                if (typeof window !== 'undefined' && window.app && window.app.components.errorHandler) {
                    window.app.components.errorHandler.handleError({
                        type: window.app.components.errorHandler.errorTypes.VALIDATION,
                        message: 'Please correct the form errors and try again.',
                        context: `Form Validation - ${formId}`,
                        formId: formId,
                        validationErrors: validation.errors
                    });
                }

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

        } catch (error) {
            // Handle unexpected errors during form submission
            if (typeof window !== 'undefined' && window.app && window.app.components.errorHandler) {
                window.app.components.errorHandler.handleError({
                    type: window.app.components.errorHandler.errorTypes.CLIENT,
                    message: 'An error occurred while processing the form.',
                    error: error,
                    context: `Form Submission Handler - ${formId}`,
                    formId: formId
                });
            } else {
                console.error('Form submission error:', error);
            }
        }
    }

    /**
     * Validate entire form
     * @param {string} formId - Form identifier
     * @returns {Object} Validation result
     */
    validateForm(formId) {
        const form = this.forms[formId];
        if (!form) {
            return { isValid: false, errors: { form: 'Form not found' } };
        }

        const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
        let isValid = true;
        const errors = {};

        // Validate each required field
        inputs.forEach(input => {
            if (!this.validateField(formId, input)) {
                isValid = false;
                errors[input.name] = 'Validation failed';
            }
        });

        // Additional custom validation
        const customValidation = this.performCustomValidation(formId, form);
        if (!customValidation.isValid) {
            isValid = false;
            Object.assign(errors, customValidation.errors);
        }

        this.validationErrors[formId] = errors;
        return { isValid, errors };
    }

    /**
     * Perform custom validation logic
     * @param {string} formId - Form identifier
     * @param {HTMLFormElement} form - Form element
     * @returns {Object} Validation result
     */
    performCustomValidation(formId, form) {
        const errors = {};
        let isValid = true;

        // Validate date of birth is not in the future
        const dobField = form.querySelector('[name="dateOfBirth"]');
        if (dobField && dobField.value) {
            const dob = new Date(dobField.value);
            const today = new Date();
            today.setHours(23, 59, 59, 999);

            if (dob > today) {
                errors.dateOfBirth = 'Date of birth cannot be in the future';
                isValid = false;
                this.showFieldError(formId, dobField, errors.dateOfBirth);
            }
        }

        // Validate that at least one visit has meaningful data if visits exist
        const visitElements = form.querySelectorAll('.visit-item');
        if (visitElements.length > 0) {
            let hasValidVisit = false;
            visitElements.forEach((visitElement, index) => {
                const dateField = visitElement.querySelector('[name*="visitDate"]');
                const consultationField = visitElement.querySelector('[name*="consultation"]');
                const billanField = visitElement.querySelector('[name*="billan"]');
                const catField = visitElement.querySelector('[name*="cat"]');
                const examenCliniqueField = visitElement.querySelector('[name*="examenClinique"]');

                if (dateField && dateField.value &&
                    (consultationField && consultationField.value.trim() ||
                        billanField && billanField.value.trim() ||
                        catField && catField.value.trim() ||
                        examenCliniqueField && examenCliniqueField.value.trim())) {
                    hasValidVisit = true;
                }
            });

            if (!hasValidVisit && visitElements.length > 0) {
                errors.visits = 'At least one visit must have a date and one of: consultation, billan, CAT, or examen clinique';
                isValid = false;
            }
        }

        return { isValid, errors };
    }

    /**
     * Show validation errors summary
     * @param {string} formId - Form identifier
     * @param {Object} errors - Validation errors
     */
    showValidationErrors(formId, errors) {
        const form = this.forms[formId];
        if (!form) return;

        // Remove existing error summary
        const existingSummary = form.querySelector('.form-error-summary');
        if (existingSummary) {
            existingSummary.remove();
        }

        // Create error summary
        const errorSummary = document.createElement('div');
        errorSummary.className = 'form-error-summary';

        const errorList = Object.entries(errors).map(([field, message]) =>
            `<li class="form-error-summary-item">${this.getFieldDisplayName(field)}: ${message}</li>`
        ).join('');

        errorSummary.innerHTML = `
            <div class="form-error-summary-title">
                <span>⚠</span> Please correct the following errors:
            </div>
            <ul class="form-error-summary-list">
                ${errorList}
            </ul>
        `;

        // Insert at the top of the form
        form.insertBefore(errorSummary, form.firstChild);

        // Scroll to error summary
        errorSummary.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    /**
     * Get display name for form field
     * @param {string} fieldName - Field name
     * @returns {string} Display name
     */
    getFieldDisplayName(fieldName) {
        const displayNames = {
            firstName: 'First Name',
            lastName: 'Last Name',
            dateOfBirth: 'Date of Birth',
            placeOfResidence: 'Place of Residence',
            gender: 'Gender',
            visits: 'Visits',
            form: 'Form'
        };

        return displayNames[fieldName] || fieldName;
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