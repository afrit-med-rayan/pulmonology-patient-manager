/**
 * Patient Data Model
 * Represents a patient record with validation and utility methods
 */

class Patient {
    constructor(data = {}) {
        // Initialize with default values from schema
        this.id = data.id || generateId();
        this.firstName = data.firstName || '';
        this.lastName = data.lastName || '';
        this.dateOfBirth = data.dateOfBirth || null;
        this.age = data.age || this.calculateAge();
        this.placeOfResidence = data.placeOfResidence || '';
        this.gender = data.gender || '';
        this.visits = data.visits || [];
        this.createdAt = data.createdAt || getCurrentTimestamp();
        this.updatedAt = data.updatedAt || getCurrentTimestamp();
    }

    /**
     * Calculate age from date of birth
     * @returns {number} Age in years
     */
    calculateAge() {
        if (!this.dateOfBirth) return 0;
        return calculateAge(this.dateOfBirth);
    }

    /**
     * Update the age based on current date of birth
     */
    updateAge() {
        this.age = this.calculateAge();
    }

    /**
     * Add a new visit to the patient record
     * @param {Object} visitData - Visit data
     * @returns {Object} The added visit with generated ID
     */
    addVisit(visitData) {
        const visit = {
            id: generateId(),
            visitDate: visitData.visitDate || new Date().toISOString().split('T')[0],
            medications: visitData.medications || '',
            observations: visitData.observations || '',
            additionalComments: visitData.additionalComments || '',
            createdAt: getCurrentTimestamp()
        };

        this.visits.push(visit);
        this.updatedAt = getCurrentTimestamp();
        return visit;
    }

    /**
     * Update an existing visit
     * @param {string} visitId - ID of the visit to update
     * @param {Object} visitData - Updated visit data
     * @returns {boolean} True if visit was found and updated
     */
    updateVisit(visitId, visitData) {
        const visitIndex = this.visits.findIndex(visit => visit.id === visitId);
        if (visitIndex === -1) return false;

        this.visits[visitIndex] = {
            ...this.visits[visitIndex],
            ...visitData,
            id: visitId // Ensure ID doesn't change
        };
        this.updatedAt = getCurrentTimestamp();
        return true;
    }

    /**
     * Remove a visit from the patient record
     * @param {string} visitId - ID of the visit to remove
     * @returns {boolean} True if visit was found and removed
     */
    removeVisit(visitId) {
        const initialLength = this.visits.length;
        this.visits = this.visits.filter(visit => visit.id !== visitId);

        if (this.visits.length < initialLength) {
            this.updatedAt = getCurrentTimestamp();
            return true;
        }
        return false;
    }

    /**
     * Get the most recent visit
     * @returns {Object|null} Most recent visit or null if no visits
     */
    getLatestVisit() {
        if (this.visits.length === 0) return null;

        return this.visits.reduce((latest, current) => {
            const latestDate = new Date(latest.visitDate);
            const currentDate = new Date(current.visitDate);
            return currentDate > latestDate ? current : latest;
        });
    }

    /**
     * Get visits sorted by date (newest first)
     * @returns {Array} Sorted visits array
     */
    getVisitsSortedByDate() {
        return [...this.visits].sort((a, b) => new Date(b.visitDate) - new Date(a.visitDate));
    }

