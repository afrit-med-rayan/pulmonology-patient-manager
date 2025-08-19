/**
 * Shared Storage Manager
 * Handles data storage that works across different browsers on the same PC
 */

class SharedStorage {
    constructor() {
        this.baseURL = window.location.origin;
        this.fallbackToLocalStorage = false;
        this.sessionId = this.generateSessionId();
    }

    // Generate unique session ID
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Make HTTP request to server
    async makeRequest(endpoint, options = {}) {
        try {
            const response = await fetch(`${this.baseURL}/api/${endpoint}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.warn('Server request failed, falling back to localStorage:', error);
            this.fallbackToLocalStorage = true;
            throw error;
        }
    }

    // Get patients data
    async getPatients() {
        try {
            if (this.fallbackToLocalStorage) {
                return JSON.parse(localStorage.getItem('patients') || '[]');
            }

            const patients = await this.makeRequest('patients');
            return patients || [];
        } catch (error) {
            console.warn('Failed to get patients from server, using localStorage');
            return JSON.parse(localStorage.getItem('patients') || '[]');
        }
    }

    // Save patients data
    async savePatients(patients) {
        try {
            if (this.fallbackToLocalStorage) {
                localStorage.setItem('patients', JSON.stringify(patients));
                return true;
            }

            await this.makeRequest('patients', {
                method: 'POST',
                body: JSON.stringify(patients)
            });

            // Also save to localStorage as backup
            localStorage.setItem('patients', JSON.stringify(patients));
            return true;
        } catch (error) {
            console.warn('Failed to save patients to server, using localStorage');
            localStorage.setItem('patients', JSON.stringify(patients));
            return true;
        }
    }

    // Get session data
    async getSession(sessionId = null) {
        const id = sessionId || this.sessionId;
        try {
            if (this.fallbackToLocalStorage) {
                return JSON.parse(localStorage.getItem('userSession') || 'null');
            }

            const session = await this.makeRequest(`sessions?sessionId=${id}`);
            return session;
        } catch (error) {
            console.warn('Failed to get session from server, using localStorage');
            return JSON.parse(localStorage.getItem('userSession') || 'null');
        }
    }

    // Save session data
    async saveSession(sessionData, sessionId = null) {
        const id = sessionId || this.sessionId;
        try {
            if (this.fallbackToLocalStorage) {
                localStorage.setItem('userSession', JSON.stringify(sessionData));
                return true;
            }

            await this.makeRequest('sessions', {
                method: 'POST',
                body: JSON.stringify({
                    sessionId: id,
                    sessionData: sessionData
                })
            });

            // Also save to localStorage as backup
            localStorage.setItem('userSession', JSON.stringify(sessionData));
            return true;
        } catch (error) {
            console.warn('Failed to save session to server, using localStorage');
            localStorage.setItem('userSession', JSON.stringify(sessionData));
            return true;
        }
    }

    // Delete session
    async deleteSession(sessionId = null) {
        const id = sessionId || this.sessionId;
        try {
            if (this.fallbackToLocalStorage) {
                localStorage.removeItem('userSession');
                return true;
            }

            await this.makeRequest(`sessions?sessionId=${id}`, {
                method: 'DELETE'
            });

            // Also remove from localStorage
            localStorage.removeItem('userSession');
            return true;
        } catch (error) {
            console.warn('Failed to delete session from server, using localStorage');
            localStorage.removeItem('userSession');
            return true;
        }
    }

    // Sync data from server (useful for initial load)
    async syncFromServer() {
        try {
            const patients = await this.getPatients();
            localStorage.setItem('patients', JSON.stringify(patients));
            console.log('✅ Data synced from server');
            return patients;
        } catch (error) {
            console.warn('Failed to sync from server:', error);
            return JSON.parse(localStorage.getItem('patients') || '[]');
        }
    }

    // Check if server is available
    async checkServerConnection() {
        try {
            await this.makeRequest('patients');
            this.fallbackToLocalStorage = false;
            return true;
        } catch (error) {
            this.fallbackToLocalStorage = true;
            return false;
        }
    }
}

// Create global instance
window.sharedStorage = new SharedStorage();