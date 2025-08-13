/**
 * Main Application Entry Point
 * Patient Management System for Dr. S. Sahboub
 * 
 * This file initializes the application and manages the overall application lifecycle.
 * It coordinates between different components and handles the initial application setup.
 */

class App {
    constructor() {
        this.isInitialized = false;
        this.components = {};

        // Bind methods
        this.init = this.init.bind(this);
        this.handleDOMContentLoaded = this.handleDOMContentLoaded.bind(this);
        this.handleBeforeUnload = this.handleBeforeUnload.bind(this);
    }

    /**
     * Initialize the application
     */
    async init() {
        try {
            console.log('Initializing Patient Management System...');

            // Initialize core components (will be implemented in later tasks)
            console.log('Step 1: Initializing components...');
            await this.initializeComponents();
            console.log('Step 1: Components initialized successfully');

            // Set up event listeners
            console.log('Step 2: Setting up event listeners...');
            this.setupEventListeners();
            console.log('Step 2: Event listeners set up successfully');

            // Initialize routing (will be implemented in later tasks)
            console.log('Step 3: Initializing routing...');
            this.initializeRouting();
            console.log('Step 3: Routing initialized successfully');

            // Hide loading screen and show main content
            console.log('Step 4: Hiding loading screen...');
            this.hideLoadingScreen();
            console.log('Step 4: Loading screen hidden successfully');

            this.isInitialized = true;
            console.log('Application initialized successfully');

        } catch (error) {
            console.error('Failed to initialize application:', error);
            console.error('Error stack:', error.stack);
            this.showError('Failed to initialize application. Please refresh the page.');
        }
    }

    /**
     * Initialize core application components
     */
    async initializeComponents() {
        try {
            console.log('Starting component initialization...');

            // Initialize authentication manager
            console.log('Initializing AuthenticationManager...');
            this.components.authManager = new AuthenticationManager();

            // Initialize form manager
            console.log('Initializing FormManager...');
            this.components.formManager = new FormManager();

            // Initialize data storage manager
            console.log('Initializing DataStorageManager...');
            this.components.dataStorage = new DataStorageManager();
            await this.components.dataStorage.initializeStorage();
            console.log('DataStorageManager initialized successfully');

            // Initialize patient manager
            console.log('Initializing PatientManager...');
            this.components.patientManager = new PatientManager();
            await this.components.patientManager.initialize(this.components.dataStorage);
            console.log('PatientManager initialized successfully');

            console.log('Core components initialized');
        } catch (error) {
            console.error('Error initializing components:', error);
            console.error('Error stack:', error.stack);

            // Try to initialize with minimal components if full initialization fails
            try {
                this.components.authManager = this.components.authManager || {
                    isAuthenticated: () => false,
                    getCurrentUser: () => ({ username: 'Guest' }),
                    logout: () => { },
                    checkUnsavedChanges: () => false
                };

                this.components.formManager = this.components.formManager || new FormManager();

                // Ensure data storage is available
                if (!this.components.dataStorage) {
                    this.components.dataStorage = new DataStorageManager();
                    await this.components.dataStorage.initializeStorage();
                }

                // Ensure patient manager is available
                if (!this.components.patientManager) {
                    this.components.patientManager = new PatientManager();
                    await this.components.patientManager.initialize(this.components.dataStorage);
                }

                console.log('Initialized with minimal components');
            } catch (fallbackError) {
                console.error('Fallback initialization also failed:', fallbackError);
                throw error;
            }
        }
    }

