/**
 * UI Router Component
 * Manages single-page application navigation with hash-based routing
 * 
 * Features:
 * - Hash-based routing for SPA navigation
 * - Route parameter support
 * - Navigation state management
 * - Browser back/forward button support
 * - Unsaved changes detection during navigation
 * - Smooth transitions between views
 */

class UIRouter {
    constructor() {
        this.routes = new Map();
        this.currentRoute = null;
        this.currentParams = {};
        this.navigationHistory = [];
        this.maxHistorySize = 50;

        // Bind methods
        this.handleHashChange = this.handleHashChange.bind(this);
        this.handlePopState = this.handlePopState.bind(this);

        // Initialize router
        this.initialize();
    }

    /**
     * Initialize the router
     */
    initialize() {
        // Listen for hash changes
        window.addEventListener('hashchange', this.handleHashChange);

        // Listen for browser back/forward
        window.addEventListener('popstate', this.handlePopState);

        console.log('UIRouter initialized');
    }

    /**
     * Register a route with its handler
     * @param {string} path - Route path (e.g., 'dashboard', 'patient-detail')
     * @param {Function} handler - Route handler function
     * @param {Object} options - Route options
     */
    registerRoute(path, handler, options = {}) {
        this.routes.set(path, {
            handler,
            requiresAuth: options.requiresAuth !== false, // Default to true
            title: options.title || path,
            beforeEnter: options.beforeEnter,
            beforeLeave: options.beforeLeave
        });

        console.log(`Route registered: ${path}`);
    }

    /**
     * Navigate to a specific route
     * @param {string} route - Route to navigate to
     * @param {Object} params - Route parameters
     * @param {Object} options - Navigation options
     */
    async navigateTo(route, params = {}, options = {}) {
        try {
            console.log(`Navigating to: ${route}`, params);

            // Check if we can leave current route
            if (this.currentRoute && !options.force) {
                const canLeave = await this.checkCanLeaveCurrentRoute();
                if (!canLeave) {
                    console.log('Navigation cancelled by user');
                    return false;
                }
            }

            // Get route configuration
            const routeConfig = this.routes.get(route);
            if (!routeConfig) {
                console.error(`Route not found: ${route}`);
                this.navigateTo('not-found', { originalRoute: route });
                return false;
            }

            // Check authentication if required
            if (routeConfig.requiresAuth && !this.isAuthenticated()) {
                console.log('Authentication required, redirecting to login');
                this.navigateTo('login', { returnTo: route, returnParams: params });
                return false;
            }

            // Execute beforeEnter hook
            if (routeConfig.beforeEnter) {
                const canEnter = await routeConfig.beforeEnter(route, params);
                if (!canEnter) {
                    console.log('Navigation blocked by beforeEnter hook');
                    return false;
                }
            }

            // Update navigation history
            this.addToHistory(this.currentRoute, this.currentParams);

            // Store previous route for transitions
            const previousRoute = this.currentRoute;

            // Update current route
            this.currentRoute = route;
            this.currentParams = { ...params };

            // Update URL hash
            this.updateUrlHash(route, params);

            // Update navigation UI
            this.updateNavigationUI(route);

            // Execute route handler with transition
            await this.executeRouteHandler(routeConfig, route, params, previousRoute);

            // Update page title
            this.updatePageTitle(routeConfig.title, params);

            console.log(`Navigation completed: ${route}`);
            return true;

        } catch (error) {
            console.error('Navigation error:', error);
            this.handleNavigationError(error, route, params);
            return false;
        }
    }

    /**
     * Get current route information
     * @returns {Object} Current route information
     */
    getCurrentRoute() {
        return {
            route: this.currentRoute,
            params: { ...this.currentParams },
            fullPath: this.getFullPath()
        };
    }

    /**
     * Go back in navigation history
     */
    goBack() {
        if (this.navigationHistory.length > 0) {
            const previous = this.navigationHistory.pop();
            this.navigateTo(previous.route, previous.params, { skipHistory: true });
        } else {
            // Fallback to dashboard
            this.navigateTo('dashboard');
        }
    }

    /**
     * Check if user can leave current route (unsaved changes detection)
     * @returns {Promise<boolean>} Whether navigation can proceed
     */
    async checkCanLeaveCurrentRoute() {
        // Check for unsaved changes
        const hasUnsavedChanges = await this.checkUnsavedChanges();

        if (!hasUnsavedChanges) {
            return true;
        }

        // Get change details
        const changeDetails = this.getUnsavedChangesDetails();

        // Show confirmation dialog
        return await this.showUnsavedChangesDialog(changeDetails);
    }

