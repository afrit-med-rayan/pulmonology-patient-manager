/**
 * Data Storage Manager Component
 * Handles local data persistence and file operations
 * 
 * Uses localStorage as fallback for browsers that don't support File System Access API
 * Implements directory structure simulation for organized data storage
 */

class DataStorageManager {
    constructor() {
        this.isInitialized = false;
        this.storageType = 'localStorage'; // Will be 'fileSystem' if File System Access API is available
        this.dataDirectory = STORAGE_CONFIG.dataDirectory;
        this.backupDirectory = STORAGE_CONFIG.backupDirectory;
        this.patientsIndex = new Map(); // In-memory index for fast searches
        this.errorHandler = null; // Will be set during initialization
    }

    /**
     * Initialize the storage system
     * Creates necessary directories and loads patient index
     */
    async initializeStorage() {
        try {
            log('Initializing data storage system...', 'info');

            // Check if File System Access API is available
            if ('showDirectoryPicker' in window) {
                this.storageType = 'fileSystem';
                log('File System Access API available - using file system storage', 'info');
            } else {
                this.storageType = 'localStorage';
                log('File System Access API not available - using localStorage fallback', 'info');
            }

            // Initialize storage based on type
            if (this.storageType === 'localStorage') {
                await this.initializeLocalStorage();
            } else {
                await this.initializeFileSystem();
            }

            // Load existing patients index
            await this.loadPatientsIndex();

            this.isInitialized = true;
            log('Data storage system initialized successfully', 'info');

            return {
                success: true,
                storageType: this.storageType,
                patientsCount: this.patientsIndex.size
            };

        } catch (error) {
            log(`Failed to initialize storage: ${error.message}`, 'error');
            throw new Error(`Storage initialization failed: ${error.message}`);
        }
    }

    /**
     * Initialize localStorage-based storage
     */
    async initializeLocalStorage() {
        try {
            // Check if localStorage is available
            if (!window.localStorage) {
                throw new Error('localStorage is not available');
            }

            // Initialize storage structure in localStorage
            if (!localStorage.getItem('pms_patients')) {
                localStorage.setItem('pms_patients', JSON.stringify({}));
            }

            if (!localStorage.getItem('pms_patients_index')) {
                localStorage.setItem('pms_patients_index', JSON.stringify([]));
            }

            if (!localStorage.getItem('pms_config')) {
                localStorage.setItem('pms_config', JSON.stringify({
                    version: '1.0.0',
                    createdAt: getCurrentTimestamp(),
                    lastBackup: null
                }));
            }

            log('localStorage storage initialized', 'info');

        } catch (error) {
            throw new Error(`localStorage initialization failed: ${error.message}`);
        }
    }

    /**
     * Initialize file system-based storage
     */
    async initializeFileSystem() {
        try {
            // For now, we'll use localStorage as the primary storage
            // File System Access API implementation would go here in a real scenario
            // This is a placeholder for future enhancement
            await this.initializeLocalStorage();
            log('File system storage initialized (using localStorage backend)', 'info');

        } catch (error) {
            throw new Error(`File system initialization failed: ${error.message}`);
        }
    }

    /**
     * Load patients index from storage
     */
    async loadPatientsIndex() {
        try {
            const indexData = localStorage.getItem('pms_patients_index');
            if (indexData) {
                const index = JSON.parse(indexData);
                this.patientsIndex.clear();

                index.forEach(patient => {
                    this.patientsIndex.set(patient.id, {
                        id: patient.id,
                        firstName: patient.firstName,
                        lastName: patient.lastName,
                        fullName: `${patient.firstName} ${patient.lastName}`,
                        age: patient.age,
                        gender: patient.gender,
                        placeOfResidence: patient.placeOfResidence,
                        lastVisitDate: patient.lastVisitDate,
                        createdAt: patient.createdAt,
                        updatedAt: patient.updatedAt
                    });
                });
            }

            log(`Loaded ${this.patientsIndex.size} patients into index`, 'info');

        } catch (error) {
            log(`Failed to load patients index: ${error.message}`, 'error');
            // Initialize empty index if loading fails
            this.patientsIndex.clear();
        }
    }

