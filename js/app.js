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
        // Components will be initialized in later tasks
        // This is a placeholder for the component initialization
        console.log('Components initialization placeholder - will be implemented in later tasks');
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
        // Routing will be implemented in later tasks
        console.log('Routing initialization placeholder - will be implemented in later tasks');
    }

    /**
     * Hide loading screen and show main content
     */
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        const mainContent = document.getElementById('main-content');

        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
        }

        if (mainContent) {
            mainContent.classList.remove('hidden');
            // Set initial content - will be replaced by routing in later tasks
            mainContent.innerHTML = `
                <div class="main-container">
                    <div class="content-header">
                        <h1 class="content-title">Patient Management System</h1>
                        <p class="content-subtitle">Dr. S. Sahboub - Pulmonology Practice</p>
                    </div>
                    <div class="card">
                        <div class="card-body text-center">
                            <p>Application initialized successfully.</p>
                            <p class="text-muted">Core functionality will be implemented in subsequent tasks.</p>
                        </div>
                    </div>
                </div>
            `;
        }
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
        app.handleDOMContentLoaded();
    });
} else {
    // DOM is already ready
    app = new App();
    app.handleDOMContentLoaded();
}

// Export for potential use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = App;
}