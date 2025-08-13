/**
 * Patient Detail View Component
 * Displays comprehensive patient information
 */

class PatientDetailView {
    constructor(patient, patientManager = null, uiRouter = null) {
        this.patient = patient;
        this.patientManager = patientManager;
        this.uiRouter = uiRouter;
        this.isEditMode = false;
        this.formManager = null;
        this.originalPatientData = null;

        // Bind methods
        this.handleEdit = this.handleEdit.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.handleBack = this.handleBack.bind(this);
        this.handleSave = this.handleSave.bind(this);
        this.handleCancelEdit = this.handleCancelEdit.bind(this);
        this.toggleEditMode = this.toggleEditMode.bind(this);
    }

    /**
     * Render the patient detail view
     * @returns {string} HTML string for patient details
     */
    render() {
        if (!this.patient) {
            return this.renderNotFound();
        }

        if (this.isEditMode) {
            return this.renderEditMode();
        } else {
            return this.renderViewMode();
        }
    }

    /**
     * Render view mode (read-only display)
     * @returns {string} HTML string for view mode
     */
    renderViewMode() {
        return `
            <div class="patient-detail-container">
                <div class="content-header">
                    <div class="content-header-actions">
                        <button class="btn btn-secondary back-button" onclick="patientDetailView.handleBack()">
                            ← Back to Search
                        </button>
                        <div class="patient-actions">
                            <button class="btn btn-primary edit-button" onclick="patientDetailView.handleEdit()">
                                Edit Patient
                            </button>
                            <button class="btn btn-danger delete-button" onclick="patientDetailView.handleDelete()">
                                Delete Patient
                            </button>
                        </div>
                    </div>
                    <h2 class="content-title">${this.patient.getFullName()}</h2>
                    <p class="content-subtitle">Patient Record Details</p>
                </div>

                <div class="patient-detail-content">
                    <!-- Basic Information -->
                    <div class="card patient-info-card">
                        <div class="card-header">
                            <h3 class="card-title">Basic Information</h3>
                        </div>
                        <div class="card-body">
                            <div class="patient-info-grid">
                                <div class="info-item">
                                    <label class="info-label">Full Name:</label>
                                    <span class="info-value">${this.patient.getFullName()}</span>
                                </div>
                                <div class="info-item">
                                    <label class="info-label">Age:</label>
                                    <span class="info-value">${this.patient.age || 'Not specified'}</span>
                                </div>
                                <div class="info-item">
                                    <label class="info-label">Date of Birth:</label>
                                    <span class="info-value">${this.formatDate(this.patient.dateOfBirth) || 'Not specified'}</span>
                                </div>
                                <div class="info-item">
                                    <label class="info-label">Gender:</label>
                                    <span class="info-value">${this.formatGender(this.patient.gender)}</span>
                                </div>
                                <div class="info-item">
                                    <label class="info-label">Place of Residence:</label>
                                    <span class="info-value">${this.patient.placeOfResidence || 'Not specified'}</span>
                                </div>
                                <div class="info-item">
                                    <label class="info-label">Patient ID:</label>
                                    <span class="info-value patient-id">${this.patient.id}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Visit History -->
                    <div class="card visits-card">
                        <div class="card-header">
                            <h3 class="card-title">Visit History</h3>
                            <span class="visits-count">${this.patient.visits ? this.patient.visits.length : 0} visit${this.patient.visits && this.patient.visits.length !== 1 ? 's' : ''}</span>
                        </div>
                        <div class="card-body">
                            ${this.renderVisitHistory()}
                        </div>
                    </div>

                    <!-- Record Information -->
                    <div class="card record-info-card">
                        <div class="card-header">
                            <h3 class="card-title">Record Information</h3>
                        </div>
                        <div class="card-body">
                            <div class="record-info-grid">
                                <div class="info-item">
                                    <label class="info-label">Created:</label>
                                    <span class="info-value">${this.formatDateTime(this.patient.createdAt)}</span>
                                </div>
                                <div class="info-item">
                                    <label class="info-label">Last Updated:</label>
                                    <span class="info-value">${this.formatDateTime(this.patient.updatedAt)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render edit mode (editable form)
     * @returns {string} HTML string for edit mode
     */
    renderEditMode() {
        // Initialize form manager if not already done
        if (!this.formManager) {
            this.formManager = new FormManager();
        }

        const formId = `edit-patient-${this.patient.id}`;

        return `
            <div class="patient-detail-container edit-mode">
                <div class="content-header">
                    <div class="content-header-actions">
                        <button class="btn btn-secondary back-button" onclick="patientDetailView.handleBack()">
                            ← Back to Search
                        </button>
                        <div class="patient-actions">
                            <button class="btn btn-success save-button" onclick="patientDetailView.handleSave()">
                                Save Changes
                            </button>
                            <button class="btn btn-secondary cancel-edit-button" onclick="patientDetailView.handleCancelEdit()">
                                Cancel Edit
                            </button>
                        </div>
                    </div>
                    <h2 class="content-title">Edit Patient: ${this.patient.getFullName()}</h2>
                    <p class="content-subtitle">Modify patient record information</p>
                    <div class="unsaved-changes-indicator" id="unsaved-changes-indicator" style="display: none;">
                        <span class="indicator-icon">⚠️</span>
                        <span class="indicator-text">You have unsaved changes</span>
                    </div>
                </div>

                <div class="patient-edit-content">
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Edit Patient Information</h3>
                        </div>
                        <div class="card-body">
                            ${this.formManager.renderPatientForm(formId, this.patient.toJSON())}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render visit history section
     * @returns {string} HTML string for visit history
     */
    renderVisitHistory() {
        if (!this.patient.visits || this.patient.visits.length === 0) {
            return `
                <div class="no-visits-message">
                    <div class="no-visits-icon">📅</div>
                    <h4>No visits recorded</h4>
                    <p>This patient has no visit history on record.</p>
                </div>
            `;
        }

        // Sort visits by date (most recent first)
        const sortedVisits = [...this.patient.visits].sort((a, b) => {
            const dateA = new Date(a.visitDate);
            const dateB = new Date(b.visitDate);
            return dateB - dateA;
        });

        return `
            <div class="visits-list">
                ${sortedVisits.map((visit, index) => this.renderVisitItem(visit, index)).join('')}
            </div>
        `;
    }

    /**
     * Render individual visit item
     * @param {Object} visit - Visit data
     * @param {number} index - Visit index
     * @returns {string} HTML string for visit item
     */
    renderVisitItem(visit, index) {
        return `
            <div class="visit-detail-item">
                <div class="visit-detail-header">
                    <h4 class="visit-detail-title">
                        Visit ${index + 1} - ${this.formatDate(visit.visitDate)}
                    </h4>
                    <span class="visit-detail-date">${this.getRelativeDate(visit.visitDate)}</span>
                </div>
                <div class="visit-detail-content">
                    <div class="visit-detail-section">
                        <label class="visit-detail-label">Medications Prescribed:</label>
                        <div class="visit-detail-value">
                            ${visit.medications ?
                `<p class="medication-text">${this.formatText(visit.medications)}</p>` :
                '<p class="no-data">No medications recorded</p>'
            }
                        </div>
                    </div>
                    <div class="visit-detail-section">
                        <label class="visit-detail-label">Observations:</label>
                        <div class="visit-detail-value">
                            ${visit.observations ?
                `<p class="observation-text">${this.formatText(visit.observations)}</p>` :
                '<p class="no-data">No observations recorded</p>'
            }
                        </div>
                    </div>
                    ${visit.additionalComments ? `
                        <div class="visit-detail-section">
                            <label class="visit-detail-label">Additional Comments:</label>
                            <div class="visit-detail-value">
                                <p class="comment-text">${this.formatText(visit.additionalComments)}</p>
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    /**
     * Render not found message
     * @returns {string} HTML string for not found message
     */
    renderNotFound() {
        return `
            <div class="patient-not-found">
                <div class="card">
                    <div class="card-body text-center">
                        <div class="not-found-icon">❌</div>
                        <h3>Patient Not Found</h3>
                        <p>The requested patient record could not be found.</p>
                        <button class="btn btn-primary" onclick="patientDetailView.handleBack()">
                            Back to Search
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Initialize the detail view
     */
    initialize() {
        log('PatientDetailView initialized', 'info');

        // Initialize form manager if in edit mode
        if (this.isEditMode && !this.formManager) {
            this.formManager = new FormManager();
            const formId = `edit-patient-${this.patient.id}`;
            setTimeout(() => {
                this.formManager.initializeForm(formId);
                this.setupChangeTracking(formId);
            }, 100);
        }

        // Set up keyboard shortcuts
        this.setupKeyboardShortcuts();
    }

    /**
     * Set up keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        const handleKeyDown = (event) => {
            // Only handle shortcuts when this view is active
            if (!document.querySelector('.patient-detail-container')) {
                return;
            }

            if (event.ctrlKey || event.metaKey) {
                switch (event.key) {
                    case 's':
                        event.preventDefault();
                        if (this.isEditMode) {
                            this.handleSave();
                        }
                        break;
                    case 'e':
                        event.preventDefault();
                        if (!this.isEditMode) {
                            this.handleEdit();
                        }
                        break;
                    case 'Escape':
                        event.preventDefault();
                        if (this.isEditMode) {
                            this.handleCancelEdit();
                        }
                        break;
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        // Store reference for cleanup
        this.keydownHandler = handleKeyDown;
    }

    /**
     * Handle edit button click
     */
    handleEdit() {
        try {
            log(`Edit patient requested: ${this.patient.id}`, 'info');
            this.toggleEditMode(true);
        } catch (error) {
            log(`Failed to edit patient: ${error.message}`, 'error');
            this.showToast('Failed to open edit form', 'error');
        }
    }

    /**
     * Handle delete button click
     */
    async handleDelete() {
        try {
            const patientName = this.patient.getFullName();
            log(`Delete patient requested: ${this.patient.id}`, 'info');

            // Show confirmation dialog
            const confirmed = await this.showDeleteConfirmationDialog(patientName);
            if (!confirmed) {
                return;
            }

            if (!this.patientManager) {
                throw new Error('Patient manager not available');
            }

            // Show loading state
            this.showDeletionLoadingState();

            // Delete the patient
            const result = await this.patientManager.deletePatient(this.patient.id);

            if (result.success) {
                // Hide loading state
                this.hideDeletionLoadingState();

                // Show success confirmation
                this.showDeletionSuccessDialog(patientName);

                // Navigate back to search after user acknowledges
                setTimeout(() => {
                    this.handleBack();
                }, 2000);
            } else {
                throw new Error(result.message || 'Failed to delete patient');
            }

        } catch (error) {
            log(`Failed to delete patient: ${error.message}`, 'error');
            this.hideDeletionLoadingState();
            this.showToast('Failed to delete patient. Please try again.', 'error');
        }
    }

    /**
     * Handle back button click
     */
    handleBack() {
        try {
            log('Back to search requested', 'info');

            // Check for unsaved changes if in edit mode
            if (this.isEditMode && this.hasUnsavedChanges()) {
                const confirmed = confirm(
                    'You have unsaved changes. Are you sure you want to leave without saving?\n\n' +
                    'Your changes will be lost.'
                );
                if (!confirmed) {
                    return;
                }
            }

            if (window.app) {
                window.app.navigateToRoute('search-patients');
            } else if (this.uiRouter) {
                this.uiRouter.navigateTo('search-patients');
            } else {
                // Fallback - close modal if in modal
                const modalContainer = document.getElementById('modal-container');
                if (modalContainer) {
                    modalContainer.classList.add('hidden');
                }
            }

        } catch (error) {
            log(`Failed to navigate back: ${error.message}`, 'error');
        }
    }

    /**
     * Toggle edit mode on/off
     * @param {boolean} editMode - Whether to enable edit mode
     */
    toggleEditMode(editMode) {
        try {
            this.isEditMode = editMode;

            if (editMode) {
                // Store original data for change tracking
                this.originalPatientData = deepClone(this.patient.toJSON());
                log('Entering edit mode', 'info');
            } else {
                // Clear original data
                this.originalPatientData = null;
                log('Exiting edit mode', 'info');
            }

            // Re-render the view
            this.rerender();

            // Initialize form if entering edit mode
            if (editMode && this.formManager) {
                const formId = `edit-patient-${this.patient.id}`;
                setTimeout(() => {
                    this.formManager.initializeForm(formId);
                    this.setupChangeTracking(formId);
                }, 100);
            }

        } catch (error) {
            log(`Failed to toggle edit mode: ${error.message}`, 'error');
            this.showToast('Failed to toggle edit mode', 'error');
        }
    }

    /**
     * Handle save button click
     */
    async handleSave() {
        try {
            log('Save patient changes requested', 'info');

            if (!this.formManager) {
                throw new Error('Form manager not available');
            }

            const formId = `edit-patient-${this.patient.id}`;

            // Validate form
            const validation = this.formManager.validateForm(formId);
            if (!validation.isValid) {
                this.showToast('Please fix the validation errors before saving', 'error');
                return;
            }

            // Get form data
            const formData = this.formManager.getFormData(formId);

            // Show loading state
            this.showLoadingState('Saving changes...');

            // Update patient via patient manager
            const result = await this.patientManager.updatePatient(this.patient.id, formData);

            if (result.success) {
                // Update local patient data
                this.patient = new Patient(result.patient);

                // Mark form as saved
                this.formManager.markFormAsSaved(formId);

                // Exit edit mode
                this.toggleEditMode(false);

                // Show success message
                this.showToast('Patient record updated successfully', 'success');

                log(`Patient ${this.patient.getFullName()} updated successfully`, 'info');
            } else {
                throw new Error(result.message || 'Failed to update patient');
            }

        } catch (error) {
            log(`Failed to save patient changes: ${error.message}`, 'error');
            this.showToast('Failed to save changes. Please try again.', 'error');
        } finally {
            this.hideLoadingState();
        }
    }

    /**
     * Handle cancel edit button click
     */
    handleCancelEdit() {
        try {
            log('Cancel edit requested', 'info');

            // Check for unsaved changes
            if (this.hasUnsavedChanges()) {
                const confirmed = confirm(
                    'You have unsaved changes. Are you sure you want to cancel?\n\n' +
                    'Your changes will be lost.'
                );
                if (!confirmed) {
                    return;
                }
            }

            // Exit edit mode
            this.toggleEditMode(false);

        } catch (error) {
            log(`Failed to cancel edit: ${error.message}`, 'error');
            this.showToast('Failed to cancel edit', 'error');
        }
    }

    /**
     * Check if there are unsaved changes
     * @returns {boolean} True if there are unsaved changes
     */
    hasUnsavedChanges() {
        if (!this.isEditMode || !this.formManager || !this.originalPatientData) {
            return false;
        }

        const formId = `edit-patient-${this.patient.id}`;
        return this.formManager.hasUnsavedChanges(formId);
    }

    /**
     * Set up change tracking for the form
     * @param {string} formId - Form identifier
     */
    setupChangeTracking(formId) {
        if (!this.formManager) return;

        // Set up change tracking
        const form = document.getElementById(formId);
        if (!form) return;

        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                this.updateUnsavedChangesIndicator();
            });
            input.addEventListener('change', () => {
                this.updateUnsavedChangesIndicator();
            });
        });
    }

    /**
     * Update the unsaved changes indicator
     */
    updateUnsavedChangesIndicator() {
        const indicator = document.getElementById('unsaved-changes-indicator');
        if (!indicator) return;

        if (this.hasUnsavedChanges()) {
            indicator.style.display = 'flex';
        } else {
            indicator.style.display = 'none';
        }
    }

    /**
     * Re-render the current view
     */
    rerender() {
        const container = document.querySelector('.patient-detail-container');
        if (container && container.parentElement) {
            container.parentElement.innerHTML = this.render();
        }
    }

    /**
     * Show loading state
     * @param {string} message - Loading message
     */
    showLoadingState(message = 'Loading...') {
        const saveButton = document.querySelector('.save-button');
        if (saveButton) {
            saveButton.disabled = true;
            saveButton.innerHTML = `
                <span class="loading-spinner-small"></span>
                ${message}
            `;
        }
    }

    /**
     * Hide loading state
     */
    hideLoadingState() {
        const saveButton = document.querySelector('.save-button');
        if (saveButton) {
            saveButton.disabled = false;
            saveButton.innerHTML = 'Save Changes';
        }
    }

    /**
     * Format date for display
     * @param {string|Date} date - Date to format
     * @returns {string} Formatted date string
     */
    formatDate(date) {
        if (!date) return '';

        try {
            const dateObj = new Date(date);
            return dateObj.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (error) {
            return date.toString();
        }
    }

    /**
     * Format date and time for display
     * @param {string|Date|number} dateTime - DateTime to format
     * @returns {string} Formatted datetime string
     */
    formatDateTime(dateTime) {
        if (!dateTime) return 'Not available';

        try {
            const dateObj = new Date(dateTime);
            return dateObj.toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return dateTime.toString();
        }
    }

    /**
     * Get relative date (e.g., "2 days ago")
     * @param {string|Date} date - Date to format
     * @returns {string} Relative date string
     */
    getRelativeDate(date) {
        if (!date) return '';

        try {
            const dateObj = new Date(date);
            const now = new Date();
            const diffTime = now - dateObj;
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 0) {
                return 'Today';
            } else if (diffDays === 1) {
                return 'Yesterday';
            } else if (diffDays < 7) {
                return `${diffDays} days ago`;
            } else if (diffDays < 30) {
                const weeks = Math.floor(diffDays / 7);
                return `${weeks} week${weeks !== 1 ? 's' : ''} ago`;
            } else if (diffDays < 365) {
                const months = Math.floor(diffDays / 30);
                return `${months} month${months !== 1 ? 's' : ''} ago`;
            } else {
                const years = Math.floor(diffDays / 365);
                return `${years} year${years !== 1 ? 's' : ''} ago`;
            }
        } catch (error) {
            return '';
        }
    }

    /**
     * Format gender for display
     * @param {string} gender - Gender value
     * @returns {string} Formatted gender string
     */
    formatGender(gender) {
        if (!gender) return 'Not specified';

        const genderMap = {
            'male': 'Male',
            'female': 'Female',
            'other': 'Other',
            'm': 'Male',
            'f': 'Female'
        };

        return genderMap[gender.toLowerCase()] || gender;
    }

    /**
     * Format text content (preserve line breaks)
     * @param {string} text - Text to format
     * @returns {string} Formatted text
     */
    formatText(text) {
        if (!text) return '';

        return text
            .replace(/\n/g, '<br>')
            .replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;');
    }

    /**
     * Show delete confirmation dialog
     * @param {string} patientName - Name of patient to delete
     * @returns {Promise<boolean>} True if confirmed
     */
    async showDeleteConfirmationDialog(patientName) {
        return new Promise((resolve) => {
            const modalContainer = document.getElementById('modal-container');
            if (!modalContainer) {
                // Fallback to basic confirm
                resolve(confirm(
                    `Are you sure you want to delete the patient record for ${patientName}?\n\n` +
                    'This action cannot be undone and will permanently remove all patient data including visit history.'
                ));
                return;
            }

            modalContainer.innerHTML = `
                <div class="modal">
                    <div class="modal-header">
                        <h3 class="modal-title">⚠️ Confirm Patient Deletion</h3>
                    </div>
                    <div class="modal-body">
                        <p><strong>Are you sure you want to delete the patient record for:</strong></p>
                        <p class="patient-name-highlight">${patientName}</p>
                        <div class="warning-message">
                            <div class="warning-icon">⚠️</div>
                            <div class="warning-text">
                                <p><strong>This action cannot be undone!</strong></p>
                                <p>This will permanently remove:</p>
                                <ul>
                                    <li>All patient information</li>
                                    <li>Complete visit history</li>
                                    <li>All medications and observations</li>
                                    <li>Any additional comments</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary cancel-delete-btn">
                            Cancel
                        </button>
                        <button class="btn btn-danger confirm-delete-btn">
                            Delete Patient
                        </button>
                    </div>
                </div>
            `;

            modalContainer.classList.remove('hidden');

            // Handle button clicks
            const cancelBtn = modalContainer.querySelector('.cancel-delete-btn');
            const confirmBtn = modalContainer.querySelector('.confirm-delete-btn');

            const cleanup = () => {
                modalContainer.classList.add('hidden');
                modalContainer.innerHTML = '';
            };

            cancelBtn.addEventListener('click', () => {
                cleanup();
                resolve(false);
            });

            confirmBtn.addEventListener('click', () => {
                cleanup();
                resolve(true);
            });

            // Handle escape key
            const handleEscape = (event) => {
                if (event.key === 'Escape') {
                    document.removeEventListener('keydown', handleEscape);
                    cleanup();
                    resolve(false);
                }
            };
            document.addEventListener('keydown', handleEscape);
        });
    }

    /**
     * Show deletion success dialog
     * @param {string} patientName - Name of deleted patient
     */
    showDeletionSuccessDialog(patientName) {
        const modalContainer = document.getElementById('modal-container');
        if (!modalContainer) {
            this.showToast(`Patient ${patientName} has been deleted successfully`, 'success');
            return;
        }

        modalContainer.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h3 class="modal-title">✅ Patient Deleted Successfully</h3>
                </div>
                <div class="modal-body">
                    <div class="success-message">
                        <div class="success-icon">✅</div>
                        <div class="success-text">
                            <p><strong>Patient record has been successfully deleted:</strong></p>
                            <p class="patient-name-highlight">${patientName}</p>
                            <p>All associated data has been permanently removed from the system.</p>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary ok-btn">
                        OK
                    </button>
                </div>
            </div>
        `;

        modalContainer.classList.remove('hidden');

        // Handle OK button click
        const okBtn = modalContainer.querySelector('.ok-btn');
        const cleanup = () => {
            modalContainer.classList.add('hidden');
            modalContainer.innerHTML = '';
        };

        okBtn.addEventListener('click', cleanup);

        // Auto-close after 3 seconds
        setTimeout(cleanup, 3000);
    }

    /**
     * Show deletion loading state
     */
    showDeletionLoadingState() {
        const deleteButton = document.querySelector('.delete-button');
        if (deleteButton) {
            deleteButton.disabled = true;
            deleteButton.innerHTML = `
                <span class="loading-spinner-small"></span>
                Deleting...
            `;
        }
    }

    /**
     * Hide deletion loading state
     */
    hideDeletionLoadingState() {
        const deleteButton = document.querySelector('.delete-button');
        if (deleteButton) {
            deleteButton.disabled = false;
            deleteButton.innerHTML = 'Delete Patient';
        }
    }

    /**
     * Show toast notification
     * @param {string} message - Message to show
     * @param {string} type - Toast type
     */
    showToast(message, type = 'info') {
        if (window.app && window.app.showToast) {
            window.app.showToast(message, type);
        } else {
            // Fallback to alert
            alert(message);
        }
    }

    /**
     * Destroy the detail view and clean up
     */
    destroy() {
        log('PatientDetailView destroyed', 'info');

        // Clean up keyboard shortcuts
        if (this.keydownHandler) {
            document.removeEventListener('keydown', this.keydownHandler);
            this.keydownHandler = null;
        }

        // Clean up form manager
        if (this.formManager) {
            const formId = `edit-patient-${this.patient.id}`;
            this.formManager.destroyForm(formId);
            this.formManager = null;
        }

        // Clear references
        this.originalPatientData = null;
        this.isEditMode = false;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PatientDetailView;
}