    /**
     * Save patients index to storage
     */
    async savePatientsIndex() {
        try {
            const indexArray = Array.from(this.patientsIndex.values());
            localStorage.setItem('pms_patients_index', JSON.stringify(indexArray));
            log('Patients index saved successfully', 'info');

        } catch (error) {
            log(`Failed to save patients index: ${error.message}`, 'error');
            throw new Error(`Failed to save patients index: ${error.message}`);
        }
    }

    /**
     * Save patient data to storage
     * @param {Object} patientData - Patient data to save
     * @returns {Promise<Object>} Save result
     */
    async savePatient(patientData) {
        try {
            if (!this.isInitialized) {
                throw new Error('Storage not initialized');
            }

            // Validate patient data
            if (!patientData || !patientData.id) {
                throw new Error('Invalid patient data: missing ID');
            }

            // Create Patient instance to ensure data integrity
            const patient = new Patient(patientData);

            // Validate the patient data
            const validation = patient.validate();
            if (!validation.isValid) {
                throw new Error(`Patient validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
            }

            // Sanitize the data
            patient.sanitize();

            // Update timestamp
            patient.touch();

            // Save to storage
            const patients = JSON.parse(localStorage.getItem('pms_patients') || '{}');
            patients[patient.id] = patient.toJSON();
            localStorage.setItem('pms_patients', JSON.stringify(patients));

            // Update index
            const lastVisit = patient.getLatestVisit();
            this.patientsIndex.set(patient.id, {
                id: patient.id,
                firstName: patient.firstName,
                lastName: patient.lastName,
                fullName: patient.getFullName(),
                age: patient.age,
                gender: patient.gender,
                placeOfResidence: patient.placeOfResidence,
                lastVisitDate: lastVisit ? lastVisit.visitDate : null,
                createdAt: patient.createdAt,
                updatedAt: patient.updatedAt
            });

            // Save updated index
            await this.savePatientsIndex();

            log(`Patient ${patient.getFullName()} saved successfully`, 'info');

            return {
                success: true,
                patientId: patient.id,
                message: SUCCESS_MESSAGES.patient.created
            };

        } catch (error) {
            log(`Failed to save patient: ${error.message}`, 'error');
            throw new Error(`Failed to save patient: ${error.message}`);
        }
    }

    /**
     * Load patient data from storage
     * @param {string} patientId - ID of patient to load
     * @returns {Promise<Patient|null>} Patient data or null if not found
     */
    async loadPatient(patientId) {
        try {
            if (!this.isInitialized) {
                throw new Error('Storage not initialized');
            }

            if (!patientId) {
                throw new Error('Patient ID is required');
            }

            const patients = JSON.parse(localStorage.getItem('pms_patients') || '{}');
            const patientData = patients[patientId];

            if (!patientData) {
                log(`Patient with ID ${patientId} not found`, 'info');
                return null;
            }

            // Create Patient instance from stored data
            const patient = Patient.fromJSON(patientData);

            log(`Patient ${patient.getFullName()} loaded successfully`, 'info');
            return patient;

        } catch (error) {
            log(`Failed to load patient ${patientId}: ${error.message}`, 'error');
            throw new Error(`Failed to load patient: ${error.message}`);
        }
    }

    /**
     * Delete patient from storage
     * @param {string} patientId - ID of patient to delete
     * @returns {Promise<Object>} Delete result
     */
    async deletePatient(patientId) {
        try {
            if (!this.isInitialized) {
                throw new Error('Storage not initialized');
            }

            if (!patientId) {
                throw new Error('Patient ID is required');
            }

            // Check if patient exists
            const patients = JSON.parse(localStorage.getItem('pms_patients') || '{}');
            if (!patients[patientId]) {
                throw new Error('Patient not found');
            }

            const patientName = this.patientsIndex.get(patientId)?.fullName || 'Unknown';

            // Remove from storage
            delete patients[patientId];
            localStorage.setItem('pms_patients', JSON.stringify(patients));

            // Remove from index
            this.patientsIndex.delete(patientId);

            // Save updated index
            await this.savePatientsIndex();

            log(`Patient ${patientName} deleted successfully`, 'info');

            return {
                success: true,
                patientId: patientId,
                message: SUCCESS_MESSAGES.patient.deleted
            };

        } catch (error) {
            log(`Failed to delete patient ${patientId}: ${error.message}`, 'error');
            throw new Error(`Failed to delete patient: ${error.message}`);
        }
    }

    /**
     * Search patients based on criteria
     * @param {Object} criteria - Search criteria
     * @returns {Promise<Array>} Array of matching patients
     */
    async searchPatients(criteria) {
        try {
            if (!this.isInitialized) {
                throw new Error('Storage not initialized');
            }

            let results = Array.from(this.patientsIndex.values());

            // Apply search filters
            if (criteria.searchTerm) {
                const term = normalizeForSearch(criteria.searchTerm);
                results = results.filter(patient => {
                    return (
                        normalizeForSearch(patient.firstName).includes(term) ||
                        normalizeForSearch(patient.lastName).includes(term) ||
                        normalizeForSearch(patient.fullName).includes(term) ||
                        normalizeForSearch(patient.placeOfResidence).includes(term)
                    );
                });
            }

            if (criteria.gender) {
                results = results.filter(patient =>
                    patient.gender.toLowerCase() === criteria.gender.toLowerCase()
                );
            }

            if (criteria.ageRange) {
                const { min, max } = criteria.ageRange;
                results = results.filter(patient => {
                    const age = patient.age;
                    return (!min || age >= min) && (!max || age <= max);
                });
            }

            if (criteria.placeOfResidence) {
                const place = normalizeForSearch(criteria.placeOfResidence);
                results = results.filter(patient =>
                    normalizeForSearch(patient.placeOfResidence).includes(place)
                );
            }

            // Sort results by relevance (exact matches first, then by name)
            if (criteria.searchTerm) {
                const term = normalizeForSearch(criteria.searchTerm);
                results.sort((a, b) => {
                    const aExact = normalizeForSearch(a.fullName) === term ? 1 : 0;
                    const bExact = normalizeForSearch(b.fullName) === term ? 1 : 0;

                    if (aExact !== bExact) return bExact - aExact;

                    return a.fullName.localeCompare(b.fullName);
                });
            } else {
                // Sort by last name, then first name
                results.sort((a, b) => {
                    const lastNameCompare = a.lastName.localeCompare(b.lastName);
                    if (lastNameCompare !== 0) return lastNameCompare;
                    return a.firstName.localeCompare(b.firstName);
                });
            }

            // Apply pagination if specified
            if (criteria.limit) {
                const start = criteria.offset || 0;
                results = results.slice(start, start + criteria.limit);
            }

            log(`Search completed: ${results.length} patients found`, 'info');

            return results;

        } catch (error) {
            log(`Search failed: ${error.message}`, 'error');
            throw new Error(`Search failed: ${error.message}`);
        }
    }

    /**
     * Get all patients (with optional pagination)
     * @param {Object} options - Options for retrieval
     * @returns {Promise<Array>} Array of all patients
     */
    async getAllPatients(options = {}) {
        try {
            return await this.searchPatients({
                limit: options.limit,
                offset: options.offset
            });

        } catch (error) {
            log(`Failed to get all patients: ${error.message}`, 'error');
            throw new Error(`Failed to get all patients: ${error.message}`);
        }
    }

    /**
     * Get patient statistics
     * @returns {Promise<Object>} Statistics object
     */
    async getStatistics() {
        try {
            if (!this.isInitialized) {
                throw new Error('Storage not initialized');
            }

            const patients = Array.from(this.patientsIndex.values());
            const totalPatients = patients.length;

            // Gender distribution
            const genderStats = patients.reduce((acc, patient) => {
                const gender = patient.gender || 'unknown';
                acc[gender] = (acc[gender] || 0) + 1;
                return acc;
            }, {});

            // Age distribution
            const ageRanges = {
                '0-18': 0,
                '19-35': 0,
                '36-50': 0,
                '51-65': 0,
                '66+': 0
            };

            patients.forEach(patient => {
                const age = patient.age;
                if (age <= 18) ageRanges['0-18']++;
                else if (age <= 35) ageRanges['19-35']++;
                else if (age <= 50) ageRanges['36-50']++;
                else if (age <= 65) ageRanges['51-65']++;
                else ageRanges['66+']++;
            });

            // Recent activity
            const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
            const recentPatients = patients.filter(patient =>
                patient.updatedAt > thirtyDaysAgo
            ).length;

            return {
                totalPatients,
                genderDistribution: genderStats,
                ageDistribution: ageRanges,
                recentActivity: recentPatients,
                storageType: this.storageType
            };

        } catch (error) {
            log(`Failed to get statistics: ${error.message}`, 'error');
            throw new Error(`Failed to get statistics: ${error.message}`);
        }
    }

    /**
     * Create backup of all patient data
     * @returns {Promise<Object>} Backup result
     */
    async createBackup() {
        try {
            if (!this.isInitialized) {
                throw new Error('Storage not initialized');
            }

            const timestamp = getCurrentTimestamp();
            const backupData = {
                version: '1.0.0',
                createdAt: timestamp,
                patients: JSON.parse(localStorage.getItem('pms_patients') || '{}'),
                index: JSON.parse(localStorage.getItem('pms_patients_index') || '[]'),
                config: JSON.parse(localStorage.getItem('pms_config') || '{}')
            };

            // Store backup in localStorage with timestamp
            const backupKey = `pms_backup_${timestamp}`;
            localStorage.setItem(backupKey, JSON.stringify(backupData));

            // Update config with last backup time
            const config = JSON.parse(localStorage.getItem('pms_config') || '{}');
            config.lastBackup = timestamp;
            localStorage.setItem('pms_config', JSON.stringify(config));

            // Clean up old backups (keep only last 5)
            await this.cleanupOldBackups();

            log('Backup created successfully', 'info');

            return {
                success: true,
                backupId: backupKey,
                timestamp: timestamp,
                patientsCount: Object.keys(backupData.patients).length,
                message: 'Backup created successfully'
            };

        } catch (error) {
            log(`Backup failed: ${error.message}`, 'error');
            throw new Error(`Backup failed: ${error.message}`);
        }
    }

    /**
     * Restore data from backup
     * @param {string} backupId - ID of backup to restore
     * @returns {Promise<Object>} Restore result
     */
    async restoreFromBackup(backupId) {
        try {
            if (!this.isInitialized) {
                throw new Error('Storage not initialized');
            }

            const backupData = localStorage.getItem(backupId);
            if (!backupData) {
                throw new Error('Backup not found');
            }

            const backup = JSON.parse(backupData);

            // Restore data
            localStorage.setItem('pms_patients', JSON.stringify(backup.patients));
            localStorage.setItem('pms_patients_index', JSON.stringify(backup.index));
            localStorage.setItem('pms_config', JSON.stringify(backup.config));

            // Reload index
            await this.loadPatientsIndex();

            log('Data restored from backup successfully', 'info');

            return {
                success: true,
                backupId: backupId,
                patientsCount: Object.keys(backup.patients).length,
                message: 'Data restored successfully'
            };

        } catch (error) {
            log(`Restore failed: ${error.message}`, 'error');
            throw new Error(`Restore failed: ${error.message}`);
        }
    }

    /**
     * Get list of available backups
     * @returns {Promise<Array>} Array of backup information
     */
    async getBackupsList() {
        try {
            const backups = [];

            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('pms_backup_')) {
                    try {
                        const backupData = JSON.parse(localStorage.getItem(key));
                        backups.push({
                            id: key,
                            createdAt: backupData.createdAt,
                            patientsCount: Object.keys(backupData.patients || {}).length,
                            version: backupData.version
                        });
                    } catch (error) {
                        log(`Invalid backup data for ${key}`, 'warn');
                    }
                }
            }

            // Sort by creation date (newest first)
            backups.sort((a, b) => b.createdAt - a.createdAt);

            return backups;

        } catch (error) {
            log(`Failed to get backups list: ${error.message}`, 'error');
            throw new Error(`Failed to get backups list: ${error.message}`);
        }
    }

    /**
     * Clean up old backups (keep only the 5 most recent)
     */
    async cleanupOldBackups() {
        try {
            const backups = await this.getBackupsList();

            // Remove backups beyond the 5 most recent
            if (backups.length > 5) {
                const backupsToRemove = backups.slice(5);
                backupsToRemove.forEach(backup => {
                    localStorage.removeItem(backup.id);
                    log(`Removed old backup: ${backup.id}`, 'info');
                });
            }

        } catch (error) {
            log(`Failed to cleanup old backups: ${error.message}`, 'warn');
        }
    }

    /**
     * Export patient data as JSON
     * @param {Array} patientIds - Optional array of patient IDs to export (exports all if not provided)
     * @returns {Promise<Object>} Export data
     */
    async exportPatients(patientIds = null) {
        try {
            if (!this.isInitialized) {
                throw new Error('Storage not initialized');
            }

            const allPatients = JSON.parse(localStorage.getItem('pms_patients') || '{}');
            let patientsToExport = {};

            if (patientIds && Array.isArray(patientIds)) {
                // Export specific patients
                patientIds.forEach(id => {
                    if (allPatients[id]) {
                        patientsToExport[id] = allPatients[id];
                    }
                });
            } else {
                // Export all patients
                patientsToExport = allPatients;
            }

            const exportData = {
                exportedAt: getCurrentTimestamp(),
                version: '1.0.0',
                patientsCount: Object.keys(patientsToExport).length,
                patients: patientsToExport
            };

            log(`Exported ${exportData.patientsCount} patients`, 'info');

            return exportData;

        } catch (error) {
            log(`Export failed: ${error.message}`, 'error');
            throw new Error(`Export failed: ${error.message}`);
        }
    }

    /**
     * Import patient data from JSON
     * @param {Object} importData - Data to import
     * @param {Object} options - Import options
     * @returns {Promise<Object>} Import result
     */
    async importPatients(importData, options = {}) {
        try {
            if (!this.isInitialized) {
                throw new Error('Storage not initialized');
            }

            if (!importData || !importData.patients) {
                throw new Error('Invalid import data');
            }

            const { overwriteExisting = false } = options;
            const currentPatients = JSON.parse(localStorage.getItem('pms_patients') || '{}');
            let importedCount = 0;
            let skippedCount = 0;
            let errors = [];

            for (const [patientId, patientData] of Object.entries(importData.patients)) {
                try {
                    // Check if patient already exists
                    if (currentPatients[patientId] && !overwriteExisting) {
                        skippedCount++;
                        continue;
                    }

                    // Validate patient data
                    const patient = new Patient(patientData);
                    const validation = patient.validate();

                    if (!validation.isValid) {
                        errors.push({
                            patientId,
                            error: `Validation failed: ${validation.errors.map(e => e.message).join(', ')}`
                        });
                        continue;
                    }

                    // Save patient
                    await this.savePatient(patient.toJSON());
                    importedCount++;

                } catch (error) {
                    errors.push({
                        patientId,
                        error: error.message
                    });
                }
            }

            log(`Import completed: ${importedCount} imported, ${skippedCount} skipped, ${errors.length} errors`, 'info');

            return {
                success: true,
                importedCount,
                skippedCount,
                errorsCount: errors.length,
                errors: errors.slice(0, 10), // Return first 10 errors
                message: `Import completed: ${importedCount} patients imported`
            };

        } catch (error) {
            log(`Import failed: ${error.message}`, 'error');
            throw new Error(`Import failed: ${error.message}`);
        }
    }

    /**
     * Check storage health and integrity
     * @returns {Promise<Object>} Health check result
     */
    async checkStorageHealth() {
        try {
            const health = {
                isHealthy: true,
                issues: [],
                statistics: await this.getStatistics()
            };

            // Check if localStorage is accessible
            try {
                localStorage.setItem('pms_health_check', 'test');
                localStorage.removeItem('pms_health_check');
            } catch (error) {
                health.isHealthy = false;
                health.issues.push('localStorage is not accessible');
            }

            // Check data integrity
            try {
                const patients = JSON.parse(localStorage.getItem('pms_patients') || '{}');
                const index = JSON.parse(localStorage.getItem('pms_patients_index') || '[]');

                // Check if index matches stored patients
                const storedIds = new Set(Object.keys(patients));
                const indexIds = new Set(index.map(p => p.id));

                const missingInIndex = [...storedIds].filter(id => !indexIds.has(id));
                const missingInStorage = [...indexIds].filter(id => !storedIds.has(id));

                if (missingInIndex.length > 0) {
                    health.issues.push(`${missingInIndex.length} patients missing from index`);
                }

                if (missingInStorage.length > 0) {
                    health.issues.push(`${missingInStorage.length} patients in index but not in storage`);
                }

            } catch (error) {
                health.isHealthy = false;
                health.issues.push('Data integrity check failed');
            }

            if (health.issues.length > 0) {
                health.isHealthy = false;
            }

            return health;

        } catch (error) {
            return {
                isHealthy: false,
                issues: [`Health check failed: ${error.message}`],
                statistics: null
            };
        }
    }

    /**
     * Repair storage issues
     * @returns {Promise<Object>} Repair result
     */
    async repairStorage() {
        try {
            const repairs = [];

            // Rebuild index from stored patients
            const patients = JSON.parse(localStorage.getItem('pms_patients') || '{}');
            this.patientsIndex.clear();

            for (const [patientId, patientData] of Object.entries(patients)) {
                try {
                    const patient = Patient.fromJSON(patientData);
                    const lastVisit = patient.getLatestVisit();

                    this.patientsIndex.set(patient.id, {
                        id: patient.id,
                        firstName: patient.firstName,
                        lastName: patient.lastName,
                        fullName: patient.getFullName(),
                        age: patient.age,
                        gender: patient.gender,
                        placeOfResidence: patient.placeOfResidence,
                        lastVisitDate: lastVisit ? lastVisit.visitDate : null,
                        createdAt: patient.createdAt,
                        updatedAt: patient.updatedAt
                    });
                } catch (error) {
                    repairs.push(`Failed to process patient ${patientId}: ${error.message}`);
                }
            }

            // Save rebuilt index
            await this.savePatientsIndex();
            repairs.push('Index rebuilt successfully');

            log('Storage repair completed', 'info');

            return {
                success: true,
                repairs: repairs,
                message: 'Storage repaired successfully'
            };

        } catch (error) {
            log(`Storage repair failed: ${error.message}`, 'error');
            throw new Error(`Storage repair failed: ${error.message}`);
        }
    }

    /**
     * Get storage usage information
     * @returns {Promise<Object>} Storage usage data
     */
    async getStorageUsage() {
        try {
            let totalSize = 0;
            let itemCount = 0;

            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('pms_')) {
                    const value = localStorage.getItem(key);
                    totalSize += key.length + (value ? value.length : 0);
                    itemCount++;
                }
            }

            // Calculate storage breakdown
            const patients = localStorage.getItem('pms_patients');
            const index = localStorage.getItem('pms_patients_index');
            const config = localStorage.getItem('pms_config');

            const breakdown = {
                patients: patients ? patients.length : 0,
                index: index ? index.length : 0,
                config: config ? config.length : 0,
                backups: 0
            };

            // Calculate backup sizes
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('pms_backup_')) {
                    const value = localStorage.getItem(key);
                    breakdown.backups += value ? value.length : 0;
                }
            }

            return {
                totalSize: totalSize,
                formattedSize: formatFileSize(totalSize),
                itemCount: itemCount,
                patientsCount: this.patientsIndex.size,
                breakdown: breakdown,
                storageType: this.storageType
            };

        } catch (error) {
            log(`Failed to get storage usage: ${error.message}`, 'error');
            throw new Error(`Failed to get storage usage: ${error.message}`);
        }
    }

    /**
     * Clear all patient data (for testing or reset purposes)
     * @returns {Promise<Object>} Clear result
     */
    async clearAllData() {
        try {
            if (!this.isInitialized) {
                throw new Error('Storage not initialized');
            }

            // Clear all patient-related data
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('pms_')) {
                    keysToRemove.push(key);
                }
            }

            keysToRemove.forEach(key => localStorage.removeItem(key));

            // Clear in-memory index
            this.patientsIndex.clear();

            // Reinitialize storage
            await this.initializeLocalStorage();

            log('All patient data cleared successfully', 'info');

            return {
                success: true,
                clearedItems: keysToRemove.length,
                message: 'All data cleared successfully'
            };

        } catch (error) {
            log(`Failed to clear data: ${error.message}`, 'error');
            throw new Error(`Failed to clear data: ${error.message}`);
        }
    }

    /**
     * Set error handler for the storage manager
     * @param {ErrorHandler} errorHandler - Error handler instance
     */
    setErrorHandler(errorHandler) {
        this.errorHandler = errorHandler;
    }

    /**
     * Check if storage is initialized
     * @returns {boolean} True if initialized
     */
    isStorageInitialized() {
        return this.isInitialized;
    }

    /**
     * Get storage type being used
     * @returns {string} Storage type ('localStorage' or 'fileSystem')
     */
    getStorageType() {
        return this.storageType;
    }

    /**
     * Get patients count
     * @returns {number} Number of patients in storage
     */
    getPatientsCount() {
        return this.patientsIndex.size;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataStorageManager;
}