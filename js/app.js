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
            await this.initializeComponents();

            // Set up event listeners
            this.setupEventListeners();

            // Initialize routing (will be implemented in later tasks)
            this.initializeRouting();

            // Hide loading screen and show main content
            this.hideLoadingScreen();

            this.isInitialized = true;
            console.log('Application initialized successfully');

        } catch (error) {
            console.error('Failed to initialize application:', error);
            this.showError('Failed to initialize application. Please refresh the page.');
        }
    }

    /**
     * Initialize core application components
     */
    async initializeComponents() {
        try {
            // Initialize authentication manager
            this.components.authManager = new AuthenticationManager();

            // Initialize other components (will be added in later tasks)
            // this.components.patientManager = new PatientManager();
            // this.components.dataStorage = new DataStorageManager();

            console.log('Core components initialized');
        } catch (error) {
            console.error('Error initializing components:', error);
            throw error;
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
    }

    /**
     * Initialize application routing
     */
    initializeRouting() {
        // Check authentication status and show appropriate view
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
    }

    /**
     * Hide loading screen and show main content
     */
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
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
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            const user = this.components.authManager.getCurrentUser();

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

            // Initialize navigation event listeners
            this.initializeNavigation();
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
     */
    navigateToRoute(route) {
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

        // Update URL hash
        window.location.hash = route;
    }

    /**
     * Load content for a specific route
     */
    loadRouteContent(route) {
        const dynamicContent = document.getElementById('dynamic-content');

        switch (route) {
            case 'create-patient':
                dynamicContent.innerHTML = `
                    <div class="content-header">
                        <h2 class="content-title">Create New Patient</h2>
                        <p class="content-subtitle">Add a new patient record to the system</p>
                    </div>
                    <div class="card">
                        <div class="card-body text-center">
                            <p>Patient creation form will be implemented in task 6.</p>
                            <button class="btn btn-secondary" onclick="app.navigateToRoute('dashboard')">
                                Back to Dashboard
                            </button>
                        </div>
                    </div>
                `;
                break;

            case 'search-patients':
                dynamicContent.innerHTML = `
                    <div class="content-header">
                        <h2 class="content-title">Search Patients</h2>
                        <p class="content-subtitle">Find existing patient records</p>
                    </div>
                    <div class="card">
                        <div class="card-body text-center">
                            <p>Patient search functionality will be implemented in task 8.</p>
                            <button class="btn btn-secondary" onclick="app.navigateToRoute('dashboard')">
                                Back to Dashboard
                            </button>
                        </div>
                    </div>
                `;
                break;

            case 'patient-list':
                dynamicContent.innerHTML = `
                    <div class="content-header">
                        <h2 class="content-title">Patient List</h2>
                        <p class="content-subtitle">View and manage all patient records</p>
                    </div>
                    <div class="card">
                        <div class="card-body text-center">
                            <p>Patient list functionality will be implemented in task 8.</p>
                            <button class="btn btn-secondary" onclick="app.navigateToRoute('dashboard')">
                                Back to Dashboard
                            </button>
                        </div>
                    </div>
                `;
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
     * Handle page unload event
     */
    handleBeforeUnload(event) {
        // Check for unsaved changes (will be implemented in later tasks)
        // For now, this is a placeholder
        console.log('Page unload detected');
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