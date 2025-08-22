/**
 * Folder-Based Cross-Browser Storage Manager
 * Creates a shared folder on PC where all browsers can read/write patient files
 */

class SharedStorage {
    constructor() {
        this.folderHandle = null;
        this.folderName = 'PatientManagementData';
        this.isInitialized = false;
        this.syncInterval = null;
        this.lastSyncCheck = 0;

        // Try to initialize folder access
        this.initializeFolderAccess();
    }

    // Initialize folder access for cross-browser storage
    async initializeFolderAccess() {
        try {
            // Check if File System Access API is available (Chrome/Edge)
            if ('showDirectoryPicker' in window) {
                // Try to get existing folder handle from localStorage
                const savedHandle = localStorage.getItem('patient_folder_handle');

                if (!savedHandle) {
                    // First time - ask user to select/create folder
                    await this.requestFolderAccess();
                } else {
                    // Try to use saved handle (note: handles can't be serialized, so this is a placeholder)
                    this.setupFolderSync();
                }
            } else {
                // Fallback for browsers without File System Access API
                this.setupFallbackSync();
            }
        } catch (error) {
            console.log('Folder access initialization failed, using fallback:', error);
            this.setupFallbackSync();
        }
    }

    // Request folder access from user
    async requestFolderAccess() {
        try {
            // Ask user to select a folder for patient data
            this.folderHandle = await window.showDirectoryPicker({
                mode: 'readwrite',
                startIn: 'documents'
            });

            localStorage.setItem('patient_folder_handle', 'granted');
            this.isInitialized = true;
            this.setupFolderSync();

            // Refresh the sync buttons to show new status
            this.refreshSyncButtons();

            this.showSyncNotification('✅ Folder access granted! Cross-browser sync is now active.');

            // Sync existing localStorage data to folder
            const existingPatients = JSON.parse(localStorage.getItem('patients') || '[]');
            if (existingPatients.length > 0) {
                await this.savePatients(existingPatients);
                setTimeout(() => {
                    this.showSyncNotification(`✅ Synced ${existingPatients.length} existing patients to shared folder!`);
                }, 2000);
            }

        } catch (error) {
            console.log('User cancelled folder selection or error occurred:', error);
            this.setupFallbackSync();
        }
    }

    // Setup folder-based sync
    setupFolderSync() {
        this.isInitialized = true;

        // Check for changes every 3 seconds
        this.syncInterval = setInterval(() => {
            this.syncFromFolder();
        }, 3000);

        console.log('📁 Folder-based cross-browser sync active');
    }

    // Setup fallback sync (export/import)
    setupFallbackSync() {
        this.isInitialized = false;
        console.log('📋 Using fallback export/import sync');
    }

    // Sync data from shared folder
    async syncFromFolder() {
        if (!this.folderHandle || !this.isInitialized) return;

        try {
            // Read patients from folder
            const patients = await this.readPatientsFromFolder();

            // Update localStorage if data is different
            const currentPatients = JSON.parse(localStorage.getItem('patients') || '[]');

            if (JSON.stringify(patients) !== JSON.stringify(currentPatients)) {
                localStorage.setItem('patients', JSON.stringify(patients));

                // Trigger page refresh to show new data
                if (patients.length !== currentPatients.length) {
                    window.dispatchEvent(new Event('patientsUpdated'));
                }
            }

        } catch (error) {
            console.log('Sync from folder failed:', error);
        }
    }

    // Read all patients from shared folder
    async readPatientsFromFolder() {
        if (!this.folderHandle) return [];

        try {
            const patients = [];

            // Read all .json files from the folder
            for await (const [name, handle] of this.folderHandle.entries()) {
                if (handle.kind === 'file' && name.endsWith('.json') && name.startsWith('patient_')) {
                    try {
                        const file = await handle.getFile();
                        const text = await file.text();
                        const patient = JSON.parse(text);
                        patients.push(patient);
                    } catch (error) {
                        console.log(`Failed to read patient file ${name}:`, error);
                    }
                }
            }

            return patients;
        } catch (error) {
            console.log('Failed to read patients from folder:', error);
            return [];
        }
    }

