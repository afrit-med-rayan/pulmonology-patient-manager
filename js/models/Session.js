/**
 * Session Data Model
 * Represents user session data and state
 */

class Session {
    constructor(data = {}) {
        this.userId = data.userId || '';
        this.username = data.username || '';
        this.loginTime = data.loginTime || getCurrentTimestamp();
        this.lastActivity = data.lastActivity || getCurrentTimestamp();
        this.isAuthenticated = data.isAuthenticated || false;
    }

    /**
     * Check if session is valid based on basic criteria
     * @returns {boolean} True if session appears valid
     */
    isValid() {
        return this.isAuthenticated &&
            this.userId &&
            this.username &&
            this.loginTime &&
            this.lastActivity;
    }

    /**
     * Update the last activity timestamp
     */
    updateActivity() {
        this.lastActivity = getCurrentTimestamp();
    }

    /**
     * Get session duration in milliseconds
     * @returns {number} Session duration
     */
    getSessionDuration() {
        return getCurrentTimestamp() - this.loginTime;
    }

    /**
     * Get time since last activity in milliseconds
     * @returns {number} Time since last activity
     */
    getInactivityTime() {
        return getCurrentTimestamp() - this.lastActivity;
    }

    /**
     * Get formatted session duration
     * @returns {string} Formatted duration string
     */
    getFormattedSessionDuration() {
        const duration = this.getSessionDuration();
        const hours = Math.floor(duration / (1000 * 60 * 60));
        const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));

        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        } else {
            return `${minutes}m`;
        }
    }

    /**
     * Get formatted last activity time
     * @returns {string} Formatted last activity string
     */
    getFormattedLastActivity() {
        const inactivity = this.getInactivityTime();
        const minutes = Math.floor(inactivity / (1000 * 60));

        if (minutes < 1) {
            return 'Just now';
        } else if (minutes < 60) {
            return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        } else {
            const hours = Math.floor(minutes / 60);
            return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        }
    }

    /**
     * Convert session to JSON for storage
     * @returns {Object} JSON representation of session
     */
    toJSON() {
        return {
            userId: this.userId,
            username: this.username,
            loginTime: this.loginTime,
            lastActivity: this.lastActivity,
            isAuthenticated: this.isAuthenticated
        };
    }

    /**
     * Create session from JSON data
     * @param {Object} json - JSON data
     * @returns {Session} New session instance
     */
    static fromJSON(json) {
        return new Session(json);
    }

    /**
     * Clone the session
     * @returns {Session} Cloned session
     */
    clone() {
        return new Session(this.toJSON());
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Session;
}