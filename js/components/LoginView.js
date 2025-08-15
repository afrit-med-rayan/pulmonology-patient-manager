/**
 * Login View Component
 * Handles the login form UI and user interactions
 */

class LoginView {
    constructor(authManager, options = {}) {
        this.authManager = authManager;
        this.loginForm = null;
        this.isSubmitting = false;
        this.returnTo = options.returnTo || null;
        this.returnParams = options.returnParams || null;
        this.onLoginSuccess = options.onLoginSuccess || null;

        // Bind methods
        this.render = this.render.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.showError = this.showError.bind(this);
        this.clearError = this.clearError.bind(this);
    }

    /**
     * Render the login form
     * @returns {string} HTML string for login form
     */
    render() {
        const attemptsInfo = this.authManager.getLoginAttemptsInfo();
        const isLockedOut = attemptsInfo.isLockedOut;
        const lockoutTime = attemptsInfo.lockoutTimeRemaining;

        return `
            <div class="login-container">
                <div class="login-card">
                    <div class="login-header">
                        <div class="login-logo-container">
                            <!-- Logo will be inserted here by LogoManager -->
                        </div>
                        <p class="login-subtitle">Patient Management System</p>
                    </div>
                    
                    <div class="login-body">
                        <form class="login-form" id="loginForm">
                            <div id="loginError" class="login-error" style="display: none;"></div>
                            
                            <div class="form-group">
                                <label for="username" class="form-label">Username</label>
                                <input 
                                    type="text" 
                                    id="username" 
                                    name="username" 
                                    class="form-control" 
                                    required 
                                    autocomplete="username"
                                    ${isLockedOut ? 'disabled' : ''}
                                    placeholder="Enter your username">
                            </div>
                            
                            <div class="form-group">
                                <label for="password" class="form-label">Password</label>
                                <input 
                                    type="password" 
                                    id="password" 
                                    name="password" 
                                    class="form-control" 
                                    required 
                                    autocomplete="current-password"
                                    ${isLockedOut ? 'disabled' : ''}
                                    placeholder="Enter your password">
                            </div>
                            
                            <button 
                                type="submit" 
                                class="btn btn-primary login-btn" 
                                id="loginBtn"
                                ${isLockedOut ? 'disabled' : ''}>
                                ${isLockedOut ? `Locked (${lockoutTime}m remaining)` : 'Sign In'}
                            </button>
                            
                            ${attemptsInfo.attempts > 0 && !isLockedOut ? `
                                <div class="login-attempts">
                                    ${attemptsInfo.maxAttempts - attemptsInfo.attempts} attempt${attemptsInfo.maxAttempts - attemptsInfo.attempts !== 1 ? 's' : ''} remaining
                                </div>
                            ` : ''}
                        </form>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Initialize the login form after rendering
     */
    initialize() {
        this.loginForm = document.getElementById('loginForm');

        if (this.loginForm) {
            this.loginForm.addEventListener('submit', this.handleSubmit);

            // Add input event listeners for real-time validation
            const inputs = this.loginForm.querySelectorAll('input');
            inputs.forEach(input => {
                input.addEventListener('input', this.handleInputChange);
                input.addEventListener('focus', this.clearError);
            });

            // Focus on username field
            const usernameField = document.getElementById('username');
            if (usernameField && !usernameField.disabled) {
                setTimeout(() => usernameField.focus(), 100);
            }

            // Set up lockout timer if needed
            const attemptsInfo = this.authManager.getLoginAttemptsInfo();
            if (attemptsInfo.isLockedOut) {
                this.startLockoutTimer();
            }
        }
    }

    /**
     * Handle form submission
     * @param {Event} event - Form submit event
     */
    async handleSubmit(event) {
        event.preventDefault();

        if (this.isSubmitting) {
            return;
        }

        this.clearError();
        this.isSubmitting = true;

        try {
            const formData = new FormData(this.loginForm);
            const username = formData.get('username').trim();
            const password = formData.get('password');

            // Basic client-side validation
            if (!username || !password) {
                throw new Error('Please enter both username and password');
            }

            // Update button state
            const loginBtn = document.getElementById('loginBtn');
            const originalText = loginBtn.textContent;
            loginBtn.textContent = 'Signing in...';
            loginBtn.disabled = true;

            // Attempt login
            const success = await this.authManager.login(username, password);

            if (success) {
                // Show success message briefly before redirect
                this.showSuccess('Login successful! Redirecting...');

                // Redirect to main application
                setTimeout(() => {
                    if (this.onLoginSuccess) {
                        this.onLoginSuccess(this.returnTo, this.returnParams);
                    } else if (window.app && window.app.handleLoginSuccess) {
                        window.app.handleLoginSuccess(this.returnTo, this.returnParams);
                    } else {
                        window.location.reload();
                    }
                }, 1000);
            }

        } catch (error) {
            this.showError(error.message);

            // Reset button state
            const loginBtn = document.getElementById('loginBtn');
            const attemptsInfo = this.authManager.getLoginAttemptsInfo();

            if (attemptsInfo.isLockedOut) {
                loginBtn.textContent = `Locked (${attemptsInfo.lockoutTimeRemaining}m remaining)`;
                loginBtn.disabled = true;
                this.startLockoutTimer();
            } else {
                loginBtn.textContent = 'Sign In';
                loginBtn.disabled = false;
            }

            // Update attempts display
            this.updateAttemptsDisplay();
        } finally {
            this.isSubmitting = false;
        }
    }

    /**
     * Handle input changes for real-time validation
     * @param {Event} event - Input change event
     */
    handleInputChange(event) {
        const input = event.target;

        // Remove error styling when user starts typing
        if (input.classList.contains('error')) {
            input.classList.remove('error');
        }
    }

    /**
     * Show error message
     * @param {string} message - Error message to display
     */
    showError(message) {
        const errorDiv = document.getElementById('loginError');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';

            // Add error styling to form inputs
            const inputs = this.loginForm.querySelectorAll('input');
            inputs.forEach(input => input.classList.add('error'));
        }
    }

    /**
     * Show success message
     * @param {string} message - Success message to display
     */
    showSuccess(message) {
        const errorDiv = document.getElementById('loginError');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
            errorDiv.style.backgroundColor = '#f0f9ff';
            errorDiv.style.borderColor = '#bfdbfe';
            errorDiv.style.color = '#1e40af';
        }
    }

    /**
     * Clear error message
     */
    clearError() {
        const errorDiv = document.getElementById('loginError');
        if (errorDiv) {
            errorDiv.style.display = 'none';
            errorDiv.textContent = '';
            errorDiv.style.backgroundColor = '';
            errorDiv.style.borderColor = '';
            errorDiv.style.color = '';
        }

        // Remove error styling from inputs
        if (this.loginForm) {
            const inputs = this.loginForm.querySelectorAll('input');
            inputs.forEach(input => input.classList.remove('error'));
        }
    }

    /**
     * Update attempts display
     */
    updateAttemptsDisplay() {
        const attemptsInfo = this.authManager.getLoginAttemptsInfo();
        const container = this.loginForm.querySelector('.login-attempts');

        if (attemptsInfo.attempts > 0 && !attemptsInfo.isLockedOut) {
            const remaining = attemptsInfo.maxAttempts - attemptsInfo.attempts;
            const attemptsHtml = `
                <div class="login-attempts">
                    ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining
                </div>
            `;

            if (container) {
                container.outerHTML = attemptsHtml;
            } else {
                this.loginForm.insertAdjacentHTML('beforeend', attemptsHtml);
            }
        } else if (container) {
            container.remove();
        }
    }

    /**
     * Start lockout timer countdown
     */
    startLockoutTimer() {
        const loginBtn = document.getElementById('loginBtn');
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');

        const timer = setInterval(() => {
            const attemptsInfo = this.authManager.getLoginAttemptsInfo();

            if (!attemptsInfo.isLockedOut) {
                // Lockout period ended
                clearInterval(timer);

                if (loginBtn) {
                    loginBtn.textContent = 'Sign In';
                    loginBtn.disabled = false;
                }

                if (usernameInput) usernameInput.disabled = false;
                if (passwordInput) passwordInput.disabled = false;

                this.updateAttemptsDisplay();
            } else {
                // Update countdown
                if (loginBtn) {
                    loginBtn.textContent = `Locked (${attemptsInfo.lockoutTimeRemaining}m remaining)`;
                }
            }
        }, 1000);
    }

    /**
     * Destroy the login view and clean up event listeners
     */
    destroy() {
        if (this.loginForm) {
            this.loginForm.removeEventListener('submit', this.handleSubmit);

            const inputs = this.loginForm.querySelectorAll('input');
            inputs.forEach(input => {
                input.removeEventListener('input', this.handleInputChange);
                input.removeEventListener('focus', this.clearError);
            });
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LoginView;
}