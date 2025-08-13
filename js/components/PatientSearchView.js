/**
 * Patient Search View Component
 * Handles patient search interface and results display
 */

class PatientSearchView {
    constructor(patientManager, uiRouter = null) {
        this.patientManager = patientManager;
        this.uiRouter = uiRouter;
        this.searchResults = [];
        this.currentSearchTerm = '';
        this.isSearching = false;

        // Bind methods
        this.handleSearch = this.handleSearch.bind(this);
        this.handlePatientSelect = this.handlePatientSelect.bind(this);
        this.clearSearch = this.clearSearch.bind(this);
        this.renderSearchResults = this.renderSearchResults.bind(this);
    }

    /**
     * Render the search interface
     * @returns {string} HTML string for search interface
     */
    render() {
        return `
            <div class="search-container">
                <div class="content-header">
                    <h2 class="content-title">Search Patients</h2>
                    <p class="content-subtitle">Find existing patient records by name</p>
                </div>

                <!-- Search Form -->
                <div class="card">
                    <div class="card-body">
                        <form class="search-form" id="patient-search-form">
                            <div class="search-input-group">
                                <input 
                                    type="text" 
                                    id="search-input" 
                                    class="form-control search-input" 
                                    placeholder="Enter patient first name or last name..."
                                    autocomplete="off"
                                    value="${this.currentSearchTerm}"
                                >
                                <button type="submit" class="btn btn-primary search-button" id="search-button">
                                    <span class="search-icon">🔍</span>
                                    Search
                                </button>
                                <button type="button" class="btn btn-secondary clear-button" id="clear-button" style="display: none;">
                                    Clear
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <!-- Search Results -->
                <div id="search-results-container" class="search-results-container">
                    ${this.renderSearchResults()}
                </div>
            </div>
        `;
    }

    /**
     * Render search results
     * @returns {string} HTML string for search results
     */
    renderSearchResults() {
        if (this.isSearching) {
            return `
                <div class="card">
                    <div class="card-body text-center">
                        <div class="loading-spinner"></div>
                        <p>Searching patients...</p>
                    </div>
                </div>
            `;
        }

        if (this.currentSearchTerm && this.searchResults.length === 0) {
            return `
                <div class="card">
                    <div class="card-body text-center no-results">
                        <div class="no-results-icon">🔍</div>
                        <h3>No patients found</h3>
                        <p>No patients match your search for "<strong>${this.currentSearchTerm}</strong>"</p>
                        <p class="text-muted">Try searching with a different name or check the spelling.</p>
                        <button class="btn btn-secondary" onclick="document.getElementById('search-input').focus()">
                            Try Another Search
                        </button>
                    </div>
                </div>
            `;
        }

        if (this.searchResults.length > 0) {
            return `
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">
                            Search Results 
                            <span class="results-count">(${this.searchResults.length} patient${this.searchResults.length !== 1 ? 's' : ''} found)</span>
                        </h3>
                    </div>
                    <div class="card-body">
                        <div class="patient-list">
                            ${this.searchResults.map(patient => this.renderPatientItem(patient)).join('')}
                        </div>
                    </div>
                </div>
            `;
        }

        if (!this.currentSearchTerm) {
            return `
                <div class="card">
                    <div class="card-body text-center search-instructions">
                        <div class="search-instructions-icon">👥</div>
                        <h3>Search for Patients</h3>
                        <p>Enter a patient's first name or last name in the search box above to find their records.</p>
                        <div class="search-tips">
                            <h4>Search Tips:</h4>
                            <ul>
                                <li>You can search by first name, last name, or both</li>
                                <li>Search is case-insensitive</li>
                                <li>Partial matches are supported</li>
                            </ul>
                        </div>
                    </div>
                </div>
            `;
        }

        return '';
    }