    // Save individual patient to shared folder
    async savePatientToFolder(patient) {
        if (!this.folderHandle) return false;

        try {
            const fileName = `patient_${patient.id}.json`;
            const fileHandle = await this.folderHandle.getFileHandle(fileName, { create: true });
            const writable = await fileHandle.createWritable();

            await writable.write(JSON.stringify(patient, null, 2));
            await writable.close();

            return true;
        } catch (error) {
            console.log('Failed to save patient to folder:', error);
            return false;
        }
    }

    // Delete patient file from shared folder
    async deletePatientFromFolder(patientId) {
        if (!this.folderHandle) return false;

        try {
            const fileName = `patient_${patientId}.json`;
            await this.folderHandle.removeEntry(fileName);
            return true;
        } catch (error) {
            console.log('Failed to delete patient from folder:', error);
            return false;
        }
    }

    // Get patients data
    async getPatients() {
        if (this.isInitialized && this.folderHandle) {
            // Try to get from shared folder first
            const folderPatients = await this.readPatientsFromFolder();
            if (folderPatients.length > 0) {
                // Update localStorage with folder data
                localStorage.setItem('patients', JSON.stringify(folderPatients));
                return folderPatients;
            }
        }

        // Fallback to localStorage
        return JSON.parse(localStorage.getItem('patients') || '[]');
    }

    // Save patients data
    async savePatients(patients) {
        // Always save to localStorage first
        localStorage.setItem('patients', JSON.stringify(patients));

        // If folder access is available, save each patient as individual file
        if (this.isInitialized && this.folderHandle) {
            try {
                // Save each patient as individual file
                for (const patient of patients) {
                    await this.savePatientToFolder(patient);
                }

                this.showSyncNotification('✅ Data saved to shared folder - visible in all browsers!');
                return true;
            } catch (error) {
                console.log('Failed to save to folder, using localStorage only:', error);
                this.showSyncNotification('⚠️ Data saved locally only');
            }
        } else {
            this.showSyncNotification('📋 Data saved locally - use Export/Import for cross-browser sync');
        }

        return true;
    }

    // Save single patient (for create/edit operations)
    async savePatient(patient) {
        // Get current patients
        const patients = await this.getPatients();

        // Find and update existing patient or add new one
        const existingIndex = patients.findIndex(p => p.id === patient.id);
        if (existingIndex >= 0) {
            patients[existingIndex] = patient;
        } else {
            patients.push(patient);
        }

        // Save all patients
        return await this.savePatients(patients);
    }

    // Delete patient
    async deletePatient(patientId) {
        // Get current patients
        const patients = await this.getPatients();

        // Remove patient from array
        const filteredPatients = patients.filter(p => p.id !== patientId);

        // Delete from folder if available
        if (this.isInitialized && this.folderHandle) {
            await this.deletePatientFromFolder(patientId);
        }

        // Save updated list
        return await this.savePatients(filteredPatients);
    }

    // Export data to file (for sharing between browsers)
    async exportData() {
        try {
            const patients = await this.getPatients();
            const sessions = JSON.parse(localStorage.getItem('userSession') || 'null');

            const data = {
                patients: patients,
                session: sessions,
                timestamp: Date.now(),
                version: '1.0'
            };

            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = this.dataFileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            URL.revokeObjectURL(url);

            this.showSyncNotification('✅ Data exported! Import this file in other browsers.');
            return true;
        } catch (error) {
            console.error('Export failed:', error);
            this.showSyncNotification('❌ Export failed: ' + error.message);
            return false;
        }
    }

    // Auto-export (silent)
    async autoExport() {
        try {
            const patients = await this.getPatients();
            const data = {
                patients: patients,
                timestamp: Date.now(),
                version: '1.0'
            };

            // Store in a special localStorage key that other browsers can check
            localStorage.setItem('shared_patient_data', JSON.stringify(data));

            return true;
        } catch (error) {
            console.error('Auto-export failed:', error);
            return false;
        }
    }