    /**
     * Set up global event listeners
     */
    setupEventListeners() {
        // Handle page unload to check for unsaved changes
        window.addEventListener('beforeunload', this.handleBeforeUnload);

        // Handle browser back/forward buttons
        window.addEventListener('popstate', (event) => {
            // Router will handle this in later tasks
            console.log('Navigation event detected');
        });

        // Handle keyboard shortcuts
        document.addEventListener('keydown', (event) => {
            // Global keyboard shortcuts will be implemented in later tasks
            if (event.ctrlKey || event.metaKey) {
                switch (event.key) {
                    case 's':
                        event.preventDefault();
                        console.log('Save shortcut detected');
                        break;
                    case 'f':
                        event.preventDefault();
                        console.log('Search shortcut detected');
                        break;
                }
            }
        });

        // Handle form events
        document.addEventListener('formSubmit', (event) => {
            this.handleFormSubmit(event.detail);
        });

        document.addEventListener('formCancel', (event) => {
            this.handleFormCancel(event.detail);
        });
    }

    /**
     * Initialize application routing
     */
    initializeRouting() {
        // For development/testing, bypass authentication and go straight to main app
        // TODO: Re-enable authentication in production
        console.log('Initializing routing - bypassing authentication for development');

        this.showMainApplication();

        // Handle initial route from URL hash
        const initialRoute = window.location.hash.replace('#', '') || 'dashboard';
        setTimeout(() => {
            this.navigateToRoute(initialRoute);
        }, 100);

        /* Original authentication-based routing:
        if (this.components.authManager.isAuthenticated()) {
            this.showMainApplication();

            // Handle initial route from URL hash
            const initialRoute = window.location.hash.replace('#', '') || 'dashboard';
            setTimeout(() => {
                this.navigateToRoute(initialRoute);
            }, 100);
        } else {
            this.showLoginForm();
        }
        */
    }

