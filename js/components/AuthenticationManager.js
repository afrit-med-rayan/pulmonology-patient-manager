/**
 * Authentication Manager Component
 * Handles user authentication and session management
 */

class AuthenticationManager {
    constructor() {
        this.currentSession = null;
        this.loginAttempts = 0;
        this.lockoutTime = null;
        this.sessionTimeout = AUTH_CONFIG.sessionTimeout;
        this.maxLoginAttempts = AUTH_CONFIG.maxLoginAttempts;
        this.lockoutDuration = AUTH_CONFIG.lockoutDuration;

        // Initialize session from storage
        this.initializeSession();

        // Set up session monitoring
        this.setupSessionMonitoring();
    }

    /**
     * Initialize session from sessionStorage
     */
    initializeSession() {
        try {
            const sessionData = sessionStorage.getItem(AUTH_CONFIG.sessionStorageKey);
            if (sessionData) {
                const session = JSON.parse(sessionData);
                if (this.isSessionValid(session)) {
                    this.currentSession = new Session(session);
                    this.updateLastActivity();
                } else {
                    this.clearSession();
                }
            }
        } catch (error) {
            console.error('Error initializing session:', error);
            this.clearSession();
        }
    }

    /**
     * Set up session monitoring for activity tracking
     */
    setupSessionMonitoring() {
        // Update activity on user interactions
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];

        const updateActivity = debounce(() => {
            if (this.isAuthenticated()) {
                this.updateLastActivity();
            }
        }, 30000); // Update every 30 seconds max

        events.forEach(event => {
            document.addEventListener(event, updateActivity, true);
        });

