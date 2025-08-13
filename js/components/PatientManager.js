/**
 * Patient Manager Component
 * Handles all patient-related operations and business logic
 */

class PatientManager {
    constructor(dataStorageManager = null) {
        this.dataStorage = dataStorageManager;
        this.isInitialized = false;
        this.errorHandler = null;
    }

    /**
     * Initialize the patient manager
     * @param {DataStorageManager} dataStorageManager - Data storage instance
     * @param {ErrorHandler} errorHandler - Error handler instance
     */
    async initialize(dataStorageManager, errorHandler = null) {
        try {
            this.dataStorage = dataStorageManager;
            this.errorHandler = errorHandler;

            // Ensure data storage is initialized
            if (!this.dataStorage.isInitialized) {
                await this.dataStorage.initializeStorage();
            }

            this.isInitialized = true;
            log('PatientManager initialized successfully', 'info');

            return {
                success: true,
                message: 'Patient manager initialized successfully'
            };

        } catch (error) {
            log(`Failed to initialize PatientManager: ${error.message}`, 'error');
            throw new Error(`Patient manager initialization failed: ${error.message}`);
        }
    }

    /**
     * Create a new patient record
     * @param {Object} patientData - Patient data to create
     * @returns {Promise<Object>} Creation result with patient ID and success status
     */
    async createPatient(patientData) {
        try {
            if (!this.isInitialized) {
                throw new Error('PatientManager not initialized');
            }

            log('Creating new patient record...', 'info');

            // Validate input data
            if (!patientData || typeof patientData !== 'object') {
                throw new Error('Invalid patient data provided');
            }

            // Create Patient instance with validation
            const patient = new Patient(patientData);

            // Validate the patient data
            const validation = patient.validate();
            if (!validation.isValid) {
                const errorMessages = validation.errors.map(error => error.message).join(', ');
                throw new Error(`Patient validation failed: ${errorMessages}`);
            }

            // Sanitize the data
            patient.sanitize();

            // Generate unique ID if not provided
            if (!patient.id) {
                patient.id = generateId();
            }

            // Set creation timestamp
            patient.createdAt = getCurrentTimestamp();
            patient.updatedAt = getCurrentTimestamp();

            // Save to storage
            const saveResult = await this.dataStorage.savePatient(patient.toJSON());

            if (!saveResult.success) {
                throw new Error(saveResult.message || 'Failed to save patient to storage');
            }

            log(`Patient ${patient.getFullName()} created successfully with ID: ${patient.id}`, 'info');

            return {
                success: true,
                patientId: patient.id,
                patient: patient.toJSON(),
                message: SUCCESS_MESSAGES.patient.created
            };

        } catch (error) {
            log(`Failed to create patient: ${error.message}`, 'error');

            if (this.errorHandler) {
                this.errorHandler.handleError(error, 'createPatient');
            }

            throw new Error(`Failed to create patient: ${error.message}`);
        }
    }

    /**
     * Get a patient by ID
     * @param {string} patientId - ID of patient to retrieve
     * @returns {Promise<Patient|null>} Patient instance or null if not found
     */
    async getPatient(patientId) {
        try {
            if (!this.isInitialized) {
                throw new Error('PatientManager not initialized');
            }

            if (!patientId) {
                throw new Error('Patient ID is required');
            }

            log(`Retrieving patient with ID: ${patientId}`, 'info');

            const patient = await this.dataStorage.loadPatient(patientId);

            if (!patient) {
                log(`Patient with ID ${patientId} not found`, 'info');
                return null;
            }

            log(`Patient ${patient.getFullName()} retrieved successfully`, 'info');
            return patient;

        } catch (error) {
            log(`Failed to get patient ${patientId}: ${error.message}`, 'error');

            if (this.errorHandler) {
                this.errorHandler.handleError(error, 'getPatient');
            }

            throw new Error(`Failed to get patient: ${error.message}`);
        }
    }