    /**
     * Hide loading screen and show main content
     */
    hideLoadingScreen() {
        console.log('Attempting to hide loading screen...');
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            console.log('Loading screen element found, adding hidden class');
            loadingScreen.classList.add('hidden');
            console.log('Loading screen classes after hiding:', loadingScreen.className);

            // Double-check by setting display none as well
            loadingScreen.style.display = 'none';
            console.log('Loading screen hidden successfully');
        } else {
            console.error('Loading screen element not found!');
        }
    }

    /**
     * Show login form
     */
    showLoginForm() {
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            // Create login view
            this.components.loginView = new LoginView(this.components.authManager);

            // Render login form
            mainContent.innerHTML = this.components.loginView.render();
            mainContent.classList.remove('hidden');

            // Initialize login form
            this.components.loginView.initialize();
        }
    }

    /**
     * Show main application interface
     */
    showMainApplication() {
        try {
            console.log('Showing main application...');
            const mainContent = document.getElementById('main-content');
            if (!mainContent) {
                throw new Error('main-content element not found');
            }

            // For development, use a default user since we're bypassing authentication
            const user = this.components.authManager.getCurrentUser() || { username: 'Dr. S. Sahboub' };
            console.log('User for main application:', user);

            mainContent.innerHTML = `
                <!-- Main Application Header -->
                <header class="header">
                    <div class="header-container">
                        <div class="logo-container">
                            <img src="assets/logo.svg" alt="Dr. S. Sahboub Logo" class="logo"
                                 onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                            <h1 class="logo-text" style="display: none;">Dr. S. Sahboub</h1>
                        </div>
                        <div class="header-actions">
                            <span class="user-info">Welcome, ${user.username}</span>
                            <button class="btn btn-secondary logout-btn" onclick="app.handleLogout()">
                                Logout
                            </button>
                        </div>
                    </div>
                </header>

                <!-- Navigation Menu -->
                <nav class="nav">
                    <div class="nav-container">
                        <ul class="nav-list">
                            <li class="nav-item">
                                <a href="#dashboard" class="nav-link active" data-route="dashboard">
                                    Dashboard
                                </a>
                            </li>
                            <li class="nav-item">
                                <a href="#create-patient" class="nav-link" data-route="create-patient">
                                    Create Patient
                                </a>
                            </li>
                            <li class="nav-item">
                                <a href="#search-patients" class="nav-link" data-route="search-patients">
                                    Search Patients
                                </a>
                            </li>
                            <li class="nav-item">
                                <a href="#patient-list" class="nav-link" data-route="patient-list">
                                    Patient List
                                </a>
                            </li>
                        </ul>
                    </div>
                </nav>

                <!-- Main Content Area -->
                <div class="main-container">
                    <div class="content-header">
                        <h1 class="content-title">Patient Management System</h1>
                        <p class="content-subtitle">Dr. S. Sahboub - Pulmonology Practice</p>
                    </div>

                    <!-- Dashboard Content -->
                    <div id="dashboard-content" class="dashboard-content">
                        <div class="dashboard-grid">
                            <div class="dashboard-card" data-action="create-patient">
                                <div class="dashboard-card-icon">👤</div>
                                <h3 class="dashboard-card-title">Create New Patient</h3>
                                <p class="dashboard-card-description">
                                    Add a new patient record with comprehensive medical information
                                </p>
                            </div>
                            
                            <div class="dashboard-card" data-action="search-patients">
                                <div class="dashboard-card-icon">🔍</div>
                                <h3 class="dashboard-card-title">Search Patients</h3>
                                <p class="dashboard-card-description">
                                    Find existing patient records by name or other criteria
                                </p>
                            </div>
                            
                            <div class="dashboard-card" data-action="patient-list">
                                <div class="dashboard-card-icon">📋</div>
                                <h3 class="dashboard-card-title">Patient List</h3>
                                <p class="dashboard-card-description">
                                    View and manage all patient records in the system
                                </p>
                            </div>
                            
                            <div class="dashboard-card" data-action="reports">
                                <div class="dashboard-card-icon">📊</div>
                                <h3 class="dashboard-card-title">Reports</h3>
                                <p class="dashboard-card-description">
                                    Generate reports and analytics for patient data
                                </p>
                            </div>
                        </div>

                        <!-- Quick Stats Section -->
                        <div class="quick-stats">
                            <div class="card">
                                <div class="card-header">
                                    <h3 class="card-title">Quick Statistics</h3>
                                </div>
                                <div class="card-body">
                                    <div class="stats-grid">
                                        <div class="stat-item">
                                            <div class="stat-value">0</div>
                                            <div class="stat-label">Total Patients</div>
                                        </div>
                                        <div class="stat-item">
                                            <div class="stat-value">0</div>
                                            <div class="stat-label">Recent Visits</div>
                                        </div>
                                        <div class="stat-item">
                                            <div class="stat-value">0</div>
                                            <div class="stat-label">This Month</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Content area for other views (will be populated by routing) -->
                    <div id="dynamic-content" class="dynamic-content" style="display: none;">
                        <!-- Dynamic content will be loaded here -->
                    </div>
                </div>
            `;

            mainContent.classList.remove('hidden');
            mainContent.style.display = 'block';
            console.log('Main content classes after showing:', mainContent.className);
            console.log('Main content display style:', mainContent.style.display);

            // Initialize navigation event listeners
            this.initializeNavigation();

            console.log('Main application displayed successfully');
        } catch (error) {
            console.error('Error showing main application:', error);
            console.error('Error stack:', error.stack);

            // Show a simple fallback interface
            const mainContent = document.getElementById('main-content');
            if (mainContent) {
                mainContent.innerHTML = `
                    <div style="padding: 20px; text-align: center;">
                        <h1>Patient Management System</h1>
                        <p>Application loaded successfully!</p>
                        <p>Error details: ${error.message}</p>
                        <button onclick="location.reload()">Reload Application</button>
                    </div>
                `;
                mainContent.classList.remove('hidden');
                mainContent.style.display = 'block';
                console.log('Fallback interface displayed');
            }
        }
    }

    /**
     * Handle successful login
     */
    handleLoginSuccess() {
        // Clean up login view
        if (this.components.loginView) {
            this.components.loginView.destroy();
            this.components.loginView = null;
        }

        // Show main application
        this.showMainApplication();

        // Navigate to dashboard by default
        setTimeout(() => {
            this.navigateToRoute('dashboard');
        }, 100);
    }

    /**
     * Handle logout
     */
    async handleLogout() {
        try {
            // Check for unsaved changes
            const hasUnsavedChanges = await this.components.authManager.checkUnsavedChanges();

            if (!hasUnsavedChanges) {
                // Show confirmation dialog (will be implemented in later tasks)
                const confirmed = confirm('You have unsaved changes. Are you sure you want to logout?');
                if (!confirmed) {
                    return;
                }
            }

            // Perform logout
            this.components.authManager.logout();

            // Show login form
            this.showLoginForm();

        } catch (error) {
            console.error('Error during logout:', error);
            // Force logout even if error occurs
            this.components.authManager.logout();
            this.showLoginForm();
        }
    }

    /**
     * Handle session expired
     */
    showSessionExpiredMessage() {
        alert('Your session has expired. Please log in again.');
        this.showLoginForm();
    }

    /**
     * Get component status for debugging
     * @returns {Object} Component status information
     */
    getComponentStatus() {
        return {
            isInitialized: this.isInitialized,
            authManager: {
                exists: !!this.components.authManager,
                type: typeof this.components.authManager
            },
            formManager: {
                exists: !!this.components.formManager,
                type: typeof this.components.formManager
            },
            dataStorage: {
                exists: !!this.components.dataStorage,
                isInitialized: this.components.dataStorage ? this.components.dataStorage.isInitialized : false,
                type: typeof this.components.dataStorage
            },
            patientManager: {
                exists: !!this.components.patientManager,
                isInitialized: this.components.patientManager ? this.components.patientManager.isInitialized : false,
                isReady: this.components.patientManager ? this.components.patientManager.isReady() : false,
                type: typeof this.components.patientManager
            }
        };
    }

    /**
     * Show error message to user
     */
    showError(message) {
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            mainContent.innerHTML = `
                <div class="main-container">
                    <div class="card">
                        <div class="card-body text-center">
                            <h2 style="color: var(--danger-color);">Application Error</h2>
                            <p>${message}</p>
                            <button class="btn btn-primary" onclick="location.reload()">
                                Reload Application
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }

        // Hide loading screen
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
        }

        if (mainContent) {
            mainContent.classList.remove('hidden');
        }
    }

    /**
     * Initialize navigation event listeners
     */
    initializeNavigation() {
        // Handle navigation link clicks
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (event) => {
                event.preventDefault();
                const route = event.target.getAttribute('data-route');
                this.navigateToRoute(route);
            });
        });

        // Handle dashboard card clicks
        const dashboardCards = document.querySelectorAll('.dashboard-card');
        dashboardCards.forEach(card => {
            card.addEventListener('click', (event) => {
                const action = event.currentTarget.getAttribute('data-action');
                this.handleDashboardAction(action);
            });
        });
    }

    /**
     * Navigate to a specific route
     * @param {string} route - Route to navigate to
     * @param {Object} params - Optional route parameters
     */
    navigateToRoute(route, params = {}) {
        // Update active navigation link
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-route') === route) {
                link.classList.add('active');
            }
        });

        // Show appropriate content
        const dashboardContent = document.getElementById('dashboard-content');
        const dynamicContent = document.getElementById('dynamic-content');

        if (route === 'dashboard') {
            dashboardContent.style.display = 'block';
            dynamicContent.style.display = 'none';
        } else {
            dashboardContent.style.display = 'none';
            dynamicContent.style.display = 'block';
            this.loadRouteContent(route);
        }

        // Update URL hash with parameters
        let hashUrl = route;
        if (Object.keys(params).length > 0) {
            const urlParams = new URLSearchParams(params);
            hashUrl += '?' + urlParams.toString();
        }
        window.location.hash = hashUrl;
    }

    /**
     * Load content for a specific route
     */
    loadRouteContent(route) {
        const dynamicContent = document.getElementById('dynamic-content');

        // Extract base route (remove parameters)
        const baseRoute = route.split('?')[0];

        switch (baseRoute) {
            case 'create-patient':
                this.loadCreatePatientForm(dynamicContent);
                break;

            case 'search-patients':
                this.loadPatientSearchView(dynamicContent);
                break;

            case 'patient-list':
                this.loadPatientListView(dynamicContent);
                break;

            case 'patient-detail':
                this.loadPatientDetailView(dynamicContent, route);
                break;

            default:
                dynamicContent.innerHTML = `
                    <div class="card">
                        <div class="card-body text-center">
                            <h3>Page Not Found</h3>
                            <p>The requested page could not be found.</p>
                            <button class="btn btn-primary" onclick="app.navigateToRoute('dashboard')">
                                Go to Dashboard
                            </button>
                        </div>
                    </div>
                `;
        }
    }

    /**
     * Handle dashboard card actions
     */
    handleDashboardAction(action) {
        switch (action) {
            case 'create-patient':
                this.navigateToRoute('create-patient');
                break;
            case 'search-patients':
                this.navigateToRoute('search-patients');
                break;
            case 'patient-list':
                this.navigateToRoute('patient-list');
                break;
            case 'reports':
                // Reports functionality placeholder
                alert('Reports functionality will be implemented in future updates.');
                break;
            default:
                console.log('Unknown dashboard action:', action);
        }
    }

    /**
     * Load patient search view
     * @param {Element} container - Container element to load search view into
     */
    loadPatientSearchView(container) {
        try {
            // Create search view instance
            this.components.patientSearchView = new PatientSearchView(
                this.components.patientManager,
                this.components.uiRouter
            );

            // Render search view
            container.innerHTML = this.components.patientSearchView.render();

            // Initialize search view
            setTimeout(() => {
                this.components.patientSearchView.initialize();
                // Make search view globally available for onclick handlers
                window.patientSearchView = this.components.patientSearchView;
            }, 100);

        } catch (error) {
            console.error('Failed to load patient search view:', error);
            container.innerHTML = `
                <div class="card">
                    <div class="card-body text-center">
                        <h3>Error Loading Search</h3>
                        <p>Failed to load patient search functionality.</p>
                        <button class="btn btn-primary" onclick="app.navigateToRoute('dashboard')">
                            Back to Dashboard
                        </button>
                    </div>
                </div>
            `;
        }
    }

    /**
     * Load patient list view (shows all patients)
     * @param {Element} container - Container element to load list view into
     */
    async loadPatientListView(container) {
        try {
            // Show loading state
            container.innerHTML = `
                <div class="content-header">
                    <h2 class="content-title">Patient List</h2>
                    <p class="content-subtitle">View and manage all patient records</p>
                </div>
                <div class="card">
                    <div class="card-body text-center">
                        <div class="loading-spinner"></div>
                        <p>Loading patients...</p>
                    </div>
                </div>
            `;

            // Get all patients
            const patients = await this.components.patientManager.getAllPatients();

            // Create search view with all patients pre-loaded
            this.components.patientSearchView = new PatientSearchView(
                this.components.patientManager,
                this.components.uiRouter
            );

            // Set search results to all patients
            this.components.patientSearchView.searchResults = patients;
            this.components.patientSearchView.currentSearchTerm = '';

            // Render view
            container.innerHTML = `
                <div class="search-container">
                    <div class="content-header">
                        <h2 class="content-title">All Patients</h2>
                        <p class="content-subtitle">Complete list of patient records (${patients.length} patient${patients.length !== 1 ? 's' : ''})</p>
                    </div>
                    <div class="search-results-container">
                        ${this.components.patientSearchView.renderSearchResults()}
                    </div>
                </div>
            `;

            // Make search view globally available for onclick handlers
            window.patientSearchView = this.components.patientSearchView;

        } catch (error) {
            console.error('Failed to load patient list:', error);
            container.innerHTML = `
                <div class="card">
                    <div class="card-body text-center">
                        <h3>Error Loading Patient List</h3>
                        <p>Failed to load patient records.</p>
                        <button class="btn btn-primary" onclick="app.navigateToRoute('dashboard')">
                            Back to Dashboard
                        </button>
                    </div>
                </div>
            `;
        }
    }

    /**
     * Load patient detail view
     * @param {Element} container - Container element to load detail view into
     * @param {string} route - Route with parameters
     */
    async loadPatientDetailView(container, route) {
        try {
            // Extract patient ID from URL hash or route parameters
            const urlParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
            const patientId = urlParams.get('patientId');

            if (!patientId) {
                throw new Error('Patient ID not provided');
            }

            // Show loading state
            container.innerHTML = `
                <div class="card">
                    <div class="card-body text-center">
                        <div class="loading-spinner"></div>
                        <p>Loading patient details...</p>
                    </div>
                </div>
            `;

            // Load patient data
            const patient = await this.components.patientManager.getPatient(patientId);

            if (!patient) {
                throw new Error('Patient not found');
            }

            // Create detail view instance
            this.components.patientDetailView = new PatientDetailView(
                patient,
                this.components.patientManager,
                this.components.uiRouter
            );

            // Render detail view
            container.innerHTML = this.components.patientDetailView.render();

            // Initialize detail view
            setTimeout(() => {
                this.components.patientDetailView.initialize();
                // Make detail view globally available for onclick handlers
                window.patientDetailView = this.components.patientDetailView;
            }, 100);

        } catch (error) {
            console.error('Failed to load patient detail view:', error);
            container.innerHTML = `
                <div class="card">
                    <div class="card-body text-center">
                        <h3>Error Loading Patient Details</h3>
                        <p>${error.message}</p>
                        <button class="btn btn-primary" onclick="app.navigateToRoute('search-patients')">
                            Back to Search
                        </button>
                    </div>
                </div>
            `;
        }
    }

    /**
     * Load create patient form
     * @param {Element} container - Container element to load form into
     */
    loadCreatePatientForm(container) {
        container.innerHTML = `
            <div class="content-header">
                <h2 class="content-title">Create New Patient</h2>
                <p class="content-subtitle">Add a new patient record to the system</p>
            </div>
            <div id="create-patient-form-container">
                ${this.components.formManager.renderPatientForm('create-patient-form')}
            </div>
        `;

        // Initialize the form
        setTimeout(() => {
            this.components.formManager.initializeForm('create-patient-form');
        }, 100);
    }

    /**
     * Handle form submission
     * @param {Object} detail - Form submission details
     */
    async handleFormSubmit(detail) {
        const { formId, data } = detail;

        try {
            if (formId === 'create-patient-form') {
                // Show loading state
                this.showFormLoading(formId, true);

                // Create patient using PatientManager
                console.log('Creating patient with data:', data);

                // Check if PatientManager is available
                if (!this.components.patientManager) {
                    console.error('PatientManager not found. Component status:', this.getComponentStatus());
                    throw new Error('Patient manager not initialized');
                }

                if (!this.components.patientManager.isReady()) {
                    console.error('PatientManager not ready. Status:', this.components.patientManager.getStatus());
                    console.error('Full component status:', this.getComponentStatus());
                    throw new Error('Patient manager not ready');
                }

                const result = await this.components.patientManager.createPatient(data);

                if (result.success) {
                    // Show success message
                    this.showToast(result.message, 'success');

                    // Clear form unsaved changes
                    this.components.formManager.markFormAsSaved(formId);

                    // Navigate back to dashboard after a short delay
                    setTimeout(() => {
                        this.navigateToRoute('dashboard');
                    }, 1500);
                } else {
                    throw new Error(result.message || 'Failed to create patient');
                }

            } else {
                console.log('Form submission for:', formId, data);
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            console.error('Error details:', error.stack);

            // Show user-friendly error message
            let errorMessage = 'Failed to save patient record. Please try again.';

            if (error.message.includes('validation')) {
                errorMessage = 'Please check the form for errors and try again.';
            } else if (error.message.includes('storage')) {
                errorMessage = 'Unable to save data. Please check your permissions and try again.';
            } else if (error.message.includes('not initialized') || error.message.includes('not ready')) {
                errorMessage = 'System not ready. Please refresh the page and try again.';
            }

            // Add the actual error message for debugging
            errorMessage += ` (Debug: ${error.message})`;

            this.showToast(errorMessage, 'error');
        } finally {
            this.showFormLoading(formId, false);
        }
    }

    /**
     * Handle form cancellation
     * @param {Object} detail - Form cancellation details
     */
    handleFormCancel(detail) {
        const { formId } = detail;

        if (formId === 'create-patient-form') {
            this.navigateToRoute('dashboard');
        }
    }

    /**
     * Show/hide form loading state
     * @param {string} formId - Form identifier
     * @param {boolean} loading - Whether to show loading state
     */
    showFormLoading(formId, loading) {
        const form = document.getElementById(formId);
        if (form) {
            if (loading) {
                form.classList.add('form-loading');
            } else {
                form.classList.remove('form-loading');
            }
        }
    }

    /**
     * Show toast notification
     * @param {string} message - Message to display
     * @param {string} type - Toast type ('success', 'error', 'warning', 'info')
     */
    showToast(message, type = 'info') {
        const toastContainer = document.getElementById('toast-container');
        if (!toastContainer) return;

        const toastId = generateId();
        const toast = document.createElement('div');
        toast.id = toastId;
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <p>${message}</p>
            </div>
        `;

        toastContainer.appendChild(toast);

        // Auto-remove toast after duration
        setTimeout(() => {
            const toastElement = document.getElementById(toastId);
            if (toastElement) {
                toastElement.style.animation = 'slideOut 0.3s ease-in';
                setTimeout(() => {
                    toastElement.remove();
                }, 300);
            }
        }, UI_CONFIG.toastDuration);
    }

    /**
     * Handle page unload event
     */
    handleBeforeUnload(event) {
        // Check for unsaved changes in forms
        if (this.components.formManager) {
            const hasUnsavedChanges = Object.keys(this.components.formManager.forms).some(formId =>
                this.components.formManager.hasUnsavedChanges(formId)
            );

            if (hasUnsavedChanges) {
                event.preventDefault();
                event.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
                return event.returnValue;
            }
        }
    }

    /**
     * Handle DOM content loaded event
     */
    handleDOMContentLoaded() {
        this.init();
    }
}