    /**
     * Check for unsaved changes across the application
     * @returns {Promise<boolean>} Whether there are unsaved changes
     */
    async checkUnsavedChanges() {
        // Check with ChangeTracker if available
        if (window.app && window.app.components.changeTracker) {
            return window.app.components.changeTracker.hasUnsavedChanges();
        }

        // Check with FormManager if available
        if (window.app && window.app.components.formManager) {
            const forms = window.app.components.formManager.forms;
            return Object.keys(forms).some(formId =>
                window.app.components.formManager.hasUnsavedChanges(formId)
            );
        }

        return false;
    }

    /**
     * Get details about unsaved changes
     * @returns {Object} Details about unsaved changes
     */
    getUnsavedChangesDetails() {
        if (window.app && window.app.components.changeTracker) {
            return window.app.components.changeTracker.getChangeDetails();
        }

        return {
            hasChanges: false,
            totalChanges: 0,
            forms: [],
            components: []
        };
    }

    /**
     * Show unsaved changes confirmation dialog
     * @param {Object} changeDetails - Details about unsaved changes
     * @returns {Promise<boolean>} User's choice
     */
    async showUnsavedChangesDialog(changeDetails) {
        if (window.app && window.app.components.modalManager) {
            const choice = await window.app.components.modalManager.showNavigationConfirmation({
                changesDetails: changeDetails
            });

            switch (choice) {
                case 'save-and-continue':
                    await this.saveAllChanges();
                    return true;
                case 'continue-without-saving':
                    this.discardAllChanges();
                    return true;
                case 'cancel':
                default:
                    return false;
            }
        }

        // Fallback to simple confirm dialog
        return confirm(
            'You have unsaved changes. Are you sure you want to leave this page? ' +
            'Your changes will be lost.'
        );
    }

    /**
     * Save all unsaved changes
     */
    async saveAllChanges() {
        if (window.app && window.app.components.changeTracker) {
            await window.app.components.changeTracker.saveAllChanges();
        }
    }

    /**
     * Discard all unsaved changes
     */
    discardAllChanges() {
        if (window.app && window.app.components.changeTracker) {
            window.app.components.changeTracker.discardAllChanges();
        }
    }

    /**
     * Handle hash change events
     */
    handleHashChange(event) {
        console.log('Hash changed:', window.location.hash);
        this.handleRouteFromHash();
    }

    /**
     * Handle browser back/forward events
     */
    handlePopState(event) {
        console.log('Pop state event:', event.state);
        this.handleRouteFromHash();
    }

    /**
     * Handle route from current hash
     */
    handleRouteFromHash() {
        const hash = window.location.hash.replace('#', '');
        const [route, queryString] = hash.split('?');

        const params = {};
        if (queryString) {
            const urlParams = new URLSearchParams(queryString);
            for (const [key, value] of urlParams) {
                params[key] = value;
            }
        }

        // Navigate to route if different from current
        if (route !== this.currentRoute || JSON.stringify(params) !== JSON.stringify(this.currentParams)) {
            this.navigateTo(route || 'dashboard', params, { fromHashChange: true });
        }
    }

    /**
     * Update URL hash
     * @param {string} route - Route name
     * @param {Object} params - Route parameters
     */
    updateUrlHash(route, params) {
        let hash = route;

        if (Object.keys(params).length > 0) {
            const urlParams = new URLSearchParams(params);
            hash += '?' + urlParams.toString();
        }

        // Update hash without triggering hashchange event
        if (window.location.hash !== '#' + hash) {
            history.replaceState({ route, params }, '', '#' + hash);
        }
    }

