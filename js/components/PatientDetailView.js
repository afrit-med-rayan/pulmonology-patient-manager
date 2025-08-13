/**
 * Patient Detail View Component
 * Displays comprehensive patient information
 */

class PatientDetailView {
    constructor(patient, patientManager = null, uiRouter = null) {
        this.patient = patient;
        this.patientManager = patientManager;
        this.uiRouter = uiRouter;

        // Bind methods
        this.handleEdit = this.handleEdit.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.handleBack = this.handleBack.bind(this);
    }

    /**
     * Render the patient detail view
     * @returns {string} HTML string for patient details
     */
    render() {
        if (!this.patient) {
            return this.renderNotFound();
        }

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
    }

    /**
     * Handle edit button click
     */
    handleEdit() {
        try {
            log(`Edit patient requested: ${this.patient.id}`, 'info');

            if (this.uiRouter) {
                this.uiRouter.navigateTo('edit-patient', { patientId: this.patient.id });
            } else if (window.app) {
                window.app.navigateToRoute('edit-patient', { patientId: this.patient.id });
            } else {
                this.showToast('Edit functionality will be implemented in a future task', 'info');
            }

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

            // Show confirmation dialog
            const confirmed = confirm(
                `Are you sure you want to delete the patient record for ${patientName}?\n\n` +
                'This action cannot be undone and will permanently remove all patient data including visit history.'
            );

            if (!confirmed) {
                return;
            }

            log(`Delete patient requested: ${this.patient.id}`, 'info');

            if (!this.patientManager) {
                throw new Error('Patient manager not available');
            }

            // Delete the patient
            const result = await this.patientManager.deletePatient(this.patient.id);

            if (result.success) {
                this.showToast(`Patient ${patientName} has been deleted successfully`, 'success');

                // Navigate back to search after a short delay
                setTimeout(() => {
                    this.handleBack();
                }, 1500);
            } else {
                throw new Error(result.message || 'Failed to delete patient');
            }

        } catch (error) {
            log(`Failed to delete patient: ${error.message}`, 'error');
            this.showToast('Failed to delete patient. Please try again.', 'error');
        }
    }

    /**
     * Handle back button click
     */
    handleBack() {
        try {
            log('Back to search requested', 'info');

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
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PatientDetailView;
}