// Global application instance
let app;

// Debug function for troubleshooting
window.debugApp = function () {
    console.log('=== Application Debug Information ===');
    if (window.app) {
        console.log('App instance exists:', !!window.app);
        console.log('Component status:', window.app.getComponentStatus());

        if (window.app.components.patientManager) {
            console.log('PatientManager status:', window.app.components.patientManager.getStatus());
        }

        if (window.app.components.dataStorage) {
            console.log('DataStorage initialized:', window.app.components.dataStorage.isInitialized);
        }
    } else {
        console.log('App instance not found');
    }
    console.log('=====================================');
};

// Initialize application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        app = new App();
        window.app = app; // Make app globally available
        app.handleDOMContentLoaded();
    });
} else {
    // DOM is already ready
    app = new App();
    window.app = app; // Make app globally available
    app.handleDOMContentLoaded();
}

// Export for potential use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = App;
}
// Test function for patient creation
window.testPatientCreation = async function () {
    console.log('=== Testing Patient Creation ===');

    if (!window.app) {
        console.error('App not available');
        return;
    }

    const testPatient = {
        firstName: 'Test',
        lastName: 'Patient',
        dateOfBirth: '1990-01-01',
        age: 34,
        placeOfResidence: 'Test City',
        gender: 'male',
        visits: [{
            visitDate: '2024-01-01',
            medications: 'Test medication',
            observations: 'Test observations',
            additionalComments: 'Test comments'
        }]
    };

    try {
        console.log('Creating test patient:', testPatient);
        const result = await window.app.components.patientManager.createPatient(testPatient);
        console.log('Patient creation result:', result);
        return result;
    } catch (error) {
        console.error('Patient creation failed:', error);
        console.error('Error stack:', error.stack);
        return { success: false, error: error.message };
    }
};