    /**
     * Update navigation UI to reflect current route
     * @param {string} route - Current route
     */
    updateNavigationUI(route) {
        // Update active navigation links
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-route') === route) {
                link.classList.add('active');
            }
        });

        // Update breadcrumbs if they exist
        this.updateBreadcrumbs(route);
    }

    /**
     * Update breadcrumbs navigation
     * @param {string} route - Current route
     */
    updateBreadcrumbs(route) {
        const breadcrumbContainer = document.querySelector('.breadcrumb');
        if (!breadcrumbContainer) return;

        const breadcrumbs = this.generateBreadcrumbs(route);
        breadcrumbContainer.innerHTML = breadcrumbs.map(crumb =>
            `<span class="breadcrumb-item ${crumb.active ? 'active' : ''}">${crumb.text}</span>`
        ).join(' / ');
    }

    /**
     * Generate breadcrumbs for a route
     * @param {string} route - Route name
     * @returns {Array} Breadcrumb items
     */
    generateBreadcrumbs(route) {
        const breadcrumbs = [{ text: 'Dashboard', active: false }];

        switch (route) {
            case 'dashboard':
                breadcrumbs[0].active = true;
                break;
            case 'create-patient':
                breadcrumbs.push({ text: 'Create Patient', active: true });
                break;
            case 'search-patients':
                breadcrumbs.push({ text: 'Search Patients', active: true });
                break;
            case 'patient-list':
                breadcrumbs.push({ text: 'Patient List', active: true });
                break;
            case 'patient-detail':
                breadcrumbs.push({ text: 'Patient Details', active: true });
                break;
            default:
                breadcrumbs.push({ text: route, active: true });
        }

        return breadcrumbs;
    }

    /**
     * Execute route handler with smooth transitions
     * @param {Object} routeConfig - Route configuration
     * @param {string} route - Route name
     * @param {Object} params - Route parameters
     * @param {string} previousRoute - Previous route for transitions
     */
    async executeRouteHandler(routeConfig, route, params, previousRoute) {
        try {
            // Add transition classes
            const mainContainer = document.querySelector('.main-container');
            if (mainContainer) {
                mainContainer.classList.add('route-transitioning');
            }

            // Execute route handler
            await routeConfig.handler(route, params, previousRoute);

            // Remove transition classes after a delay
            setTimeout(() => {
                if (mainContainer) {
                    mainContainer.classList.remove('route-transitioning');
                }
            }, 300);

        } catch (error) {
            console.error('Route handler error:', error);
            throw error;
        }
    }

    /**
     * Update page title
     * @param {string} title - Page title
     * @param {Object} params - Route parameters for title interpolation
     */
    updatePageTitle(title, params) {
        let pageTitle = title;

        // Interpolate parameters into title
        Object.keys(params).forEach(key => {
            pageTitle = pageTitle.replace(`{${key}}`, params[key]);
        });

        document.title = `${pageTitle} - Patient Management System`;
    }

    /**
     * Add route to navigation history
     * @param {string} route - Route name
     * @param {Object} params - Route parameters
     */
    addToHistory(route, params) {
        if (!route) return;

        this.navigationHistory.push({ route, params });

        // Limit history size
        if (this.navigationHistory.length > this.maxHistorySize) {
            this.navigationHistory.shift();
        }
    }

    /**
     * Get full path including parameters
     * @returns {string} Full path
     */
    getFullPath() {
        let path = this.currentRoute || '';

        if (Object.keys(this.currentParams).length > 0) {
            const urlParams = new URLSearchParams(this.currentParams);
            path += '?' + urlParams.toString();
        }

        return path;
    }

    /**
     * Check if user is authenticated
     * @returns {boolean} Authentication status
     */
    isAuthenticated() {
        if (window.app && window.app.components.authManager) {
            return window.app.components.authManager.isAuthenticated();
        }
        return true; // Default to true for development
    }

    /**
     * Handle navigation errors
     * @param {Error} error - Navigation error
     * @param {string} route - Failed route
     * @param {Object} params - Route parameters
     */
    handleNavigationError(error, route, params) {
        console.error(`Navigation error for route ${route}:`, error);

        // Show error to user
        if (window.app && window.app.components.errorHandler) {
            window.app.components.errorHandler.handleError({
                type: 'NAVIGATION',
                message: `Failed to navigate to ${route}`,
                error: error,
                context: 'UIRouter Navigation'
            });
        }

        // Fallback to dashboard
        if (route !== 'dashboard') {
            setTimeout(() => {
                this.navigateTo('dashboard', {}, { force: true });
            }, 1000);
        }
    }

    /**
     * Register default routes
     */
    registerDefaultRoutes() {
        // Dashboard route
        this.registerRoute('dashboard', async (route, params) => {
            await this.showDashboard();
        }, { title: 'Dashboard' });

        // Create patient route
        this.registerRoute('create-patient', async (route, params) => {
            await this.showCreatePatient();
        }, { title: 'Create Patient' });

        // Search patients route
        this.registerRoute('search-patients', async (route, params) => {
            await this.showSearchPatients();
        }, { title: 'Search Patients' });

        // Patient list route
        this.registerRoute('patient-list', async (route, params) => {
            await this.showPatientList();
        }, { title: 'Patient List' });

        // Patient detail route
        this.registerRoute('patient-detail', async (route, params) => {
            await this.showPatientDetail(params.patientId);
        }, { title: 'Patient Details' });

        // Not found route
        this.registerRoute('not-found', async (route, params) => {
            await this.showNotFound(params.originalRoute);
        }, { title: 'Page Not Found', requiresAuth: false });

        console.log('Default routes registered');
    }

    /**
     * Show dashboard view
     */
    async showDashboard() {
        const dashboardContent = document.getElementById('dashboard-content');
        const dynamicContent = document.getElementById('dynamic-content');

        if (dashboardContent && dynamicContent) {
            dashboardContent.style.display = 'block';
            dynamicContent.style.display = 'none';
        }
    }

    /**
     * Show create patient view
     */
    async showCreatePatient() {
        console.log('UIRouter: showCreatePatient called');

        const dashboardContent = document.getElementById('dashboard-content');
        const dynamicContent = document.getElementById('dynamic-content');

        console.log('Dashboard content element:', !!dashboardContent);
        console.log('Dynamic content element:', !!dynamicContent);

        if (dashboardContent && dynamicContent) {
            console.log('Hiding dashboard, showing dynamic content');
            dashboardContent.style.display = 'none';
            dynamicContent.style.display = 'block';

            console.log('Window.app available:', !!window.app);
            console.log('loadCreatePatientForm method available:', !!(window.app && window.app.loadCreatePatientForm));

            if (window.app && window.app.loadCreatePatientForm) {
                console.log('Calling loadCreatePatientForm...');
                await window.app.loadCreatePatientForm(dynamicContent);
            } else {
                console.error('loadCreatePatientForm method not available');
                dynamicContent.innerHTML = `
                    <div style="padding: 20px; color: red;">
                        <h2>Error</h2>
                        <p>loadCreatePatientForm method not available</p>
                        <p>Window.app: ${!!window.app}</p>
                        <p>Method exists: ${!!(window.app && window.app.loadCreatePatientForm)}</p>
                    </div>
                `;
            }
        } else {
            console.error('Required DOM elements not found');
        }
    }

    /**
     * Show search patients view
     */
    async showSearchPatients() {
        const dashboardContent = document.getElementById('dashboard-content');
        const dynamicContent = document.getElementById('dynamic-content');

        if (dashboardContent && dynamicContent) {
            dashboardContent.style.display = 'none';
            dynamicContent.style.display = 'block';

            if (window.app && window.app.loadPatientSearchView) {
                window.app.loadPatientSearchView(dynamicContent);
            }
        }
    }

    /**
     * Show patient list view
     */
    async showPatientList() {
        const dashboardContent = document.getElementById('dashboard-content');
        const dynamicContent = document.getElementById('dynamic-content');

        if (dashboardContent && dynamicContent) {
            dashboardContent.style.display = 'none';
            dynamicContent.style.display = 'block';

            if (window.app && window.app.loadPatientListView) {
                await window.app.loadPatientListView(dynamicContent);
            }
        }
    }

    /**
     * Show patient detail view
     * @param {string} patientId - Patient ID
     */
    async showPatientDetail(patientId) {
        const dashboardContent = document.getElementById('dashboard-content');
        const dynamicContent = document.getElementById('dynamic-content');

        if (dashboardContent && dynamicContent) {
            dashboardContent.style.display = 'none';
            dynamicContent.style.display = 'block';

            if (window.app && window.app.loadPatientDetailView) {
                const route = `patient-detail?patientId=${patientId}`;
                await window.app.loadPatientDetailView(dynamicContent, route);
            }
        }
    }

    /**
     * Show not found view
     * @param {string} originalRoute - Original route that was not found
     */
    async showNotFound(originalRoute) {
        const dashboardContent = document.getElementById('dashboard-content');
        const dynamicContent = document.getElementById('dynamic-content');

        if (dashboardContent && dynamicContent) {
            dashboardContent.style.display = 'none';
            dynamicContent.style.display = 'block';

            dynamicContent.innerHTML = `
                <div class="card">
                    <div class="card-body text-center">
                        <h3>Page Not Found</h3>
                        <p>The requested page "${originalRoute || 'unknown'}" could not be found.</p>
                        <button class="btn btn-primary" onclick="window.app.components.uiRouter.navigateTo('dashboard')">
                            Go to Dashboard
                        </button>
                    </div>
                </div>
            `;
        }
    }

    /**
     * Destroy the router and clean up event listeners
     */
    destroy() {
        window.removeEventListener('hashchange', this.handleHashChange);
        window.removeEventListener('popstate', this.handlePopState);

        this.routes.clear();
        this.navigationHistory = [];

        console.log('UIRouter destroyed');
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIRouter;
}