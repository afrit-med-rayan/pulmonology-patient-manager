/**
 * Form Validation Utilities
 * Comprehensive validation functions for patient management forms
 */

/**
 * Validate patient form data
 * @param {Object} formData - Form data to validate
 * @returns {Object} Validation result with isValid boolean and errors object
 */
function validatePatientForm(formData) {
    const errors = {};
    let isValid = true;

    // Validate first name
    const firstNameResult = validateFirstName(formData.firstName);
    if (!firstNameResult.isValid) {
        errors.firstName = firstNameResult.errors;
        isValid = false;
    }

    // Validate last name
    const lastNameResult = validateLastName(formData.lastName);
    if (!lastNameResult.isValid) {
        errors.lastName = lastNameResult.errors;
        isValid = false;
    }

    // Validate date of birth (optional)
    if (formData.dateOfBirth) {
        const dobResult = validateDateOfBirth(formData.dateOfBirth);
        if (!dobResult.isValid) {
            errors.dateOfBirth = dobResult.errors;
            isValid = false;
        }
    }

    // Validate place of residence (optional)
    if (formData.placeOfResidence) {
        const residenceResult = validatePlaceOfResidence(formData.placeOfResidence);
        if (!residenceResult.isValid) {
            errors.placeOfResidence = residenceResult.errors;
            isValid = false;
        }
    }

    // Validate age (optional)
    if (formData.age) {
        const ageResult = validateAge(formData.age);
        if (!ageResult.isValid) {
            errors.age = ageResult.errors;
            isValid = false;
        }
    }

    // Validate medical history fields (optional)
    if (formData.atcdsMedicaux) {
        const atcdsMedicauxResult = validateTextArea(formData.atcdsMedicaux, 'ATCDS MEDICAUX');
        if (!atcdsMedicauxResult.isValid) {
            errors.atcdsMedicaux = atcdsMedicauxResult.errors;
            isValid = false;
        }
    }

    if (formData.atcdsChirurgicaux) {
        const atcdsChirurgicauxResult = validateTextArea(formData.atcdsChirurgicaux, 'ATCDS CHIRURGICAUX');
        if (!atcdsChirurgicauxResult.isValid) {
            errors.atcdsChirurgicaux = atcdsChirurgicauxResult.errors;
            isValid = false;
        }
    }

    // Validate visits if provided
    if (formData.visits && Array.isArray(formData.visits)) {
        const visitsResult = validateVisits(formData.visits);
        if (!visitsResult.isValid) {
            errors.visits = visitsResult.errors;
            isValid = false;
        }
    }

    return { isValid, errors };
}

/**
 * Validate first name field
 * @param {string} firstName - First name to validate
 * @returns {Object} Validation result
 */
function validateFirstName(firstName) {
    const errors = [];
    const rules = VALIDATION_RULES.patient.firstName;

    if (!firstName || firstName.trim() === '') {
        errors.push(ERROR_MESSAGES.validation.required);
    } else {
        const trimmed = firstName.trim();

        if (trimmed.length < rules.minLength) {
            errors.push(ERROR_MESSAGES.validation.minLength.replace('{min}', rules.minLength));
        }

        if (trimmed.length > rules.maxLength) {
            errors.push(ERROR_MESSAGES.validation.maxLength.replace('{max}', rules.maxLength));
        }

        if (!rules.pattern.test(trimmed)) {
            errors.push('First name can only contain letters, spaces, hyphens, and apostrophes');
        }
    }

    return { isValid: errors.length === 0, errors };
}

/**
 * Validate last name field
 * @param {string} lastName - Last name to validate
 * @returns {Object} Validation result
 */
function validateLastName(lastName) {
    const errors = [];
    const rules = VALIDATION_RULES.patient.lastName;

    if (!lastName || lastName.trim() === '') {
        errors.push(ERROR_MESSAGES.validation.required);
    } else {
        const trimmed = lastName.trim();

        if (trimmed.length < rules.minLength) {
            errors.push(ERROR_MESSAGES.validation.minLength.replace('{min}', rules.minLength));
        }

        if (trimmed.length > rules.maxLength) {
            errors.push(ERROR_MESSAGES.validation.maxLength.replace('{max}', rules.maxLength));
        }

        if (!rules.pattern.test(trimmed)) {
            errors.push('Last name can only contain letters, spaces, hyphens, and apostrophes');
        }
    }

    return { isValid: errors.length === 0, errors };
}

/**
 * Validate date of birth field
 * @param {string|Date} dateOfBirth - Date of birth to validate
 * @returns {Object} Validation result
 */
