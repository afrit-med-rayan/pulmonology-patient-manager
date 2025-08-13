/**
 * Error Handler Component
 * Provides comprehensive error handling with user-friendly messaging and recovery mechanisms
 */

class ErrorHandler {
    constructor() {
        this.errorLog = [];
        this.maxLogSize = 1000;
        this.toastContainer = null;
        this.loadingStates = new Map();
        this.retryAttempts = new Map();
        this.maxRetries = 3;
        this.retryDelay = 1000; // Base delay in milliseconds

        // Error type configurations
        this.errorTypes = {
            NETWORK: 'network',
            VALIDATION: 'validation',
            STORAGE: 'storage',
            AUTHENTICATION: 'authentication',
            PERMISSION: 'permission',
            NOT_FOUND: 'not_found',
            SERVER: 'server',
            CLIENT: 'client',
            UNKNOWN: 'unknown'
        };

        // Initialize error handler
        this.initialize();

        // Bind methods
        this.handleError = this.handleError.bind(this);
        this.showToast = this.showToast.bind(this);
        this.logError = this.logError.bind(this);
    }

    /**
     * Initialize error handler
     */
    initialize() {
        // Create toast container if it doesn't exist
        this.createToastContainer();

        // Set up global error handlers
        this.setupGlobalErrorHandlers();

        // Set up unhandled promise rejection handler
        this.setupPromiseRejectionHandler();

        console.log('ErrorHandler initialized');
    }

    /**
     * Create toast notification container
     */
    createToastContainer() {
        this.toastContainer = document.getElementById('toast-container');
        if (!this.toastContainer) {
            this.toastContainer = document.createElement('div');
            this.toastContainer.id = 'toast-container';
            this.toastContainer.className = 'toast-container';
            document.body.appendChild(this.toastContainer);
        }
    }

    /**
     * Set up global error handlers
     */
    setupGlobalErrorHandlers() {
        // Handle JavaScript errors
        window.addEventListener('error', (event) => {
            this.handleError({
                type: this.errorTypes.CLIENT,
                message: event.message,
                source: event.filename,
                line: event.lineno,
                column: event.colno,
                error: event.error,
                context: 'Global Error Handler'
            });
        });

        // Handle resource loading errors
        window.addEventListener('error', (event) => {
            if (event.target !== window) {
                this.handleError({
                    type: this.errorTypes.NETWORK,
                    message: `Failed to load resource: ${event.target.src || event.target.href}`,
                    source: event.target.tagName,
                    context: 'Resource Loading',
                    element: event.target
                });
            }
        }, true);
    }

    /**
     * Set up unhandled promise rejection handler
     */
    setupPromiseRejectionHandler() {
        window.addEventListener('unhandledrejection', (event) => {
            this.handleError({
                type: this.errorTypes.CLIENT,
                message: 'Unhandled Promise Rejection',
                error: event.reason,
                context: 'Promise Rejection Handler'
            });

            // Prevent the default browser console error
            event.preventDefault();
        });
    }

    /**
     * Main error handling method
     * @param {Object} errorInfo - Error information object
     */
    handleError(errorInfo) {
        try {
            // Normalize error information
            const normalizedError = this.normalizeError(errorInfo);

            // Log the error
            this.logError(normalizedError);

            // Determine error severity
            const severity = this.determineSeverity(normalizedError);

            // Show appropriate user notification
            this.showUserNotification(normalizedError, severity);

            // Attempt recovery if possible
            this.attemptRecovery(normalizedError);

            // Report to monitoring service (if configured)
            this.reportError(normalizedError);

        } catch (handlerError) {
            console.error('Error in error handler:', handlerError);
            // Fallback to basic error display
            this.showToast('An unexpected error occurred', 'error');
        }
    }

    /**
     * Normalize error information
     * @param {*} errorInfo - Raw error information
     * @returns {Object} Normalized error object
     */
    normalizeError(errorInfo) {
        // Handle different error input types
        if (errorInfo instanceof Error) {
            return {
                type: this.errorTypes.CLIENT,
                message: errorInfo.message,
                stack: errorInfo.stack,
                name: errorInfo.name,
                timestamp: new Date().toISOString(),
                context: 'JavaScript Error'
            };
        }

        if (typeof errorInfo === 'string') {
            return {
                type: this.errorTypes.UNKNOWN,
                message: errorInfo,
                timestamp: new Date().toISOString(),
                context: 'String Error'
            };
        }

        // Handle object-based error info
        return {
            type: errorInfo.type || this.errorTypes.UNKNOWN,
            message: errorInfo.message || 'Unknown error occurred',
            stack: errorInfo.stack || errorInfo.error?.stack,
            source: errorInfo.source,
            line: errorInfo.line,
            column: errorInfo.column,
            context: errorInfo.context || 'Unknown Context',
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            ...errorInfo
        };
    }

