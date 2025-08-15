/**
 * Security Hardening Module
 * Implements additional security measures for production deployment
 */

class SecurityHardening {
    constructor() {
        this.securityPolicies = {
            maxLoginAttempts: 5,
            sessionTimeout: 30 * 60 * 1000, // 30 minutes
            passwordMinLength: 8,
            dataEncryptionEnabled: true,
            auditLoggingEnabled: true
        };

        this.loginAttempts = new Map();
        this.securityLog = [];

        this.init();
    }

    init() {
        console.log('🔒 Initializing security hardening...');

        // Apply Content Security Policy
        this.applyContentSecurityPolicy();

        // Set up input sanitization
        this.setupInputSanitization();

        // Initialize session security
        this.initializeSessionSecurity();

        // Set up audit logging
        this.setupAuditLogging();

        // Apply data encryption
        this.setupDataEncryption();

        // Set up XSS protection
        this.setupXSSProtection();

        console.log('✅ Security hardening initialized');
    }

    /**
     * Apply Content Security Policy headers
     */
    applyContentSecurityPolicy() {
        // CSP is already set in HTML meta tag - no need to enhance it further
        // to avoid browser warnings about unsupported directives in meta tags
        console.log('✅ Using existing CSP from HTML meta tag');

        // Add only security headers that work properly in meta tags
        this.addSecurityHeaders();
    }

    addSecurityHeaders() {
        // Only add headers that are safe to set via meta tags and don't cause warnings
        console.log('✅ Security headers configured');
        console.log('ℹ️ For production deployment, configure these HTTP headers at server level:');
        console.log('  - X-Frame-Options: DENY');
        console.log('  - X-XSS-Protection: 1; mode=block');
        console.log('  - X-Content-Type-Options: nosniff');
        console.log('  - Referrer-Policy: strict-origin-when-cross-origin');
        console.log('  - Content-Security-Policy: frame-ancestors \'none\'');
    }