    /**
     * Render individual patient item
     * @param {Object} patient - Patient data
     * @returns {string} HTML string for patient item
     */
    renderPatientItem(patient) {
        const age = patient.age || 'Unknown';
        const gender = patient.gender || 'Not specified';
        const residence = patient.placeOfResidence || 'Not specified';
        const lastVisit = patient.lastVisitDate ?
            new Date(patient.lastVisitDate).toLocaleDateString() :
            'No visits recorded';

        return `
            <div class="patient-item" data-patient-id="${patient.id}" onclick="patientSearchView.handlePatientSelect('${patient.id}')">
                <div class="patient-item-header">
                    <h4 class="patient-name">${patient.fullName}</h4>
                    <div class="patient-actions">
                        <button class="btn btn-sm btn-primary view-patient-btn" data-patient-id="${patient.id}">
                            View Details
                        </button>
                    </div>
                </div>
                <div class="patient-details">
                    <div class="patient-detail-row">
                        <span class="detail-label">Age:</span>
                        <span class="detail-value">${age}</span>
                    </div>
                    <div class="patient-detail-row">
                        <span class="detail-label">Gender:</span>
                        <span class="detail-value">${gender}</span>
                    </div>
                    <div class="patient-detail-row">
                        <span class="detail-label">Residence:</span>
                        <span class="detail-value">${residence}</span>
                    </div>
                    <div class="patient-detail-row">
                        <span class="detail-label">Last Visit:</span>
                        <span class="detail-value">${lastVisit}</span>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Initialize the search view
     */
    initialize() {
        // Set up event listeners
        const searchForm = document.getElementById('patient-search-form');
        const searchInput = document.getElementById('search-input');
        const clearButton = document.getElementById('clear-button');

        if (searchForm) {
            searchForm.addEventListener('submit', this.handleSearch);
        }

        if (searchInput) {
            // Real-time search as user types (with debounce)
            let searchTimeout;
            searchInput.addEventListener('input', (event) => {
                clearTimeout(searchTimeout);
                const searchTerm = event.target.value.trim();

                // Show/hide clear button
                if (clearButton) {
                    clearButton.style.display = searchTerm ? 'block' : 'none';
                }

                // Debounce search
                searchTimeout = setTimeout(() => {
                    if (searchTerm.length >= 2) {
                        this.performSearch(searchTerm);
                    } else if (searchTerm.length === 0) {
                        this.clearSearch();
                    }
                }, 300);
            });

            // Focus on search input
            searchInput.focus();
        }

        if (clearButton) {
            clearButton.addEventListener('click', this.clearSearch);
        }

        log('PatientSearchView initialized', 'info');
    }

    /**
     * Handle search form submission
     * @param {Event} event - Form submit event
     */
    async handleSearch(event) {
        event.preventDefault();

        const searchInput = document.getElementById('search-input');
        if (!searchInput) return;

        const searchTerm = searchInput.value.trim();
        if (!searchTerm) {
            this.showToast('Please enter a search term', 'warning');
            return;
        }

        await this.performSearch(searchTerm);
    }

    /**
     * Perform the actual search
     * @param {string} searchTerm - Search term
     */
    async performSearch(searchTerm) {
        try {
            this.isSearching = true;
            this.currentSearchTerm = searchTerm;
            this.updateSearchResults();

            log(`Searching for patients with term: "${searchTerm}"`, 'info');

            // Search using PatientManager
            const results = await this.patientManager.searchPatients(searchTerm);

            this.searchResults = results;
            this.isSearching = false;

            log(`Found ${results.length} patients matching search term`, 'info');

            this.updateSearchResults();

        } catch (error) {
            this.isSearching = false;
            log(`Search failed: ${error.message}`, 'error');

            this.showToast('Search failed. Please try again.', 'error');
            this.updateSearchResults();
        }
    }

    /**
     * Clear search results and input
     */
    clearSearch() {
        this.currentSearchTerm = '';
        this.searchResults = [];
        this.isSearching = false;

        const searchInput = document.getElementById('search-input');
        const clearButton = document.getElementById('clear-button');

        if (searchInput) {
            searchInput.value = '';
            searchInput.focus();
        }

        if (clearButton) {
            clearButton.style.display = 'none';
        }

        this.updateSearchResults();
        log('Search cleared', 'info');
    }

    /**
     * Update search results display
     */
    updateSearchResults() {
        const resultsContainer = document.getElementById('search-results-container');
        if (resultsContainer) {
            resultsContainer.innerHTML = this.renderSearchResults();
        }
    }

    /**
     * Handle patient selection
     * @param {string} patientId - ID of selected patient
     */
    async handlePatientSelect(patientId) {
        try {
            log(`Patient selected: ${patientId}`, 'info');

            // Navigate to patient detail view
            if (this.uiRouter) {
                this.uiRouter.navigateTo('patient-detail', { patientId });
            } else if (window.app) {
                // Fallback to app navigation
                window.app.navigateToRoute('patient-detail', { patientId });
            } else {
                // Show patient details in modal as fallback
                await this.showPatientDetailsModal(patientId);
            }

        } catch (error) {
            log(`Failed to select patient: ${error.message}`, 'error');
            this.showToast('Failed to load patient details', 'error');
        }
    }

    /**
     * Show patient details in a modal (fallback)
     * @param {string} patientId - Patient ID
     */
    async showPatientDetailsModal(patientId) {
        try {
            const patient = await this.patientManager.getPatient(patientId);
            if (!patient) {
                throw new Error('Patient not found');
            }

            const patientDetailView = new PatientDetailView(patient);
            const modalContent = patientDetailView.render();

            this.showModal('Patient Details', modalContent);

        } catch (error) {
            log(`Failed to show patient details: ${error.message}`, 'error');
            this.showToast('Failed to load patient details', 'error');
        }
    }

    /**
     * Show toast notification
     * @param {string} message - Message to show
     * @param {string} type - Toast type
     */
    showToast(message, type = 'info') {
        if (window.app && window.app.showToast) {
            window.app.showToast(message, type);
        } else {
            // Fallback to alert
            alert(message);
        }
    }

    /**
     * Show modal dialog
     * @param {string} title - Modal title
     * @param {string} content - Modal content
     */
    showModal(title, content) {
        const modalContainer = document.getElementById('modal-container');
        if (!modalContainer) return;

        modalContainer.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h3 class="modal-title">${title}</h3>
                    <button class="modal-close" onclick="this.closest('.modal-container').classList.add('hidden')">&times;</button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="this.closest('.modal-container').classList.add('hidden')">
                        Close
                    </button>
                </div>
            </div>
        `;

        modalContainer.classList.remove('hidden');
    }

    /**
     * Destroy the search view and clean up
     */
    destroy() {
        // Remove event listeners
        const searchForm = document.getElementById('patient-search-form');
        if (searchForm) {
            searchForm.removeEventListener('submit', this.handleSearch);
        }

        log('PatientSearchView destroyed', 'info');
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PatientSearchView;
}