    /**
     * Determine error severity
     * @param {Object} error - Normalized error object
     * @returns {string} Severity level
     */
    determineSeverity(error) {
        // Critical errors that break core functionality
        if (error.type === this.errorTypes.AUTHENTICATION ||
            error.type === this.errorTypes.STORAGE ||
            error.message.includes('is not a function') ||
            error.message.includes('Cannot read property')) {
            return 'critical';
        }

        // High severity errors that impact user experience
        if (error.type === this.errorTypes.NETWORK ||
            error.type === this.errorTypes.SERVER ||
            error.type === this.errorTypes.PERMISSION) {
            return 'high';
        }

        // Medium severity errors that are recoverable
        if (error.type === this.errorTypes.VALIDATION ||
            error.type === this.errorTypes.NOT_FOUND) {
            return 'medium';
        }

        // Low severity errors that don't significantly impact functionality
        return 'low';
    }

    /**
     * Show user notification based on error
     * @param {Object} error - Normalized error object
     * @param {string} severity - Error severity
     */
    showUserNotification(error, severity) {
        let message, type, duration;

        switch (severity) {
            case 'critical':
                message = this.getCriticalErrorMessage(error);
                type = 'error';
                duration = 0; // Persistent
                break;

            case 'high':
                message = this.getHighSeverityMessage(error);
                type = 'error';
                duration = 8000;
                break;

            case 'medium':
                message = this.getMediumSeverityMessage(error);
                type = 'warning';
                duration = 5000;
                break;

            case 'low':
                message = this.getLowSeverityMessage(error);
                type = 'info';
                duration = 3000;
                break;

            default:
                message = 'An unexpected error occurred';
                type = 'error';
                duration = 5000;
        }

        this.showToast(message, type, duration);
    }

    /**
     * Get user-friendly message for critical errors
     * @param {Object} error - Error object
     * @returns {string} User-friendly message
     */
    getCriticalErrorMessage(error) {
        switch (error.type) {
            case this.errorTypes.AUTHENTICATION:
                return 'Authentication failed. Please log in again.';
            case this.errorTypes.STORAGE:
                return 'Unable to save data. Please check your storage permissions.';
            default:
                return 'A critical error occurred. Please refresh the page and try again.';
        }
    }

    /**
     * Get user-friendly message for high severity errors
     * @param {Object} error - Error object
     * @returns {string} User-friendly message
     */
    getHighSeverityMessage(error) {
        switch (error.type) {
            case this.errorTypes.NETWORK:
                return 'Network connection failed. Please check your internet connection.';
            case this.errorTypes.SERVER:
                return 'Server error occurred. Please try again in a few moments.';
            case this.errorTypes.PERMISSION:
                return 'Permission denied. You may not have access to this resource.';
            default:
                return 'An error occurred while processing your request.';
        }
    }

    /**
     * Get user-friendly message for medium severity errors
     * @param {Object} error - Error object
     * @returns {string} User-friendly message
     */
    getMediumSeverityMessage(error) {
        switch (error.type) {
            case this.errorTypes.VALIDATION:
                return error.message || 'Please check your input and try again.';
            case this.errorTypes.NOT_FOUND:
                return 'The requested resource was not found.';
            default:
                return 'Please try again or contact support if the problem persists.';
        }
    }

    /**
     * Get user-friendly message for low severity errors
     * @param {Object} error - Error object
     * @returns {string} User-friendly message
     */
    getLowSeverityMessage(error) {
        return error.message || 'A minor issue occurred but has been handled.';
    }

    /**
     * Show toast notification
     * @param {string} message - Message to display
     * @param {string} type - Toast type (success, error, warning, info)
     * @param {number} duration - Duration in milliseconds (0 for persistent)
     */
    showToast(message, type = 'info', duration = 5000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        // Create toast content
        toast.innerHTML = `
            <div class="toast-content">
                <div class="toast-icon">${this.getToastIcon(type)}</div>
                <div class="toast-message">${message}</div>
                <button class="toast-close" aria-label="Close notification">&times;</button>
            </div>
        `;

        // Add close functionality
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => {
            this.removeToast(toast);
        });

        // Add to container
        this.toastContainer.appendChild(toast);

        // Animate in
        setTimeout(() => {
            toast.classList.add('toast-show');
        }, 10);

        // Auto-remove after duration (if not persistent)
        if (duration > 0) {
            setTimeout(() => {
                this.removeToast(toast);
            }, duration);
        }