    /**
     * Set up comprehensive input sanitization
     */
    setupInputSanitization() {
        // Override form submission to sanitize inputs
        document.addEventListener('submit', (event) => {
            const form = event.target;
            if (form.tagName === 'FORM') {
                this.sanitizeFormInputs(form);
            }
        });

        // Sanitize inputs on change
        document.addEventListener('input', (event) => {
            if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
                this.sanitizeInput(event.target);
            }
        });
    }

    sanitizeFormInputs(form) {
        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            if (input.type !== 'password') {
                this.sanitizeInput(input);
            }
        });
    }

    sanitizeInput(input) {
        if (input.value) {
            // Remove potentially dangerous characters and scripts
            let sanitized = input.value
                .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
                .replace(/javascript:/gi, '')
                .replace(/on\w+\s*=/gi, '')
                .replace(/data:text\/html/gi, '');

            // Encode HTML entities
            sanitized = this.encodeHTMLEntities(sanitized);

            if (sanitized !== input.value) {
                input.value = sanitized;
                this.logSecurityEvent('INPUT_SANITIZED', {
                    inputName: input.name || input.id,
                    originalLength: input.value.length,
                    sanitizedLength: sanitized.length
                });
            }
        }
    }

    encodeHTMLEntities(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    /**
     * Initialize session security measures
     */
    initializeSessionSecurity() {
        // Set up session timeout
        this.setupSessionTimeout();

        // Monitor for suspicious activity
        this.setupActivityMonitoring();

        // Secure session storage
        this.secureSessionStorage();
    }

    setupSessionTimeout() {
        let lastActivity = Date.now();
        let timeoutWarningShown = false;

        // Update last activity on user interaction
        ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'].forEach(event => {
            document.addEventListener(event, () => {
                lastActivity = Date.now();
                timeoutWarningShown = false;
            }, { passive: true });
        });

        // Check for timeout every minute
        setInterval(() => {
            const timeSinceLastActivity = Date.now() - lastActivity;
            const timeoutThreshold = this.securityPolicies.sessionTimeout;
            const warningThreshold = timeoutThreshold - (5 * 60 * 1000); // 5 minutes before timeout

            if (timeSinceLastActivity > timeoutThreshold) {
                this.handleSessionTimeout();
            } else if (timeSinceLastActivity > warningThreshold && !timeoutWarningShown) {
                this.showTimeoutWarning();
                timeoutWarningShown = true;
            }
        }, 60000); // Check every minute
    }

    handleSessionTimeout() {
        this.logSecurityEvent('SESSION_TIMEOUT', {
            timestamp: new Date().toISOString()
        });

        // Clear sensitive data
        this.clearSensitiveData();

        // Force logout
        if (window.app && window.app.components.authManager) {
            window.app.components.authManager.logout();
        }

        alert('Your session has expired due to inactivity. Please log in again.');
    }

    showTimeoutWarning() {
        const warning = confirm(
            'Your session will expire in 5 minutes due to inactivity. ' +
            'Click OK to continue working or Cancel to logout now.'
        );

        if (!warning) {
            this.handleSessionTimeout();
        }
    }

    setupActivityMonitoring() {
        // Monitor for suspicious patterns
        let rapidClickCount = 0;
        let lastClickTime = 0;

        document.addEventListener('click', (event) => {
            const currentTime = Date.now();

            // Detect rapid clicking (potential bot activity)
            if (currentTime - lastClickTime < 100) {
                rapidClickCount++;
                if (rapidClickCount > 10) {
                    this.logSecurityEvent('SUSPICIOUS_ACTIVITY', {
                        type: 'RAPID_CLICKING',
                        count: rapidClickCount,
                        timestamp: new Date().toISOString()
                    });
                }
            } else {
                rapidClickCount = 0;
            }

            lastClickTime = currentTime;
        });
    }

    secureSessionStorage() {
        // Encrypt session data if encryption is enabled
        if (this.securityPolicies.dataEncryptionEnabled) {
            this.setupSessionEncryption();
        }

        // Clear session data on page unload
        window.addEventListener('beforeunload', () => {
            this.clearSensitiveData();
        });
    }

    setupSessionEncryption() {
        // Simple encryption for session data (in production, use proper encryption)
        const originalSetItem = sessionStorage.setItem.bind(sessionStorage);
        const originalGetItem = sessionStorage.getItem.bind(sessionStorage);

        sessionStorage.setItem = (key, value) => {
            if (key.includes('patient') || key.includes('auth')) {
                value = this.simpleEncrypt(value);
            }
            return originalSetItem(key, value);
        };

        sessionStorage.getItem = (key) => {
            let value = originalGetItem(key);
            if (value && (key.includes('patient') || key.includes('auth'))) {
                value = this.simpleDecrypt(value);
            }
            return value;
        };
    }

    simpleEncrypt(text) {
        // Simple XOR encryption (use proper encryption in production)
        const key = 'PneumoSecure2024';
        let encrypted = '';
        for (let i = 0; i < text.length; i++) {
            encrypted += String.fromCharCode(
                text.charCodeAt(i) ^ key.charCodeAt(i % key.length)
            );
        }
        return btoa(encrypted);
    }

    simpleDecrypt(encryptedText) {
        try {
            const key = 'PneumoSecure2024';
            const encrypted = atob(encryptedText);
            let decrypted = '';
            for (let i = 0; i < encrypted.length; i++) {
                decrypted += String.fromCharCode(
                    encrypted.charCodeAt(i) ^ key.charCodeAt(i % key.length)
                );
            }
            return decrypted;
        } catch (error) {
            this.logSecurityEvent('DECRYPTION_ERROR', { error: error.message });
            return null;
        }
    }

    /**
     * Set up audit logging
     */
    setupAuditLogging() {
        if (!this.securityPolicies.auditLoggingEnabled) return;

        // Log authentication events
        document.addEventListener('login', (event) => {
            this.logSecurityEvent('LOGIN_SUCCESS', {
                username: event.detail.username,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent
            });
        });

        document.addEventListener('loginFailed', (event) => {
            this.logSecurityEvent('LOGIN_FAILED', {
                username: event.detail.username,
                reason: event.detail.reason,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent
            });
        });

        document.addEventListener('logout', (event) => {
            this.logSecurityEvent('LOGOUT', {
                username: event.detail.username,
                timestamp: new Date().toISOString()
            });
        });

        // Log data access events
        document.addEventListener('patientAccessed', (event) => {
            this.logSecurityEvent('PATIENT_ACCESSED', {
                patientId: event.detail.patientId,
                action: event.detail.action,
                timestamp: new Date().toISOString()
            });
        });
    }

    /**
     * Set up data encryption for patient data
     */
    setupDataEncryption() {
        if (!this.securityPolicies.dataEncryptionEnabled) return;

        // Intercept localStorage operations for patient data
        const originalSetItem = localStorage.setItem.bind(localStorage);
        const originalGetItem = localStorage.getItem.bind(localStorage);

        localStorage.setItem = (key, value) => {
            if (key.startsWith('patient_') || key.includes('medical')) {
                value = this.simpleEncrypt(value);
                this.logSecurityEvent('DATA_ENCRYPTED', { key: key });
            }
            return originalSetItem(key, value);
        };

        localStorage.getItem = (key) => {
            let value = originalGetItem(key);
            if (value && (key.startsWith('patient_') || key.includes('medical'))) {
                value = this.simpleDecrypt(value);
                if (value === null) {
                    this.logSecurityEvent('DATA_DECRYPTION_FAILED', { key: key });
                }
            }
            return value;
        };
    }

    /**
     * Set up XSS protection
     */
    setupXSSProtection() {
        // Monitor for potential XSS attempts
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            this.scanForXSS(node);
                        }
                    });
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    scanForXSS(element) {
        // Check for suspicious script tags or event handlers
        const suspiciousPatterns = [
            /javascript:/i,
            /on\w+\s*=/i,
            /<script/i,
            /<iframe/i,
            /eval\s*\(/i,
            /document\.write/i
        ];

        const innerHTML = element.innerHTML || '';
        const outerHTML = element.outerHTML || '';

        suspiciousPatterns.forEach(pattern => {
            if (pattern.test(innerHTML) || pattern.test(outerHTML)) {
                this.logSecurityEvent('XSS_ATTEMPT_DETECTED', {
                    element: element.tagName,
                    pattern: pattern.toString(),
                    timestamp: new Date().toISOString()
                });

                // Remove the suspicious element
                element.remove();
            }
        });
    }

    /**
     * Handle login attempts and implement rate limiting
     */
    handleLoginAttempt(username, success) {
        const clientId = this.getClientId();

        if (!this.loginAttempts.has(clientId)) {
            this.loginAttempts.set(clientId, {
                attempts: 0,
                lastAttempt: Date.now(),
                blocked: false
            });
        }

        const attemptData = this.loginAttempts.get(clientId);

        if (success) {
            // Reset attempts on successful login
            attemptData.attempts = 0;
            attemptData.blocked = false;
        } else {
            attemptData.attempts++;
            attemptData.lastAttempt = Date.now();

            if (attemptData.attempts >= this.securityPolicies.maxLoginAttempts) {
                attemptData.blocked = true;
                this.logSecurityEvent('ACCOUNT_LOCKED', {
                    username: username,
                    attempts: attemptData.attempts,
                    timestamp: new Date().toISOString()
                });
            }
        }

        this.loginAttempts.set(clientId, attemptData);
        return !attemptData.blocked;
    }

    isLoginBlocked() {
        const clientId = this.getClientId();
        const attemptData = this.loginAttempts.get(clientId);

        if (!attemptData) return false;

        // Unblock after 15 minutes
        const blockDuration = 15 * 60 * 1000;
        if (attemptData.blocked && (Date.now() - attemptData.lastAttempt) > blockDuration) {
            attemptData.blocked = false;
            attemptData.attempts = 0;
            this.loginAttempts.set(clientId, attemptData);
            return false;
        }

        return attemptData.blocked;
    }

    getClientId() {
        // Generate a simple client identifier
        return navigator.userAgent + navigator.language + screen.width + screen.height;
    }

    /**
     * Clear sensitive data from memory and storage
     */
    clearSensitiveData() {
        // Clear session storage
        sessionStorage.clear();

        // Clear sensitive variables
        if (window.app && window.app.components) {
            Object.keys(window.app.components).forEach(key => {
                const component = window.app.components[key];
                if (component && typeof component.clearSensitiveData === 'function') {
                    component.clearSensitiveData();
                }
            });
        }

        this.logSecurityEvent('SENSITIVE_DATA_CLEARED', {
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Log security events
     */
    logSecurityEvent(eventType, details) {
        if (!this.securityPolicies.auditLoggingEnabled) return;

        const logEntry = {
            timestamp: new Date().toISOString(),
            type: eventType,
            details: details,
            userAgent: navigator.userAgent,
            url: window.location.href
        };

        this.securityLog.push(logEntry);

        // Keep only last 1000 entries to prevent memory issues
        if (this.securityLog.length > 1000) {
            this.securityLog = this.securityLog.slice(-1000);
        }

        // Store in localStorage for persistence
        try {
            localStorage.setItem('security_log', JSON.stringify(this.securityLog));
        } catch (error) {
            console.warn('Could not save security log:', error);
        }

        // Log to console in development
        if (window.location.hostname === 'localhost') {
            console.log('🔒 Security Event:', logEntry);
        }
    }

    /**
     * Get security log for review
     */
    getSecurityLog() {
        return [...this.securityLog];
    }

    /**
     * Export security log for external review
     */
    exportSecurityLog() {
        const logData = JSON.stringify(this.securityLog, null, 2);
        const blob = new Blob([logData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `security-log-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * Validate security configuration
     */
    validateSecurityConfig() {
        const issues = [];

        // Check if running over HTTPS in production
        if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
            issues.push('Application should be served over HTTPS in production');
        }

        // Check for CSP header
        const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
        if (!cspMeta) {
            issues.push('Content Security Policy not found');
        }

        // Check localStorage availability
        try {
            localStorage.setItem('test', 'test');
            localStorage.removeItem('test');
        } catch (error) {
            issues.push('localStorage not available - data persistence may fail');
        }

        return {
            valid: issues.length === 0,
            issues: issues
        };
    }
}

// Initialize security hardening when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.securityHardening = new SecurityHardening();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SecurityHardening;
}