        // Check session validity periodically
        setInterval(() => {
            if (this.currentSession && !this.isSessionValid(this.currentSession)) {
                this.handleSessionExpired();
            }
        }, 60000); // Check every minute
    }

    /**
     * Authenticate user with username and password
     * @param {string} username - Username
     * @param {string} password - Password
     * @returns {Promise<boolean>} True if authentication successful
     */
    async login(username, password) {
        try {
            // Check if account is locked out
            if (this.isLockedOut()) {
                throw new Error(ERROR_MESSAGES.auth.tooManyAttempts);
            }

            // Validate input
            if (!username || !password) {
                throw new Error('Username and password are required');
            }

            // Validate credentials
            const isValid = await this.validateCredentials(username, password);

            if (isValid) {
                // Create new session
                const sessionData = {
                    userId: generateId(),
                    username: username.trim(),
                    loginTime: getCurrentTimestamp(),
                    lastActivity: getCurrentTimestamp(),
                    isAuthenticated: true
                };

                this.currentSession = new Session(sessionData);
                this.saveSession();

                // Reset login attempts
                this.loginAttempts = 0;
                this.lockoutTime = null;

                log(`User ${username} logged in successfully`);
                return true;
            } else {
                // Increment failed attempts
                this.loginAttempts++;

                if (this.loginAttempts >= this.maxLoginAttempts) {
                    this.lockoutTime = getCurrentTimestamp();
                    log(`Account locked due to too many failed attempts`);
                }

                throw new Error(ERROR_MESSAGES.auth.invalidCredentials);
            }
        } catch (error) {
            log(`Login failed: ${error.message}`, 'error');
            throw error;
        }
    }

    /**
     * Log out current user
     * @param {boolean} clearSession - Whether to clear session storage
     */
    logout(clearSession = true) {
        try {
            const username = this.currentSession?.username || 'Unknown';

            if (clearSession) {
                this.clearSession();
            }

            this.currentSession = null;

            log(`User ${username} logged out`);
        } catch (error) {
            console.error('Error during logout:', error);
            // Force clear session even if error occurs
            this.clearSession();
            this.currentSession = null;
        }
    }

    /**
     * Check if user is currently authenticated
     * @returns {boolean} True if authenticated
     */
    isAuthenticated() {
        return this.currentSession &&
            this.currentSession.isAuthenticated &&
            this.isSessionValid(this.currentSession);
    }

    /**
     * Get current user information
     * @returns {Object|null} Current user data or null
     */
    getCurrentUser() {
        if (!this.isAuthenticated()) {
            return null;
        }

        return {
            userId: this.currentSession.userId,
            username: this.currentSession.username,
            loginTime: this.currentSession.loginTime,
            lastActivity: this.currentSession.lastActivity
        };
    }

    /**
     * Validate user credentials
     * @param {string} username - Username to validate
     * @param {string} password - Password to validate
     * @returns {Promise<boolean>} True if credentials are valid
     */
    async validateCredentials(username, password) {
        try {
            // For this implementation, we'll use a simple hardcoded credential
            // In a real application, this would validate against a secure backend
            const validUsername = 'dr.sahboub';
            const validPasswordHash = await this.hashPassword('pneumo2024');
            const inputPasswordHash = await this.hashPassword(password);

            return username.toLowerCase().trim() === validUsername &&
                inputPasswordHash === validPasswordHash;
        } catch (error) {
            console.error('Error validating credentials:', error);
            return false;
        }
    }

    /**
     * Hash password using Web Crypto API
     * @param {string} password - Password to hash
     * @returns {Promise<string>} Hashed password
     */
    async hashPassword(password) {
        try {
            const encoder = new TextEncoder();
            const data = encoder.encode(password + 'pneumo_salt_2024'); // Add salt
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        } catch (error) {
            console.error('Error hashing password:', error);
            // Fallback to simple hash if Web Crypto API is not available
            return this.simpleHash(password);
        }
    }

    /**
     * Simple hash function as fallback
     * @param {string} str - String to hash
     * @returns {string} Hashed string
     */
    simpleHash(str) {
        let hash = 0;
        const salt = 'pneumo_salt_2024';
        const input = str + salt;

        for (let i = 0; i < input.length; i++) {
            const char = input.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }

        return Math.abs(hash).toString(16);
    }

    /**
     * Check if session is valid
     * @param {Session} session - Session to validate
     * @returns {boolean} True if session is valid
     */
    isSessionValid(session) {
        if (!session || !session.isAuthenticated) {
            return false;
        }

        const now = getCurrentTimestamp();
        const sessionAge = now - session.loginTime;
        const inactivityTime = now - session.lastActivity;

        // Check if session has expired
        if (sessionAge > this.sessionTimeout) {
            return false;
        }

        // Check if user has been inactive too long (2 hours)
        if (inactivityTime > (2 * 60 * 60 * 1000)) {
            return false;
        }

        return true;
    }

    /**
     * Check if account is currently locked out
     * @returns {boolean} True if locked out
     */
    isLockedOut() {
        if (!this.lockoutTime) {
            return false;
        }

        const now = getCurrentTimestamp();
        const lockoutElapsed = now - this.lockoutTime;

        if (lockoutElapsed > this.lockoutDuration) {
            // Lockout period has expired
            this.lockoutTime = null;
            this.loginAttempts = 0;
            return false;
        }

        return true;
    }

    /**
     * Get remaining lockout time in minutes
     * @returns {number} Minutes remaining in lockout
     */
    getLockoutTimeRemaining() {
        if (!this.isLockedOut()) {
            return 0;
        }

        const now = getCurrentTimestamp();
        const remaining = this.lockoutDuration - (now - this.lockoutTime);
        return Math.ceil(remaining / (60 * 1000)); // Convert to minutes
    }

    /**
     * Update last activity timestamp
     */
    updateLastActivity() {
        if (this.currentSession) {
            this.currentSession.updateActivity();
            this.saveSession();
        }
    }

    /**
     * Save current session to sessionStorage
     */
    saveSession() {
        try {
            if (this.currentSession) {
                sessionStorage.setItem(
                    AUTH_CONFIG.sessionStorageKey,
                    JSON.stringify(this.currentSession.toJSON())
                );
            }
        } catch (error) {
            console.error('Error saving session:', error);
        }
    }

    /**
     * Clear session from storage
     */
    clearSession() {
        try {
            sessionStorage.removeItem(AUTH_CONFIG.sessionStorageKey);
        } catch (error) {
            console.error('Error clearing session:', error);
        }
    }

    /**
     * Handle session expiration
     */
    handleSessionExpired() {
        log('Session expired, logging out user');
        this.logout();

        // Notify user of session expiration
        if (typeof window !== 'undefined' && window.app) {
            window.app.showSessionExpiredMessage();
        }
    }

    /**
     * Get login attempts information
     * @returns {Object} Login attempts info
     */
    getLoginAttemptsInfo() {
        return {
            attempts: this.loginAttempts,
            maxAttempts: this.maxLoginAttempts,
            isLockedOut: this.isLockedOut(),
            lockoutTimeRemaining: this.getLockoutTimeRemaining()
        };
    }

    /**
     * Force session refresh (extend session time)
     */
    refreshSession() {
        if (this.isAuthenticated()) {
            this.currentSession.loginTime = getCurrentTimestamp();
            this.updateLastActivity();
            log('Session refreshed');
        }
    }

    /**
     * Check if user has unsaved changes before logout
     * @returns {Promise<boolean>} True if safe to logout
     */
    async checkUnsavedChanges() {
        try {
            // Check if change tracker is available
            if (typeof window !== 'undefined' && window.app && window.app.components.changeTracker) {
                return !window.app.components.changeTracker.hasUnsavedChanges();
            }

            // Fallback: check form manager if available
            if (typeof window !== 'undefined' && window.app && window.app.components.formManager) {
                const formManager = window.app.components.formManager;

                // Check all tracked forms for unsaved changes
                for (const formId of Object.keys(formManager.unsavedChanges || {})) {
                    if (formManager.hasUnsavedChanges && formManager.hasUnsavedChanges(formId)) {
                        return false;
                    }
                }
            }

            // If no tracking systems available, assume safe to logout
            return true;
        } catch (error) {
            console.error('Error checking unsaved changes:', error);
            // On error, assume there might be unsaved changes for safety
            return false;
        }
    }

    /**
     * Get details about unsaved changes
     * @returns {Object} Details about unsaved changes
     */
    getUnsavedChangesDetails() {
        try {
            if (typeof window !== 'undefined' && window.app && window.app.components.changeTracker) {
                return window.app.components.changeTracker.getUnsavedChangesDetails();
            }
            return { hasChanges: false, descriptions: [] };
        } catch (error) {
            console.error('Error getting unsaved changes details:', error);
            return { hasChanges: false, descriptions: [] };
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthenticationManager;
}