    /**
     * Validate the patient record
     * @returns {Object} Validation result with isValid boolean and errors array
     */
    validate() {
        const errors = [];
        const rules = VALIDATION_RULES.patient;

        // Validate first name
        if (!this.firstName || this.firstName.trim() === '') {
            errors.push({
                field: 'firstName',
                message: ERROR_MESSAGES.validation.required
            });
        } else {
            if (this.firstName.length < rules.firstName.minLength) {
                errors.push({
                    field: 'firstName',
                    message: ERROR_MESSAGES.validation.minLength.replace('{min}', rules.firstName.minLength)
                });
            }
            if (this.firstName.length > rules.firstName.maxLength) {
                errors.push({
                    field: 'firstName',
                    message: ERROR_MESSAGES.validation.maxLength.replace('{max}', rules.firstName.maxLength)
                });
            }
            if (!rules.firstName.pattern.test(this.firstName)) {
                errors.push({
                    field: 'firstName',
                    message: 'First name can only contain letters, spaces, hyphens, and apostrophes'
                });
            }
        }

        // Validate last name
        if (!this.lastName || this.lastName.trim() === '') {
            errors.push({
                field: 'lastName',
                message: ERROR_MESSAGES.validation.required
            });
        } else {
            if (this.lastName.length < rules.lastName.minLength) {
                errors.push({
                    field: 'lastName',
                    message: ERROR_MESSAGES.validation.minLength.replace('{min}', rules.lastName.minLength)
                });
            }
            if (this.lastName.length > rules.lastName.maxLength) {
                errors.push({
                    field: 'lastName',
                    message: ERROR_MESSAGES.validation.maxLength.replace('{max}', rules.lastName.maxLength)
                });
            }
            if (!rules.lastName.pattern.test(this.lastName)) {
                errors.push({
                    field: 'lastName',
                    message: 'Last name can only contain letters, spaces, hyphens, and apostrophes'
                });
            }
        }

        // Validate date of birth
        if (!this.dateOfBirth) {
            errors.push({
                field: 'dateOfBirth',
                message: ERROR_MESSAGES.validation.required
            });
        } else {
            const birthDate = new Date(this.dateOfBirth);
            const today = new Date();

            if (isNaN(birthDate.getTime())) {
                errors.push({
                    field: 'dateOfBirth',
                    message: ERROR_MESSAGES.validation.date
                });
            } else if (birthDate > today) {
                errors.push({
                    field: 'dateOfBirth',
                    message: ERROR_MESSAGES.validation.future
                });
            }
        }

        // Validate place of residence
        if (!this.placeOfResidence || this.placeOfResidence.trim() === '') {
            errors.push({
                field: 'placeOfResidence',
                message: ERROR_MESSAGES.validation.required
            });
        } else {
            if (this.placeOfResidence.length < rules.placeOfResidence.minLength) {
                errors.push({
                    field: 'placeOfResidence',
                    message: ERROR_MESSAGES.validation.minLength.replace('{min}', rules.placeOfResidence.minLength)
                });
            }
            if (this.placeOfResidence.length > rules.placeOfResidence.maxLength) {
                errors.push({
                    field: 'placeOfResidence',
                    message: ERROR_MESSAGES.validation.maxLength.replace('{max}', rules.placeOfResidence.maxLength)
                });
            }
        }

        // Validate gender
        if (!this.gender || this.gender.trim() === '') {
            errors.push({
                field: 'gender',
                message: ERROR_MESSAGES.validation.required
            });
        } else if (!rules.gender.options.includes(this.gender.toLowerCase())) {
            errors.push({
                field: 'gender',
                message: 'Gender must be one of: ' + rules.gender.options.join(', ')
            });
        }

        // Validate visits
        this.visits.forEach((visit, index) => {
            const visitErrors = this.validateVisit(visit);
            visitErrors.forEach(error => {
                errors.push({
                    field: `visits[${index}].${error.field}`,
                    message: error.message
                });
            });
        });

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * Validate a single visit
     * @param {Object} visit - Visit data to validate
     * @returns {Array} Array of validation errors
     */
    validateVisit(visit) {
        const errors = [];

        // Validate visit date
        if (!visit.visitDate) {
            errors.push({
                field: 'visitDate',
                message: ERROR_MESSAGES.validation.required
            });
        } else {
            const visitDate = new Date(visit.visitDate);
            const today = new Date();

            if (isNaN(visitDate.getTime())) {
                errors.push({
                    field: 'visitDate',
                    message: ERROR_MESSAGES.validation.date
                });
            } else if (visitDate > today) {
                errors.push({
                    field: 'visitDate',
                    message: ERROR_MESSAGES.validation.future
                });
            }
        }

        // Optional fields validation (if provided, they should meet certain criteria)
        if (visit.medications && visit.medications.length > 1000) {
            errors.push({
                field: 'medications',
                message: 'Medications field must be no more than 1000 characters'
            });
        }

        if (visit.observations && visit.observations.length > 2000) {
            errors.push({
                field: 'observations',
                message: 'Observations field must be no more than 2000 characters'
            });
        }

        if (visit.additionalComments && visit.additionalComments.length > 1000) {
            errors.push({
                field: 'additionalComments',
                message: 'Additional comments field must be no more than 1000 characters'
            });
        }

        return errors;
    }

    /**
     * Sanitize patient data to prevent XSS attacks
     */
    sanitize() {
        this.firstName = sanitizeHtml(this.firstName).trim();
        this.lastName = sanitizeHtml(this.lastName).trim();
        this.placeOfResidence = sanitizeHtml(this.placeOfResidence).trim();
        this.gender = sanitizeHtml(this.gender).trim().toLowerCase();

        // Sanitize visits
        this.visits.forEach(visit => {
            visit.medications = sanitizeHtml(visit.medications);
            visit.observations = sanitizeHtml(visit.observations);
            visit.additionalComments = sanitizeHtml(visit.additionalComments);
        });

        this.updatedAt = getCurrentTimestamp();
    }

    /**
     * Get full name of the patient
     * @returns {string} Full name
     */
    getFullName() {
        return `${this.firstName} ${this.lastName}`.trim();
    }

    /**
     * Get formatted display name for lists
     * @returns {string} Display name with age
     */
    getDisplayName() {
        return `${this.getFullName()} (${this.age} years old)`;
    }

    /**
     * Check if patient matches search term
     * @param {string} searchTerm - Term to search for
     * @returns {boolean} True if patient matches search term
     */
    matchesSearch(searchTerm) {
        if (!searchTerm) return true;

        const term = searchTerm.toLowerCase();
        return (
            containsSearchTerm(this.firstName, term) ||
            containsSearchTerm(this.lastName, term) ||
            containsSearchTerm(this.getFullName(), term) ||
            containsSearchTerm(this.placeOfResidence, term)
        );
    }

    /**
     * Update the updatedAt timestamp
     */
    touch() {
        this.updatedAt = getCurrentTimestamp();
    }

    /**
     * Convert patient to JSON format
     * @returns {Object} JSON representation of patient
     */
    toJSON() {
        return {
            id: this.id,
            firstName: this.firstName,
            lastName: this.lastName,
            dateOfBirth: this.dateOfBirth,
            age: this.age,
            placeOfResidence: this.placeOfResidence,
            gender: this.gender,
            visits: this.visits,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }

    /**
     * Create a Patient instance from JSON data
     * @param {Object} json - JSON data
     * @returns {Patient} Patient instance
     */
    static fromJSON(json) {
        const patient = new Patient(json);
        patient.updateAge(); // Ensure age is current
        return patient;
    }

    /**
     * Create a new empty patient with default values
     * @returns {Patient} New patient instance
     */
    static createNew() {
        return new Patient();
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Patient;
}