function validateDateOfBirth(dateOfBirth) {
    const errors = [];

    // Date of birth is now optional
    if (dateOfBirth) {
        const date = typeof dateOfBirth === 'string' ? new Date(dateOfBirth) : dateOfBirth;
        const today = new Date();
        const minDate = new Date(today.getFullYear() - 150, today.getMonth(), today.getDate()); // 150 years ago

        if (isNaN(date.getTime())) {
            errors.push(ERROR_MESSAGES.validation.date);
        } else {
            if (date > today) {
                errors.push(ERROR_MESSAGES.validation.future);
            }

            if (date < minDate) {
                errors.push('Date of birth cannot be more than 150 years ago');
            }
        }
    }

    return { isValid: errors.length === 0, errors };
}

/**
 * Validate place of residence field
 * @param {string} placeOfResidence - Place of residence to validate
 * @returns {Object} Validation result
 */
function validatePlaceOfResidence(placeOfResidence) {
    const errors = [];
    const rules = VALIDATION_RULES.patient.placeOfResidence;

    // Place of residence is now optional
    if (placeOfResidence && placeOfResidence.trim() !== '') {
        const trimmed = placeOfResidence.trim();

        if (trimmed.length < rules.minLength) {
            errors.push(ERROR_MESSAGES.validation.minLength.replace('{min}', rules.minLength));
        }

        if (trimmed.length > rules.maxLength) {
            errors.push(ERROR_MESSAGES.validation.maxLength.replace('{max}', rules.maxLength));
        }
    }

    return { isValid: errors.length === 0, errors };
}

/**
 * Validate age field
 * @param {number|string} age - Age to validate
 * @returns {Object} Validation result
 */
function validateAge(age) {
    const errors = [];
    const rules = VALIDATION_RULES.patient.age;

    // Age is now optional
    if (age || age === 0) {
        const ageNum = parseInt(age);

        if (isNaN(ageNum)) {
            errors.push('Age must be a valid number');
        } else if (ageNum < rules.min) {
            errors.push(`Age must be at least ${rules.min}`);
        } else if (ageNum > rules.max) {
            errors.push(`Age must be no more than ${rules.max}`);
        }
    }

    return { isValid: errors.length === 0, errors };
}

/**
 * Validate textarea field (for medical history fields)
 * @param {string} text - Text to validate
 * @param {string} fieldName - Name of the field for error messages
 * @returns {Object} Validation result
 */
function validateTextArea(text, fieldName) {
    const errors = [];
    const maxLength = 2000;

    if (text && text.length > maxLength) {
        errors.push(`${fieldName} must be less than ${maxLength} characters`);
    }

    return { isValid: errors.length === 0, errors };
}

/**
 * Validate visits array
 * @param {Array} visits - Visits array to validate
 * @returns {Object} Validation result
 */
function validateVisits(visits) {
    const errors = [];
    let isValid = true;

    if (!Array.isArray(visits)) {
        errors.push('Visits must be an array');
        return { isValid: false, errors };
    }

    visits.forEach((visit, index) => {
        const visitResult = validateVisit(visit);
        if (!visitResult.isValid) {
            errors[index] = visitResult.errors;
            isValid = false;
        }
    });

    return { isValid, errors };
}

/**
 * Validate a single visit
 * @param {Object} visit - Visit data to validate
 * @returns {Object} Validation result
 */
function validateVisit(visit) {
    const errors = {};
    let isValid = true;

    // Validate visit date
    const visitDateResult = validateVisitDate(visit.visitDate);
    if (!visitDateResult.isValid) {
        errors.visitDate = visitDateResult.errors;
        isValid = false;
    }

    // Validate medications (optional but with length limit)
    if (visit.medications) {
        const medicationsResult = validateMedications(visit.medications);
        if (!medicationsResult.isValid) {
            errors.medications = medicationsResult.errors;
            isValid = false;
        }
    }

    // Validate observations (optional but with length limit)
    if (visit.observations) {
        const observationsResult = validateObservations(visit.observations);
        if (!observationsResult.isValid) {
            errors.observations = observationsResult.errors;
            isValid = false;
        }
    }

    // Validate additional comments (optional but with length limit)
    if (visit.additionalComments) {
        const commentsResult = validateAdditionalComments(visit.additionalComments);
        if (!commentsResult.isValid) {
            errors.additionalComments = commentsResult.errors;
            isValid = false;
        }
    }

    return { isValid, errors };
}

/**
 * Validate visit date
 * @param {string|Date} visitDate - Visit date to validate
 * @returns {Object} Validation result
 */
function validateVisitDate(visitDate) {
    const errors = [];

    if (!visitDate) {
        errors.push(ERROR_MESSAGES.validation.required);
    } else {
        const date = typeof visitDate === 'string' ? new Date(visitDate) : visitDate;
        const today = new Date();
        const futureLimit = new Date(today.getTime() + (7 * 24 * 60 * 60 * 1000)); // 7 days in future

        if (isNaN(date.getTime())) {
            errors.push(ERROR_MESSAGES.validation.date);
        } else if (date > futureLimit) {
            errors.push('Visit date cannot be more than 7 days in the future');
        }
    }

    return { isValid: errors.length === 0, errors };
}