    /**
     * Update an existing patient record
     * @param {string} patientId - ID of patient to update
     * @param {Object} patientData - Updated patient data
     * @returns {Promise<Object>} Update result
     */
    async updatePatient(patientId, patientData) {
        try {
            if (!this.isInitialized) {
                throw new Error('PatientManager not initialized');
            }

            if (!patientId) {
                throw new Error('Patient ID is required');
            }

            if (!patientData || typeof patientData !== 'object') {
                throw new Error('Invalid patient data provided');
            }

            log(`Updating patient with ID: ${patientId}`, 'info');

            // Load existing patient
            const existingPatient = await this.dataStorage.loadPatient(patientId);
            if (!existingPatient) {
                throw new Error('Patient not found');
            }

            // Merge with existing data
            const updatedData = {
                ...existingPatient.toJSON(),
                ...patientData,
                id: patientId, // Ensure ID doesn't change
                createdAt: existingPatient.createdAt, // Preserve creation timestamp
                updatedAt: getCurrentTimestamp()
            };

            // Create updated Patient instance
            const updatedPatient = new Patient(updatedData);

            // Validate the updated data
            const validation = updatedPatient.validate();
            if (!validation.isValid) {
                const errorMessages = validation.errors.map(error => error.message).join(', ');
                throw new Error(`Patient validation failed: ${errorMessages}`);
            }

            // Sanitize the data
            updatedPatient.sanitize();

            // Save to storage
            const saveResult = await this.dataStorage.savePatient(updatedPatient.toJSON());

            if (!saveResult.success) {
                throw new Error(saveResult.message || 'Failed to save updated patient to storage');
            }

            log(`Patient ${updatedPatient.getFullName()} updated successfully`, 'info');

            return {
                success: true,
                patientId: updatedPatient.id,
                patient: updatedPatient.toJSON(),
                message: SUCCESS_MESSAGES.patient.updated
            };

        } catch (error) {
            log(`Failed to update patient ${patientId}: ${error.message}`, 'error');

            if (this.errorHandler) {
                this.errorHandler.handleError(error, 'updatePatient');
            }

            throw new Error(`Failed to update patient: ${error.message}`);
        }
    }

    /**
     * Delete a patient record
     * @param {string} patientId - ID of patient to delete
     * @returns {Promise<Object>} Deletion result
     */
    async deletePatient(patientId) {
        try {
            if (!this.isInitialized) {
                throw new Error('PatientManager not initialized');
            }

            if (!patientId) {
                throw new Error('Patient ID is required');
            }

            log(`Deleting patient with ID: ${patientId}`, 'info');

            // Check if patient exists
            const existingPatient = await this.dataStorage.loadPatient(patientId);
            if (!existingPatient) {
                throw new Error('Patient not found');
            }

            const patientName = existingPatient.getFullName();

            // Delete from storage
            const deleteResult = await this.dataStorage.deletePatient(patientId);

            if (!deleteResult.success) {
                throw new Error(deleteResult.message || 'Failed to delete patient from storage');
            }

            log(`Patient ${patientName} deleted successfully`, 'info');

            return {
                success: true,
                patientId: patientId,
                message: SUCCESS_MESSAGES.patient.deleted
            };

        } catch (error) {
            log(`Failed to delete patient ${patientId}: ${error.message}`, 'error');

            if (this.errorHandler) {
                this.errorHandler.handleError(error, 'deletePatient');
            }

            throw new Error(`Failed to delete patient: ${error.message}`);
        }
    }

