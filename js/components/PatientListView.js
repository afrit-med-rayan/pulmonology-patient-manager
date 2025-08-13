/**
 * Patient List View Component with Performance Optimizations
 * Handles patient list display with lazy loading, pagination, and virtual scrolling
 */

class PatientListView {
    constructor(patientManager, performanceOptimizer = null) {
        this.patientManager = patientManager;
        this.performanceOptimizer = performanceOptimizer;
        this.allPatients = [];
        this.currentPage = 1;
        this.pageSize = 20;
        this.totalPages = 0;
        this.isLoading = false;
        this.sortBy = 'lastName';
        this.sortOrder = 'asc';
        this.filterOptions = {
            gender: '',
            ageRange: { min: '', max: '' },
            residence: ''
        };

        // Virtual scrolling properties
        this.virtualScrolling = {
            enabled: false,
            itemHeight: 120,
            containerHeight: 600,
            scrollTop: 0,
            visibleItems: [],
            totalHeight: 0
        };

        // Bind methods
        this.handlePageChange = this.handlePageChange.bind(this);
        this.handleSortChange = this.handleSortChange.bind(this);
        this.handleFilterChange = this.handleFilterChange.bind(this);
        this.handleScroll = this.handleScroll.bind(this);
        this.handlePatientSelect = this.handlePatientSelect.bind(this);
    }