/**
 * Validate medications field
 * @param {string} medications - Medications to validate
 * @returns {Object} Validation result
 */
function validateMedications(medications) {
    const errors = [];
    const maxLength = 1000;

    if (medications && medications.length > maxLength) {
        errors.push(ERROR_MESSAGES.validation.maxLength.replace('{max}', maxLength));
    }

    return { isValid: errors.length === 0, errors };
}

/**
 * Validate observations field
 * @param {string} observations - Observations to validate
 * @returns {Object} Validation result
 */
function validateObservations(observations) {
    const errors = [];
    const maxLength = 2000;

    if (observations && observations.length > maxLength) {
        errors.push(ERROR_MESSAGES.validation.maxLength.replace('{max}', maxLength));
    }

    return { isValid: errors.length === 0, errors };
}

/**
 * Validate additional comments field
 * @param {string} additionalComments - Additional comments to validate
 * @returns {Object} Validation result
 */
function validateAdditionalComments(additionalComments) {
    const errors = [];
    const maxLength = 1000;

    if (additionalComments && additionalComments.length > maxLength) {
        errors.push(ERROR_MESSAGES.validation.maxLength.replace('{max}', maxLength));
    }

    return { isValid: errors.length === 0, errors };
}

/**
 * Validate form field in real-time
 * @param {string} fieldName - Name of the field
 * @param {*} value - Value to validate
 * @returns {Object} Validation result
 */
function validateField(fieldName, value) {
    switch (fieldName) {
        case 'firstName':
            return validateFirstName(value);
        case 'lastName':
            return validateLastName(value);
        case 'dateOfBirth':
            return validateDateOfBirth(value);
        case 'placeOfResidence':
            return validatePlaceOfResidence(value);
        case 'age':
            return validateAge(value);
        case 'atcdsMedicaux':
            return validateTextArea(value, 'ATCDS MEDICAUX');
        case 'atcdsChirurgicaux':
            return validateTextArea(value, 'ATCDS CHIRURGICAUX');
        case 'visitDate':
            return validateVisitDate(value);
        case 'medications':
            return validateMedications(value);
        case 'observations':
            return validateObservations(value);
        case 'additionalComments':
            return validateAdditionalComments(value);
        default:
            return { isValid: true, errors: [] };
    }
}

/**
 * Get validation rules for a specific field
 * @param {string} fieldName - Name of the field
 * @returns {Object} Validation rules for the field
 */
function getFieldValidationRules(fieldName) {
    const patientRules = VALIDATION_RULES.patient;

    switch (fieldName) {
        case 'firstName':
        case 'lastName':
        case 'placeOfResidence':
        case 'age':
        case 'atcdsMedicaux':
        case 'atcdsChirurgicaux':
        case 'dateOfBirth':
            return patientRules[fieldName] || {};
        default:
            return {};
    }
}

/**
 * Check if a field is required
 * @param {string} fieldName - Name of the field
 * @returns {boolean} True if field is required
 */
function isFieldRequired(fieldName) {
    const rules = getFieldValidationRules(fieldName);
    return rules.required === true;
}

/**
 * Format validation errors for display
 * @param {Object} errors - Errors object from validation
 * @returns {Array} Array of formatted error messages
 */
function formatValidationErrors(errors) {
    const messages = [];

    for (const field in errors) {
        if (Array.isArray(errors[field])) {
            errors[field].forEach(error => {
                messages.push(`${capitalizeWords(field.replace(/([A-Z])/g, ' $1'))}: ${error}`);
            });
        } else if (typeof errors[field] === 'object') {
            // Handle nested errors (like visits)
            for (const subField in errors[field]) {
                if (Array.isArray(errors[field][subField])) {
                    errors[field][subField].forEach(error => {
                        messages.push(`${capitalizeWords(field)} ${subField}: ${error}`);
                    });
                }
            }
        }
    }

    return messages;
}

/**
 * Create a validation summary
 * @param {Object} validationResult - Result from validation function
 * @returns {Object} Validation summary with counts and messages
 */
function createValidationSummary(validationResult) {
    const messages = formatValidationErrors(validationResult.errors);

    return {
        isValid: validationResult.isValid,
        errorCount: messages.length,
        messages: messages,
        hasErrors: messages.length > 0
    };
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        validatePatientForm,
        validateFirstName,
        validateLastName,
        validateDateOfBirth,
        validatePlaceOfResidence,
        validateAge,
        validateTextArea,
        validateVisits,
        validateVisit,
        validateVisitDate,
        validateMedications,
        validateObservations,
        validateAdditionalComments,
        validateField,
        getFieldValidationRules,
        isFieldRequired,
        formatValidationErrors,
        createValidationSummary
    };
}