        // Limit number of toasts
        this.limitToasts();

        return toast;
    }

    /**
     * Get icon for toast type
     * @param {string} type - Toast type
     * @returns {string} Icon HTML
     */
    getToastIcon(type) {
        const icons = {
            success: '✓',
            error: '✗',
            warning: '⚠',
            info: 'ℹ'
        };
        return icons[type] || icons.info;
    }

    /**
     * Remove toast notification
     * @param {HTMLElement} toast - Toast element to remove
     */
    removeToast(toast) {
        if (toast && toast.parentNode) {
            toast.classList.add('toast-hide');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }
    }

    /**
     * Limit number of visible toasts
     */
    limitToasts() {
        const toasts = this.toastContainer.querySelectorAll('.toast');
        const maxToasts = 5;

        if (toasts.length > maxToasts) {
            for (let i = 0; i < toasts.length - maxToasts; i++) {
                this.removeToast(toasts[i]);
            }
        }
    }

    /**
     * Show success message
     * @param {string} message - Success message
     * @param {number} duration - Duration in milliseconds
     */
    showSuccess(message, duration = 4000) {
        return this.showToast(message, 'success', duration);
    }

    /**
     * Show error message
     * @param {string} message - Error message
     * @param {number} duration - Duration in milliseconds
     */
    showError(message, duration = 6000) {
        return this.showToast(message, 'error', duration);
    }

    /**
     * Show warning message
     * @param {string} message - Warning message
     * @param {number} duration - Duration in milliseconds
     */
    showWarning(message, duration = 5000) {
        return this.showToast(message, 'warning', duration);
    }

    /**
     * Show info message
     * @param {string} message - Info message
     * @param {number} duration - Duration in milliseconds
     */
    showInfo(message, duration = 4000) {
        return this.showToast(message, 'info', duration);
    }

    /**
     * Show loading state
     * @param {string} message - Loading message
     * @param {string} key - Unique key for this loading state
     * @returns {Object} Loading state object
     */
    showLoading(message = 'Loading...', key = 'default') {
        // Remove existing loading state with same key
        this.hideLoading(key);

        const loadingToast = this.showToast(
            `<div class="loading-spinner-small"></div> ${message}`,
            'info',
            0 // Persistent
        );

        loadingToast.classList.add('toast-loading');

        const loadingState = {
            toast: loadingToast,
            key: key,
            startTime: Date.now()
        };

        this.loadingStates.set(key, loadingState);
        return loadingState;
    }

    /**
     * Hide loading state
     * @param {string} key - Loading state key
     */
    hideLoading(key = 'default') {
        const loadingState = this.loadingStates.get(key);
        if (loadingState) {
            this.removeToast(loadingState.toast);
            this.loadingStates.delete(key);
        }
    }

    /**
     * Attempt error recovery
     * @param {Object} error - Error object
     */
    attemptRecovery(error) {
        const recoveryKey = `${error.type}_${error.context}`;
        const attempts = this.retryAttempts.get(recoveryKey) || 0;

        if (attempts >= this.maxRetries) {
            console.warn(`Max retry attempts reached for ${recoveryKey}`);
            return;
        }

        switch (error.type) {
            case this.errorTypes.NETWORK:
                this.attemptNetworkRecovery(error, recoveryKey, attempts);
                break;

            case this.errorTypes.STORAGE:
                this.attemptStorageRecovery(error, recoveryKey, attempts);
                break;

            case this.errorTypes.AUTHENTICATION:
                this.attemptAuthRecovery(error, recoveryKey, attempts);
                break;

            default:
                // No automatic recovery for other error types
                break;
        }
    }

    /**
     * Attempt network error recovery
     * @param {Object} error - Error object
     * @param {string} recoveryKey - Recovery key
     * @param {number} attempts - Current attempt count
     */
    attemptNetworkRecovery(error, recoveryKey, attempts) {
        const delay = this.retryDelay * Math.pow(2, attempts); // Exponential backoff

        setTimeout(() => {
            this.retryAttempts.set(recoveryKey, attempts + 1);

            // Attempt to retry the failed operation
            if (error.retryCallback && typeof error.retryCallback === 'function') {
                error.retryCallback();
            }
        }, delay);
    }

    /**
     * Attempt storage error recovery
     * @param {Object} error - Error object
     * @param {string} recoveryKey - Recovery key
     * @param {number} attempts - Current attempt count
     */
    attemptStorageRecovery(error, recoveryKey, attempts) {
        // Try to clear some storage space or use alternative storage
        try {
            // Clear old data if possible
            if (typeof window !== 'undefined' && window.app && window.app.components.dataStorage) {
                window.app.components.dataStorage.clearOldData();
            }

            this.showInfo('Attempting to free up storage space...');
        } catch (recoveryError) {
            console.error('Storage recovery failed:', recoveryError);
        }
    }

    /**
     * Attempt authentication error recovery
     * @param {Object} error - Error object
     * @param {string} recoveryKey - Recovery key
     * @param {number} attempts - Current attempt count
     */
    attemptAuthRecovery(error, recoveryKey, attempts) {
        // Redirect to login or refresh session
        if (typeof window !== 'undefined' && window.app && window.app.showLoginForm) {
            setTimeout(() => {
                window.app.showLoginForm();
            }, 2000);
        }
    }

    /**
     * Log error for debugging
     * @param {Object} error - Error object
     */
    logError(error) {
        // Add to error log
        this.errorLog.push(error);

        // Maintain log size limit
        if (this.errorLog.length > this.maxLogSize) {
            this.errorLog.shift();
        }

        // Console logging with appropriate level
        const severity = this.determineSeverity(error);
        switch (severity) {
            case 'critical':
                console.error('CRITICAL ERROR:', error);
                break;
            case 'high':
                console.error('HIGH SEVERITY ERROR:', error);
                break;
            case 'medium':
                console.warn('MEDIUM SEVERITY ERROR:', error);
                break;
            case 'low':
                console.info('LOW SEVERITY ERROR:', error);
                break;
            default:
                console.log('ERROR:', error);
        }
    }

    /**
     * Report error to monitoring service
     * @param {Object} error - Error object
     */
    reportError(error) {
        // This would integrate with external error reporting services
        // For now, just store locally
        try {
            const errorReport = {
                ...error,
                sessionId: this.getSessionId(),
                userId: this.getUserId(),
                buildVersion: this.getBuildVersion()
            };

            // Store in localStorage for later transmission
            const reports = JSON.parse(localStorage.getItem('errorReports') || '[]');
            reports.push(errorReport);

            // Keep only recent reports
            const maxReports = 100;
            if (reports.length > maxReports) {
                reports.splice(0, reports.length - maxReports);
            }

            localStorage.setItem('errorReports', JSON.stringify(reports));
        } catch (reportError) {
            console.error('Failed to report error:', reportError);
        }
    }

    /**
     * Get session ID for error reporting
     * @returns {string} Session ID
     */
    getSessionId() {
        return sessionStorage.getItem('sessionId') || 'unknown';
    }

    /**
     * Get user ID for error reporting
     * @returns {string} User ID
     */
    getUserId() {
        try {
            if (typeof window !== 'undefined' && window.app && window.app.components.authManager) {
                const user = window.app.components.authManager.getCurrentUser();
                return user?.userId || 'anonymous';
            }
        } catch (error) {
            // Ignore errors getting user ID
        }
        return 'anonymous';
    }

    /**
     * Get build version for error reporting
     * @returns {string} Build version
     */
    getBuildVersion() {
        return '1.0.0'; // This would be set during build process
    }

    /**
     * Get error log
     * @returns {Array} Array of logged errors
     */
    getErrorLog() {
        return [...this.errorLog];
    }

    /**
     * Clear error log
     */
    clearErrorLog() {
        this.errorLog = [];
        console.log('Error log cleared');
    }

    /**
     * Get error statistics
     * @returns {Object} Error statistics
     */
    getErrorStats() {
        const stats = {
            total: this.errorLog.length,
            byType: {},
            bySeverity: {},
            recent: 0 // Last hour
        };

        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

        this.errorLog.forEach(error => {
            // Count by type
            stats.byType[error.type] = (stats.byType[error.type] || 0) + 1;

            // Count by severity
            const severity = this.determineSeverity(error);
            stats.bySeverity[severity] = (stats.bySeverity[severity] || 0) + 1;

            // Count recent errors
            if (error.timestamp > oneHourAgo) {
                stats.recent++;
            }
        });

        return stats;
    }

    /**
     * Clear all toasts
     */
    clearAllToasts() {
        const toasts = this.toastContainer.querySelectorAll('.toast');
        toasts.forEach(toast => this.removeToast(toast));
    }

    /**
     * Destroy error handler
     */
    destroy() {
        // Clear all toasts
        this.clearAllToasts();

        // Clear loading states
        this.loadingStates.clear();

        // Clear retry attempts
        this.retryAttempts.clear();

        // Remove toast container
        if (this.toastContainer && this.toastContainer.parentNode) {
            this.toastContainer.parentNode.removeChild(this.toastContainer);
        }

        console.log('ErrorHandler destroyed');
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ErrorHandler;
}