    /**
     * Render the patient list interface
     * @returns {string} HTML string for patient list
     */
    render() {
        return `
            <div class="patient-list-container">
                <div class="content-header">
                    <h2 class="content-title">Patient List</h2>
                    <p class="content-subtitle">View and manage all patient records</p>
                </div>

                <!-- List Controls -->
                <div class="card">
                    <div class="card-body">
                        <div class="list-controls">
                            <!-- Search and Filter -->
                            <div class="controls-row">
                                <div class="search-group">
                                    <input 
                                        type="text" 
                                        id="quick-search" 
                                        class="form-control" 
                                        placeholder="Quick search..."
                                        autocomplete="off"
                                    >
                                    <button type="button" class="btn btn-secondary" id="clear-search">
                                        Clear
                                    </button>
                                </div>
                                
                                <div class="filter-group">
                                    <select id="gender-filter" class="form-control">
                                        <option value="">All Genders</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                    
                                    <input 
                                        type="number" 
                                        id="age-min" 
                                        class="form-control" 
                                        placeholder="Min age"
                                        min="0" 
                                        max="150"
                                    >
                                    
                                    <input 
                                        type="number" 
                                        id="age-max" 
                                        class="form-control" 
                                        placeholder="Max age"
                                        min="0" 
                                        max="150"
                                    >
                                </div>
                                
                                <div class="view-options">
                                    <button type="button" class="btn btn-secondary" id="toggle-virtual-scroll">
                                        <span id="virtual-scroll-text">Enable Virtual Scroll</span>
                                    </button>
                                    
                                    <select id="page-size" class="form-control">
                                        <option value="10">10 per page</option>
                                        <option value="20" selected>20 per page</option>
                                        <option value="50">50 per page</option>
                                        <option value="100">100 per page</option>
                                    </select>
                                </div>
                            </div>
                            
                            <!-- Sort Options -->
                            <div class="controls-row">
                                <div class="sort-group">
                                    <label>Sort by:</label>
                                    <select id="sort-by" class="form-control">
                                        <option value="lastName">Last Name</option>
                                        <option value="firstName">First Name</option>
                                        <option value="age">Age</option>
                                        <option value="createdAt">Date Added</option>
                                        <option value="updatedAt">Last Modified</option>
                                    </select>
                                    
                                    <select id="sort-order" class="form-control">
                                        <option value="asc">Ascending</option>
                                        <option value="desc">Descending</option>
                                    </select>
                                </div>
                                
                                <div class="stats-group">
                                    <span class="stats-text" id="list-stats">
                                        Loading patients...
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Patient List -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Patients</h3>
                        <div class="card-actions">
                            <button type="button" class="btn btn-primary" id="refresh-list">
                                Refresh
                            </button>
                        </div>
                    </div>
                    
                    <div class="card-body">
                        <!-- Virtual Scroll Container -->
                        <div id="virtual-scroll-container" class="virtual-scroll-container" style="display: none;">
                            <div id="virtual-scroll-content" class="virtual-scroll-content">
                                <!-- Virtual scroll items will be rendered here -->
                            </div>
                        </div>
                        
                        <!-- Regular List Container -->
                        <div id="patient-list-content" class="patient-list-content">
                            ${this.renderPatientList()}
                        </div>
                        
                        <!-- Pagination -->
                        <div id="pagination-container" class="pagination-container">
                            ${this.renderPagination()}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render patient list items
     * @returns {string} HTML string for patient list
     */
    renderPatientList() {
        if (this.isLoading) {
            return `
                <div class="loading-container">
                    <div class="loading-spinner"></div>
                    <p>Loading patients...</p>
                </div>
            `;
        }

        if (this.allPatients.length === 0) {
            return `
                <div class="empty-state">
                    <div class="empty-state-icon">👥</div>
                    <h3>No patients found</h3>
                    <p>No patients match your current filters.</p>
                    <button class="btn btn-primary" onclick="window.app.navigateToRoute('create-patient')">
                        Create First Patient
                    </button>
                </div>
            `;
        }

        // Get current page items
        const startIndex = (this.currentPage - 1) * this.pageSize;
        const endIndex = Math.min(startIndex + this.pageSize, this.allPatients.length);
        const pageItems = this.allPatients.slice(startIndex, endIndex);

        return `
            <div class="patient-list">
                ${pageItems.map((patient, index) => this.renderPatientItem(patient, startIndex + index)).join('')}
            </div>
        `;
    }

    /**
     * Render individual patient item
     * @param {Object} patient - Patient data
     * @param {number} index - Item index
     * @returns {string} HTML string for patient item
     */
    renderPatientItem(patient, index) {
        const age = patient.age || 'Unknown';
        const gender = patient.gender || 'Not specified';
        const residence = patient.placeOfResidence || 'Not specified';
        const lastVisit = patient.lastVisitDate ?
            new Date(patient.lastVisitDate).toLocaleDateString() :
            'No visits recorded';
        const createdDate = new Date(patient.createdAt).toLocaleDateString();

        return `
            <div class="patient-item" data-patient-id="${patient.id}" data-index="${index}">
                <div class="patient-item-content">
                    <div class="patient-main-info">
                        <h4 class="patient-name">${patient.fullName}</h4>
                        <div class="patient-meta">
                            <span class="meta-item">
                                <strong>Age:</strong> ${age}
                            </span>
                            <span class="meta-item">
                                <strong>Gender:</strong> ${gender}
                            </span>
                            <span class="meta-item">
                                <strong>Residence:</strong> ${residence}
                            </span>
                        </div>
                    </div>
                    
                    <div class="patient-secondary-info">
                        <div class="info-row">
                            <span class="info-label">Last Visit:</span>
                            <span class="info-value">${lastVisit}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Added:</span>
                            <span class="info-value">${createdDate}</span>
                        </div>
                    </div>
                    
                    <div class="patient-actions">
                        <button class="btn btn-sm btn-primary view-btn" 
                                data-patient-id="${patient.id}"
                                onclick="patientListView.handlePatientSelect('${patient.id}')">
                            View
                        </button>
                        <button class="btn btn-sm btn-secondary edit-btn" 
                                data-patient-id="${patient.id}"
                                onclick="patientListView.editPatient('${patient.id}')">
                            Edit
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render pagination controls
     * @returns {string} HTML string for pagination
     */
    renderPagination() {
        if (this.virtualScrolling.enabled || this.totalPages <= 1) {
            return '';
        }

        const startPage = Math.max(1, this.currentPage - 2);
        const endPage = Math.min(this.totalPages, this.currentPage + 2);
        const pages = [];

        // Previous button
        pages.push(`
            <button class="btn btn-secondary pagination-btn ${this.currentPage === 1 ? 'disabled' : ''}" 
                    data-page="${this.currentPage - 1}" 
                    ${this.currentPage === 1 ? 'disabled' : ''}>
                Previous
            </button>
        `);

        // First page
        if (startPage > 1) {
            pages.push(`
                <button class="btn btn-secondary pagination-btn" data-page="1">1</button>
            `);
            if (startPage > 2) {
                pages.push('<span class="pagination-ellipsis">...</span>');
            }
        }

        // Page numbers
        for (let i = startPage; i <= endPage; i++) {
            pages.push(`
                <button class="btn ${i === this.currentPage ? 'btn-primary' : 'btn-secondary'} pagination-btn" 
                        data-page="${i}">
                    ${i}
                </button>
            `);
        }

        // Last page
        if (endPage < this.totalPages) {
            if (endPage < this.totalPages - 1) {
                pages.push('<span class="pagination-ellipsis">...</span>');
            }
            pages.push(`
                <button class="btn btn-secondary pagination-btn" data-page="${this.totalPages}">
                    ${this.totalPages}
                </button>
            `);
        }

        // Next button
        pages.push(`
            <button class="btn btn-secondary pagination-btn ${this.currentPage === this.totalPages ? 'disabled' : ''}" 
                    data-page="${this.currentPage + 1}" 
                    ${this.currentPage === this.totalPages ? 'disabled' : ''}>
                Next
            </button>
        `);

        return `
            <div class="pagination">
                <div class="pagination-info">
                    Showing ${(this.currentPage - 1) * this.pageSize + 1} to 
                    ${Math.min(this.currentPage * this.pageSize, this.allPatients.length)} 
                    of ${this.allPatients.length} patients
                </div>
                <div class="pagination-controls">
                    ${pages.join('')}
                </div>
            </div>
        `;
    }

    /**
     * Initialize the patient list view
     */
    async initialize() {
        try {
            // Set up event listeners
            this.setupEventListeners();

            // Load initial data
            await this.loadPatients();

            log('PatientListView initialized', 'info');

        } catch (error) {
            log(`Failed to initialize PatientListView: ${error.message}`, 'error');
            this.showError('Failed to load patient list');
        }
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Quick search with debouncing
        const quickSearch = document.getElementById('quick-search');
        if (quickSearch) {
            quickSearch.addEventListener('input', (e) => {
                if (this.performanceOptimizer) {
                    this.performanceOptimizer.debounce('quick-search', () => {
                        this.handleQuickSearch(e.target.value);
                    }, 300);
                } else {
                    setTimeout(() => this.handleQuickSearch(e.target.value), 300);
                }
            });
        }

        // Clear search
        const clearSearch = document.getElementById('clear-search');
        if (clearSearch) {
            clearSearch.addEventListener('click', () => {
                if (quickSearch) quickSearch.value = '';
                this.handleQuickSearch('');
            });
        }

        // Filter controls
        const genderFilter = document.getElementById('gender-filter');
        const ageMin = document.getElementById('age-min');
        const ageMax = document.getElementById('age-max');

        [genderFilter, ageMin, ageMax].forEach(element => {
            if (element) {
                element.addEventListener('change', this.handleFilterChange);
            }
        });

        // Sort controls
        const sortBy = document.getElementById('sort-by');
        const sortOrder = document.getElementById('sort-order');

        if (sortBy) sortBy.addEventListener('change', this.handleSortChange);
        if (sortOrder) sortOrder.addEventListener('change', this.handleSortChange);

        // Page size
        const pageSize = document.getElementById('page-size');
        if (pageSize) {
            pageSize.addEventListener('change', (e) => {
                this.pageSize = parseInt(e.target.value);
                this.currentPage = 1;
                this.updateDisplay();
            });
        }

        // Virtual scrolling toggle
        const toggleVirtualScroll = document.getElementById('toggle-virtual-scroll');
        if (toggleVirtualScroll) {
            toggleVirtualScroll.addEventListener('click', this.toggleVirtualScrolling.bind(this));
        }

        // Refresh button
        const refreshBtn = document.getElementById('refresh-list');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadPatients(true));
        }