    /**
     * Search for patients based on criteria
     * @param {string|Object} searchCriteria - Search term or criteria object
     * @returns {Promise<Array>} Array of matching patients
     */
    async searchPatients(searchCriteria) {
        try {
            if (!this.isInitialized) {
                throw new Error('PatientManager not initialized');
            }

            log('Searching for patients...', 'info');

            let criteria = {};

            // Handle string search term
            if (typeof searchCriteria === 'string') {
                criteria.searchTerm = searchCriteria.trim();
            } else if (typeof searchCriteria === 'object' && searchCriteria !== null) {
                criteria = { ...searchCriteria };
            }

            // Search using data storage
            const results = await this.dataStorage.searchPatients(criteria);

            log(`Found ${results.length} patients matching search criteria`, 'info');

            return results;

        } catch (error) {
            log(`Failed to search patients: ${error.message}`, 'error');

            if (this.errorHandler) {
                this.errorHandler.handleError(error, 'searchPatients');
            }

            throw new Error(`Failed to search patients: ${error.message}`);
        }
    }

    /**
     * Get all patients with optional pagination
     * @param {Object} options - Options for retrieval (limit, offset)
     * @returns {Promise<Array>} Array of all patients
     */
    async getAllPatients(options = {}) {
        try {
            if (!this.isInitialized) {
                throw new Error('PatientManager not initialized');
            }

            log('Retrieving all patients...', 'info');

            const patients = await this.dataStorage.getAllPatients(options);

            log(`Retrieved ${patients.length} patients`, 'info');

            return patients;

        } catch (error) {
            log(`Failed to get all patients: ${error.message}`, 'error');

            if (this.errorHandler) {
                this.errorHandler.handleError(error, 'getAllPatients');
            }

            throw new Error(`Failed to get all patients: ${error.message}`);
        }
    }

    /**
     * Get patient statistics
     * @returns {Promise<Object>} Statistics object
     */
    async getPatientStatistics() {
        try {
            if (!this.isInitialized) {
                throw new Error('PatientManager not initialized');
            }

            log('Retrieving patient statistics...', 'info');

            const stats = await this.dataStorage.getStatistics();

            log('Patient statistics retrieved successfully', 'info');

            return stats;

        } catch (error) {
            log(`Failed to get patient statistics: ${error.message}`, 'error');

            if (this.errorHandler) {
                this.errorHandler.handleError(error, 'getPatientStatistics');
            }

            throw new Error(`Failed to get patient statistics: ${error.message}`);
        }
    }

    /**
     * Validate patient data without saving
     * @param {Object} patientData - Patient data to validate
     * @returns {Object} Validation result
     */
    validatePatientData(patientData) {
        try {
            if (!patientData || typeof patientData !== 'object') {
                return {
                    isValid: false,
                    errors: [{ field: 'general', message: 'Invalid patient data provided' }]
                };
            }

            const patient = new Patient(patientData);
            return patient.validate();

        } catch (error) {
            log(`Failed to validate patient data: ${error.message}`, 'error');

            return {
                isValid: false,
                errors: [{ field: 'general', message: error.message }]
            };
        }
    }

    /**
     * Create a backup of all patient data
     * @returns {Promise<Object>} Backup result
     */
    async createBackup() {
        try {
            if (!this.isInitialized) {
                throw new Error('PatientManager not initialized');
            }

            log('Creating patient data backup...', 'info');

            const backupResult = await this.dataStorage.createBackup();

            log('Patient data backup created successfully', 'info');

            return backupResult;

        } catch (error) {
            log(`Failed to create backup: ${error.message}`, 'error');

            if (this.errorHandler) {
                this.errorHandler.handleError(error, 'createBackup');
            }

            throw new Error(`Failed to create backup: ${error.message}`);
        }
    }

    /**
     * Check if patient manager is ready for operations
     * @returns {boolean} True if ready
     */
    isReady() {
        return this.isInitialized && this.dataStorage && this.dataStorage.isInitialized;
    }

    /**
     * Get current status of patient manager
     * @returns {Object} Status information
     */
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            hasDataStorage: !!this.dataStorage,
            dataStorageInitialized: this.dataStorage ? this.dataStorage.isInitialized : false,
            isReady: this.isReady()
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PatientManager;
}