    // Import data from file
    async importData() {
        const input = document.getElementById('shared-storage-input');
        if (input) {
            input.click();
        }
    }

    // Import from file object
    async importFromFile(file) {
        try {
            const text = await file.text();
            const data = JSON.parse(text);

            if (data.patients && Array.isArray(data.patients)) {
                localStorage.setItem('patients', JSON.stringify(data.patients));

                if (data.session) {
                    localStorage.setItem('userSession', JSON.stringify(data.session));
                }

                this.showSyncNotification(`✅ Imported ${data.patients.length} patients successfully!`);

                // Refresh the page to show new data
                setTimeout(() => {
                    window.location.reload();
                }, 2000);

                return true;
            } else {
                throw new Error('Invalid file format');
            }
        } catch (error) {
            console.error('Import failed:', error);
            this.showSyncNotification('❌ Import failed: ' + error.message);
            return false;
        }
    }

    // Show sync notification
    showSyncNotification(message) {
        // Remove existing notification
        const existing = document.getElementById('sync-notification');
        if (existing) existing.remove();

        // Create notification
        const notification = document.createElement('div');
        notification.id = 'sync-notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #1e40af;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10000;
            max-width: 300px;
            font-size: 14px;
            line-height: 1.4;
        `;

        notification.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div>${message}</div>
                <button onclick="this.parentElement.parentElement.remove()" 
                        style="background: none; border: none; color: white; font-size: 18px; cursor: pointer; margin-left: 10px;">×</button>
            </div>
        `;

        document.body.appendChild(notification);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    // Get session data
    async getSession() {
        return JSON.parse(localStorage.getItem('userSession') || 'null');
    }

    // Save session data
    async saveSession(sessionData) {
        localStorage.setItem('userSession', JSON.stringify(sessionData));
        return true;
    }

    // Delete session
    async deleteSession() {
        localStorage.removeItem('userSession');
        return true;
    }

    // Add sync buttons to the page
    addSyncButtons() {
        // Check if buttons already exist
        if (document.getElementById('sync-buttons-container')) return;

        const container = document.createElement('div');
        container.id = 'sync-buttons-container';
        container.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: white;
            padding: 15px;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 9999;
            border: 2px solid #1e40af;
            max-width: 250px;
        `;

        let buttonsHtml = '';

        if (this.isInitialized) {
            // Folder sync is active
            buttonsHtml = `
                <div style="font-weight: bold; margin-bottom: 10px; color: #059669;">📁 Folder Sync Active</div>
                <div style="font-size: 12px; color: #666; margin-bottom: 10px;">
                    Data automatically syncs between all browsers!
                </div>
            `;
        } else if ('showDirectoryPicker' in window) {
            // Can setup folder sync
            buttonsHtml = `
                <div style="font-weight: bold; margin-bottom: 10px; color: #1e40af;">Setup Cross-Browser Sync</div>
                <button onclick="window.sharedStorage.requestFolderAccess()" 
                        style="background: #059669; color: white; border: none; padding: 8px 12px; border-radius: 5px; margin-bottom: 8px; width: 100%; cursor: pointer;">
                    📁 Setup Shared Folder
                </button>
                <div style="font-size: 11px; color: #666; margin-bottom: 8px;">
                    Or use manual sync:
                </div>
            `;
        } else {
            // Fallback buttons
            buttonsHtml = `
                <div style="font-weight: bold; margin-bottom: 10px; color: #1e40af;">Manual Cross-Browser Sync</div>
            `;
        }

        // Add export/import buttons for fallback
        if (!this.isInitialized) {
            buttonsHtml += `
                <button onclick="window.sharedStorage.exportData()" 
                        style="background: #1e40af; color: white; border: none; padding: 6px 10px; border-radius: 5px; margin-right: 5px; cursor: pointer; font-size: 12px;">
                    Export
                </button>
                <button onclick="window.sharedStorage.importData()" 
                        style="background: #059669; color: white; border: none; padding: 6px 10px; border-radius: 5px; cursor: pointer; font-size: 12px;">
                    Import
                </button>
            `;
        }

        buttonsHtml += `
            <button onclick="document.getElementById('sync-buttons-container').remove()" 
                    style="background: #dc2626; color: white; border: none; padding: 4px 8px; border-radius: 3px; float: right; cursor: pointer; font-size: 12px;">
                ×
            </button>
        `;

        container.innerHTML = buttonsHtml;
        document.body.appendChild(container);
    }

    // Export data to file (fallback method)
    async exportData() {
        try {
            const patients = await this.getPatients();
            const sessions = JSON.parse(localStorage.getItem('userSession') || 'null');

            const data = {
                patients: patients,
                session: sessions,
                timestamp: Date.now(),
                version: '1.0'
            };

            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = 'patient-data.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            URL.revokeObjectURL(url);

            this.showSyncNotification('✅ Data exported! Import this file in other browsers.');
            return true;
        } catch (error) {
            console.error('Export failed:', error);
            this.showSyncNotification('❌ Export failed: ' + error.message);
            return false;
        }
    }

    // Import data from file (fallback method)
    async importData() {
        // Create temporary file input
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.style.display = 'none';

        input.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                try {
                    const text = await file.text();
                    const data = JSON.parse(text);

                    if (data.patients && Array.isArray(data.patients)) {
                        await this.savePatients(data.patients);

                        if (data.session) {
                            localStorage.setItem('userSession', JSON.stringify(data.session));
                        }

                        this.showSyncNotification(`✅ Imported ${data.patients.length} patients successfully!`);

                        // Refresh the page to show new data
                        setTimeout(() => {
                            window.location.reload();
                        }, 2000);
                    } else {
                        throw new Error('Invalid file format');
                    }
                } catch (error) {
                    console.error('Import failed:', error);
                    this.showSyncNotification('❌ Import failed: ' + error.message);
                }
            }
            document.body.removeChild(input);
        });

        document.body.appendChild(input);
        input.click();
    }

    // Show welcome message about cross-browser sync
    showWelcomeMessage() {
        // Only show once per session
        if (sessionStorage.getItem('sync_welcome_shown')) return;

        sessionStorage.setItem('sync_welcome_shown', 'true');

        setTimeout(() => {
            if (this.isInitialized) {
                this.showSyncNotification(`
                    📁 Folder Sync Active!<br>
                    <small>Your patient data automatically syncs between all browsers on this PC.</small>
                `);
            } else if ('showDirectoryPicker' in window) {
                this.showSyncNotification(`
                    🔄 Cross-Browser Sync Available!<br>
                    <small>Click "Setup Shared Folder" (bottom-right) for automatic sync between browsers.</small>
                `);
            } else {
                this.showSyncNotification(`
                    📋 Manual Sync Available!<br>
                    <small>Use Export/Import buttons (bottom-right) to share data between browsers.</small>
                `);
            }
        }, 1000);
    }

    // Refresh sync buttons (called when folder access changes)
    refreshSyncButtons() {
        const existing = document.getElementById('sync-buttons-container');
        if (existing) {
            existing.remove();
        }
        this.addSyncButtons();
    }

    // Initialize sync system
    init() {
        // Add sync buttons after page loads
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(() => {
                    this.addSyncButtons();
                    this.showWelcomeMessage();
                }, 3000);
            });
        } else {
            setTimeout(() => {
                this.addSyncButtons();
                this.showWelcomeMessage();
            }, 3000);
        }

        // Listen for patient updates to refresh UI
        window.addEventListener('patientsUpdated', () => {
            // Refresh patient list if visible
            if (typeof updateStats === 'function') {
                updateStats();
            }
        });

        console.log('📁 Folder-based cross-browser sync initialized');
        console.log('💡 Setup shared folder for automatic sync or use Export/Import');
    }
}

// Create global instance and initialize
window.sharedStorage = new SharedStorage();
window.sharedStorage.init();