        // Pagination (delegated event)
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('pagination-btn') && !e.target.disabled) {
                const page = parseInt(e.target.dataset.page);
                if (page && page !== this.currentPage) {
                    this.handlePageChange(page);
                }
            }
        });

        // Virtual scroll container
        const virtualContainer = document.getElementById('virtual-scroll-container');
        if (virtualContainer) {
            virtualContainer.addEventListener('scroll', this.handleScroll);
        }
    }

    /**
     * Load patients from storage
     * @param {boolean} forceRefresh - Force refresh from storage
     */
    async loadPatients(forceRefresh = false) {
        try {
            this.isLoading = true;
            this.updateDisplay();

            const operationId = 'load-patients';
            if (this.performanceOptimizer) {
                this.performanceOptimizer.showLoadingIndicator(operationId, 'Loading patients...');
            }

            // Get all patients
            this.allPatients = await this.patientManager.getAllPatients();

            // Apply current filters and sorting
            this.applyFiltersAndSort();

            // Update pagination
            this.totalPages = Math.ceil(this.allPatients.length / this.pageSize);

            this.isLoading = false;

            if (this.performanceOptimizer) {
                this.performanceOptimizer.hideLoadingIndicator(operationId);
            }

            this.updateDisplay();
            this.updateStats();

            log(`Loaded ${this.allPatients.length} patients`, 'info');

        } catch (error) {
            this.isLoading = false;
            log(`Failed to load patients: ${error.message}`, 'error');
            this.showError('Failed to load patients');
        }
    }

    /**
     * Handle quick search
     * @param {string} searchTerm - Search term
     */
    async handleQuickSearch(searchTerm) {
        try {
            if (!searchTerm.trim()) {
                // Reset to all patients
                await this.loadPatients();
                return;
            }

            const operationId = 'quick-search';
            if (this.performanceOptimizer) {
                this.performanceOptimizer.showLoadingIndicator(operationId, 'Searching...');

                // Use optimized search
                this.allPatients = await this.performanceOptimizer.optimizedSearch(searchTerm);
            } else {
                // Fallback to regular search
                this.allPatients = await this.patientManager.searchPatients(searchTerm);
            }

            this.currentPage = 1;
            this.totalPages = Math.ceil(this.allPatients.length / this.pageSize);

            if (this.performanceOptimizer) {
                this.performanceOptimizer.hideLoadingIndicator(operationId);
            }

            this.updateDisplay();
            this.updateStats();

        } catch (error) {
            log(`Quick search failed: ${error.message}`, 'error');
            this.showError('Search failed');
        }
    }

    /**
     * Handle filter changes
     */
    handleFilterChange() {
        const genderFilter = document.getElementById('gender-filter');
        const ageMin = document.getElementById('age-min');
        const ageMax = document.getElementById('age-max');

        this.filterOptions = {
            gender: genderFilter?.value || '',
            ageRange: {
                min: ageMin?.value ? parseInt(ageMin.value) : '',
                max: ageMax?.value ? parseInt(ageMax.value) : ''
            }
        };

        this.currentPage = 1;
        this.applyFiltersAndSort();
        this.updateDisplay();
        this.updateStats();
    }

    /**
     * Handle sort changes
     */
    handleSortChange() {
        const sortBy = document.getElementById('sort-by');
        const sortOrder = document.getElementById('sort-order');

        this.sortBy = sortBy?.value || 'lastName';
        this.sortOrder = sortOrder?.value || 'asc';

        this.applyFiltersAndSort();
        this.updateDisplay();
    }

    /**
     * Apply filters and sorting to patient list
     */
    applyFiltersAndSort() {
        let filteredPatients = [...this.allPatients];

        // Apply filters
        if (this.filterOptions.gender) {
            filteredPatients = filteredPatients.filter(patient =>
                patient.gender === this.filterOptions.gender
            );
        }

        if (this.filterOptions.ageRange.min !== '') {
            filteredPatients = filteredPatients.filter(patient =>
                patient.age >= this.filterOptions.ageRange.min
            );
        }

        if (this.filterOptions.ageRange.max !== '') {
            filteredPatients = filteredPatients.filter(patient =>
                patient.age <= this.filterOptions.ageRange.max
            );
        }

        // Apply sorting
        filteredPatients.sort((a, b) => {
            let aValue = a[this.sortBy];
            let bValue = b[this.sortBy];

            // Handle different data types
            if (this.sortBy === 'createdAt' || this.sortBy === 'updatedAt') {
                aValue = new Date(aValue);
                bValue = new Date(bValue);
            } else if (typeof aValue === 'string') {
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
            }

            let comparison = 0;
            if (aValue < bValue) comparison = -1;
            if (aValue > bValue) comparison = 1;

            return this.sortOrder === 'desc' ? -comparison : comparison;
        });

        this.allPatients = filteredPatients;
        this.totalPages = Math.ceil(this.allPatients.length / this.pageSize);
    }

    /**
     * Handle page change
     * @param {number} page - New page number
     */
    handlePageChange(page) {
        if (page < 1 || page > this.totalPages) return;

        this.currentPage = page;
        this.updateDisplay();

        // Scroll to top of list
        const listContainer = document.getElementById('patient-list-content');
        if (listContainer) {
            listContainer.scrollTop = 0;
        }
    }

    /**
     * Toggle virtual scrolling
     */
    toggleVirtualScrolling() {
        this.virtualScrolling.enabled = !this.virtualScrolling.enabled;

        const virtualContainer = document.getElementById('virtual-scroll-container');
        const regularContainer = document.getElementById('patient-list-content');
        const paginationContainer = document.getElementById('pagination-container');
        const toggleBtn = document.getElementById('virtual-scroll-text');

        if (this.virtualScrolling.enabled) {
            virtualContainer.style.display = 'block';
            regularContainer.style.display = 'none';
            paginationContainer.style.display = 'none';
            toggleBtn.textContent = 'Disable Virtual Scroll';

            this.setupVirtualScrolling();
        } else {
            virtualContainer.style.display = 'none';
            regularContainer.style.display = 'block';
            paginationContainer.style.display = 'block';
            toggleBtn.textContent = 'Enable Virtual Scroll';

            this.updateDisplay();
        }
    }

    /**
     * Setup virtual scrolling
     */
    setupVirtualScrolling() {
        if (!this.performanceOptimizer) return;

        const lazyConfig = this.performanceOptimizer.setupLazyLoading(this.allPatients, {
            itemHeight: this.virtualScrolling.itemHeight,
            bufferSize: 5
        });

        this.virtualScrolling.totalHeight = lazyConfig.getTotalHeight();

        // Update virtual scroll content
        this.updateVirtualScroll();
    }

    /**
     * Handle virtual scroll
     * @param {Event} event - Scroll event
     */
    handleScroll(event) {
        if (!this.virtualScrolling.enabled || !this.performanceOptimizer) return;

        const container = event.target;
        this.virtualScrolling.scrollTop = container.scrollTop;
        this.virtualScrolling.containerHeight = container.clientHeight;

        // Throttle scroll updates
        if (this.scrollTimeout) {
            clearTimeout(this.scrollTimeout);
        }

        this.scrollTimeout = setTimeout(() => {
            this.updateVirtualScroll();
        }, 16); // ~60fps
    }

    /**
     * Update virtual scroll display
     */
    updateVirtualScroll() {
        if (!this.performanceOptimizer) return;

        const lazyConfig = this.performanceOptimizer.setupLazyLoading(this.allPatients, {
            itemHeight: this.virtualScrolling.itemHeight
        });

        const visibleData = lazyConfig.getVisibleItems(
            this.virtualScrolling.scrollTop,
            this.virtualScrolling.containerHeight
        );

        const content = document.getElementById('virtual-scroll-content');
        if (content) {
            content.style.height = `${this.virtualScrolling.totalHeight}px`;
            content.style.paddingTop = `${visibleData.startIndex * this.virtualScrolling.itemHeight}px`;

            content.innerHTML = visibleData.items
                .map((patient, index) => this.renderPatientItem(patient, visibleData.startIndex + index))
                .join('');
        }
    }

    /**
     * Update display
     */
    updateDisplay() {
        const listContent = document.getElementById('patient-list-content');
        const paginationContainer = document.getElementById('pagination-container');

        if (listContent) {
            listContent.innerHTML = this.renderPatientList();
        }

        if (paginationContainer) {
            paginationContainer.innerHTML = this.renderPagination();
        }
    }

    /**
     * Update statistics display
     */
    updateStats() {
        const statsElement = document.getElementById('list-stats');
        if (statsElement) {
            const total = this.allPatients.length;
            const showing = this.virtualScrolling.enabled ?
                total :
                Math.min(this.pageSize, total - (this.currentPage - 1) * this.pageSize);

            statsElement.textContent = `Showing ${showing} of ${total} patients`;
        }
    }

    /**
     * Handle patient selection
     * @param {string} patientId - Patient ID
     */
    async handlePatientSelect(patientId) {
        try {
            log(`Patient selected: ${patientId}`, 'info');

            // Navigate to patient detail view
            if (window.app && window.app.components.uiRouter) {
                window.app.components.uiRouter.navigateTo('patient-detail', { patientId });
            } else {
                window.app.navigateToRoute('patient-detail', { patientId });
            }

        } catch (error) {
            log(`Failed to select patient: ${error.message}`, 'error');
            this.showError('Failed to load patient details');
        }
    }

    /**
     * Edit patient
     * @param {string} patientId - Patient ID
     */
    editPatient(patientId) {
        try {
            if (window.app && window.app.components.uiRouter) {
                window.app.components.uiRouter.navigateTo('edit-patient', { patientId });
            } else {
                window.app.navigateToRoute('edit-patient', { patientId });
            }
        } catch (error) {
            log(`Failed to edit patient: ${error.message}`, 'error');
            this.showError('Failed to open patient editor');
        }
    }

    /**
     * Show error message
     * @param {string} message - Error message
     */
    showError(message) {
        if (window.app && window.app.showToast) {
            window.app.showToast(message, 'error');
        } else {
            alert(message);
        }
    }

    /**
     * Refresh patient data
     */
    async refresh() {
        await this.loadPatients(true);
    }

    /**
     * Get current view state
     * @returns {Object} Current state
     */
    getState() {
        return {
            currentPage: this.currentPage,
            pageSize: this.pageSize,
            sortBy: this.sortBy,
            sortOrder: this.sortOrder,
            filterOptions: this.filterOptions,
            virtualScrollingEnabled: this.virtualScrolling.enabled,
            totalPatients: this.allPatients.length
        };
    }

    /**
     * Destroy the view and clean up
     */
    destroy() {
        // Clear timeouts
        if (this.scrollTimeout) {
            clearTimeout(this.scrollTimeout);
        }

        // Remove event listeners
        const virtualContainer = document.getElementById('virtual-scroll-container');
        if (virtualContainer) {
            virtualContainer.removeEventListener('scroll', this.handleScroll);
        }

        log('PatientListView destroyed', 'info');
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PatientListView;
}