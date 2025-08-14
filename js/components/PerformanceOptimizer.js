/**
 * Performance Optimizer Component
 * Handles performance optimizations for the patient management system
 */

class PerformanceOptimizer {
    constructor() {
        this.searchIndex = new Map();
        this.searchCache = new Map();
        this.loadingIndicators = new Map();
        this.paginationCache = new Map();
        this.memoryThreshold = 1000; // Maximum items to keep in memory
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes cache timeout
        this.debounceTimers = new Map();

        // Performance metrics
        this.metrics = {
            searchTimes: [],
            loadTimes: [],
            cacheHits: 0,
            cacheMisses: 0
        };
    }

    /**
     * Initialize the performance optimizer
     * @param {DataStorageManager} dataStorage - Data storage instance
     */
    async initialize(dataStorage) {
        try {
            this.dataStorage = dataStorage;

            // Build initial search index
            await this.buildSearchIndex();

            // Set up memory management
            this.setupMemoryManagement();

            log('PerformanceOptimizer initialized successfully', 'info');

            return {
                success: true,
                message: 'Performance optimizer initialized'
            };

        } catch (error) {
            log(`Failed to initialize PerformanceOptimizer: ${error.message}`, 'error');
            throw new Error(`Performance optimizer initialization failed: ${error.message}`);
        }
    }

    /**
     * Build search index for fast patient searches
     */
    async buildSearchIndex() {
        try {
            log('Building search index...', 'info');
            const startTime = performance.now();

            this.searchIndex.clear();

            // Get all patients from storage
            const patients = await this.dataStorage.getAllPatients();

            patients.forEach(patient => {
                // Index by various searchable fields
                this.indexPatient(patient);
            });

            const buildTime = performance.now() - startTime;
            log(`Search index built in ${buildTime.toFixed(2)}ms for ${patients.length} patients`, 'info');

        } catch (error) {
            log(`Failed to build search index: ${error.message}`, 'error');
            throw error;
        }
    }

    /**
     * Index a single patient for search
     * @param {Object} patient - Patient data to index
     */
    indexPatient(patient) {
        const searchTerms = [
            patient.firstName?.toLowerCase(),
            patient.lastName?.toLowerCase(),
            patient.fullName?.toLowerCase(),
            patient.placeOfResidence?.toLowerCase(),
            patient.gender?.toLowerCase()
        ].filter(term => term);

        // Create n-grams for partial matching
        searchTerms.forEach(term => {
            // Add full term
            this.addToIndex(term, patient);

            // Add partial terms (2+ characters)
            for (let i = 0; i <= term.length - 2; i++) {
                for (let j = i + 2; j <= term.length; j++) {
                    const partial = term.substring(i, j);
                    this.addToIndex(partial, patient);
                }
            }
        });
    }

    /**
     * Add patient to search index
     * @param {string} term - Search term
     * @param {Object} patient - Patient data
     */
    addToIndex(term, patient) {
        if (!this.searchIndex.has(term)) {
            this.searchIndex.set(term, new Set());
        }
        this.searchIndex.get(term).add(patient.id);
    }

    /**
     * Perform optimized search with caching and indexing
     * @param {string} searchTerm - Search term
     * @param {Object} options - Search options
     * @returns {Promise<Array>} Search results
     */
    async optimizedSearch(searchTerm, options = {}) {
        const startTime = performance.now();
        const cacheKey = `${searchTerm}_${JSON.stringify(options)}`;

        try {
            // Check cache first
            if (this.searchCache.has(cacheKey)) {
                const cached = this.searchCache.get(cacheKey);
                if (Date.now() - cached.timestamp < this.cacheTimeout) {
                    this.metrics.cacheHits++;
                    log(`Search cache hit for "${searchTerm}"`, 'info');
                    return cached.results;
                }
            }

            this.metrics.cacheMisses++;

            // Perform indexed search
            const results = await this.performIndexedSearch(searchTerm, options);

            // Cache results
            this.searchCache.set(cacheKey, {
                results,
                timestamp: Date.now()
            });

            // Clean up old cache entries
            this.cleanupCache();

            const searchTime = performance.now() - startTime;
            this.metrics.searchTimes.push(searchTime);

            log(`Optimized search completed in ${searchTime.toFixed(2)}ms`, 'info');

            return results;

        } catch (error) {
            log(`Optimized search failed: ${error.message}`, 'error');
            throw error;
        }
    }

    /**
     * Perform search using the built index
     * @param {string} searchTerm - Search term
     * @param {Object} options - Search options
     * @returns {Promise<Array>} Search results
     */
    async performIndexedSearch(searchTerm, options = {}) {
        const normalizedTerm = searchTerm.toLowerCase().trim();
        const matchingPatientIds = new Set();

        // Find all matching patient IDs from index
        for (const [indexTerm, patientIds] of this.searchIndex.entries()) {
            if (indexTerm.includes(normalizedTerm)) {
                patientIds.forEach(id => matchingPatientIds.add(id));
            }
        }

        // Load patient details for matching IDs
        const patients = [];
        for (const patientId of matchingPatientIds) {
            try {
                const patient = await this.dataStorage.loadPatient(patientId);
                if (patient) {
                    patients.push({
                        id: patient.id,
                        firstName: patient.firstName,
                        lastName: patient.lastName,
                        fullName: patient.getFullName(),
                        age: patient.age,
                        gender: patient.gender,
                        placeOfResidence: patient.placeOfResidence,
                        lastVisitDate: patient.getLatestVisit()?.visitDate,
                        createdAt: patient.createdAt,
                        updatedAt: patient.updatedAt
                    });
                }
            } catch (error) {
                log(`Error loading patient ${patientId}: ${error.message}`, 'warn');
            }
        }

        // Sort results by relevance
        return this.sortSearchResults(patients, normalizedTerm, options);
    }

    /**
     * Sort search results by relevance
     * @param {Array} patients - Patient results
     * @param {string} searchTerm - Original search term
     * @param {Object} options - Sort options
     * @returns {Array} Sorted results
     */
    sortSearchResults(patients, searchTerm, options = {}) {
        return patients.sort((a, b) => {
            // Calculate relevance scores
            const scoreA = this.calculateRelevanceScore(a, searchTerm);
            const scoreB = this.calculateRelevanceScore(b, searchTerm);

            if (scoreA !== scoreB) {
                return scoreB - scoreA; // Higher score first
            }

            // Secondary sort by name
            return a.fullName.localeCompare(b.fullName);
        });
    }

    /**
     * Calculate relevance score for search result
     * @param {Object} patient - Patient data
     * @param {string} searchTerm - Search term
     * @returns {number} Relevance score
     */
    calculateRelevanceScore(patient, searchTerm) {
        let score = 0;
        const term = searchTerm.toLowerCase();

        // Exact name match gets highest score
        if (patient.fullName.toLowerCase() === term) {
            score += 100;
        }

        // First name exact match
        if (patient.firstName.toLowerCase() === term) {
            score += 80;
        }

        // Last name exact match
        if (patient.lastName.toLowerCase() === term) {
            score += 80;
        }

        // Starts with match
        if (patient.fullName.toLowerCase().startsWith(term)) {
            score += 60;
        }

        // Contains match
        if (patient.fullName.toLowerCase().includes(term)) {
            score += 40;
        }

        // Residence match
        if (patient.placeOfResidence?.toLowerCase().includes(term)) {
            score += 20;
        }

        return score;
    }

    /**
     * Implement pagination for large result sets
     * @param {Array} results - Full result set
     * @param {Object} paginationOptions - Pagination options
     * @returns {Object} Paginated results with metadata
     */
    paginateResults(results, paginationOptions = {}) {
        const {
            page = 1,
            pageSize = 20,
            cacheKey = null
        } = paginationOptions;

        const totalItems = results.length;
        const totalPages = Math.ceil(totalItems / pageSize);
        const startIndex = (page - 1) * pageSize;
        const endIndex = Math.min(startIndex + pageSize, totalItems);

        const paginatedResults = results.slice(startIndex, endIndex);

        // Cache pagination result if key provided
        if (cacheKey) {
            this.paginationCache.set(cacheKey, {
                results: paginatedResults,
                metadata: {
                    currentPage: page,
                    pageSize,
                    totalItems,
                    totalPages,
                    hasNextPage: page < totalPages,
                    hasPreviousPage: page > 1
                },
                timestamp: Date.now()
            });
        }

        return {
            results: paginatedResults,
            metadata: {
                currentPage: page,
                pageSize,
                totalItems,
                totalPages,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1,
                startIndex: startIndex + 1,
                endIndex
            }
        };
    }

    /**
     * Show loading indicator for slow operations
     * @param {string} operationId - Unique operation identifier
     * @param {string} message - Loading message
     * @param {Element} container - Container element
     */
    showLoadingIndicator(operationId, message = 'Loading...', container = null) {
        const loadingHtml = `
            <div class="loading-indicator" id="loading-${operationId}">
                <div class="loading-spinner"></div>
                <div class="loading-message">${message}</div>
            </div>
        `;

        if (container) {
            container.innerHTML = loadingHtml;
        } else {
            // Find a suitable container
            const searchContainer = document.getElementById('search-results-container');
            const dynamicContent = document.getElementById('dynamic-content');
            const targetContainer = searchContainer || dynamicContent;

            if (targetContainer) {
                targetContainer.innerHTML = loadingHtml;
            }
        }

        this.loadingIndicators.set(operationId, {
            startTime: Date.now(),
            message,
            container
        });

        log(`Loading indicator shown for operation: ${operationId}`, 'info');
    }

    /**
     * Hide loading indicator
     * @param {string} operationId - Operation identifier
     */
    hideLoadingIndicator(operationId) {
        const indicator = document.getElementById(`loading-${operationId}`);
        if (indicator) {
            indicator.remove();
        }

        const loadingInfo = this.loadingIndicators.get(operationId);
        if (loadingInfo) {
            const duration = Date.now() - loadingInfo.startTime;
            this.metrics.loadTimes.push(duration);
            this.loadingIndicators.delete(operationId);

            log(`Loading indicator hidden for operation: ${operationId} (${duration}ms)`, 'info');
        }
    }

    /**
     * Debounce function calls to improve performance
     * @param {string} key - Debounce key
     * @param {Function} func - Function to debounce
     * @param {number} delay - Delay in milliseconds
     */
    debounce(key, func, delay = 300) {
        if (this.debounceTimers.has(key)) {
            clearTimeout(this.debounceTimers.get(key));
        }

        const timer = setTimeout(() => {
            func();
            this.debounceTimers.delete(key);
        }, delay);

        this.debounceTimers.set(key, timer);
    }

    /**
     * Lazy load patient list with virtual scrolling
     * @param {Array} allPatients - Full patient list
     * @param {Object} options - Lazy loading options
     * @returns {Object} Lazy loading configuration
     */
    setupLazyLoading(allPatients, options = {}) {
        const {
            containerSelector = '.patient-list',
            itemHeight = 120,
            bufferSize = 5,
            pageSize = 20
        } = options;

        return {
            totalItems: allPatients.length,
            itemHeight,
            bufferSize,
            pageSize,

            // Get visible items for current scroll position
            getVisibleItems: (scrollTop, containerHeight) => {
                const startIndex = Math.floor(scrollTop / itemHeight);
                const endIndex = Math.min(
                    startIndex + Math.ceil(containerHeight / itemHeight) + bufferSize,
                    allPatients.length
                );

                return {
                    startIndex: Math.max(0, startIndex - bufferSize),
                    endIndex,
                    items: allPatients.slice(
                        Math.max(0, startIndex - bufferSize),
                        endIndex
                    )
                };
            },

            // Calculate total height for scrollbar
            getTotalHeight: () => allPatients.length * itemHeight
        };
    }

    /**
     * Setup memory management for large datasets
     */
    setupMemoryManagement() {
        // Clean up caches periodically
        setInterval(() => {
            this.cleanupCache();
            this.cleanupPaginationCache();
        }, 60000); // Every minute

        // Monitor memory usage
        if ('memory' in performance) {
            setInterval(() => {
                this.monitorMemoryUsage();
            }, 30000); // Every 30 seconds
        }
    }

    /**
     * Clean up expired cache entries
     */
    cleanupCache() {
        const now = Date.now();

        // Clean search cache
        for (const [key, cached] of this.searchCache.entries()) {
            if (now - cached.timestamp > this.cacheTimeout) {
                this.searchCache.delete(key);
            }
        }

        // Limit cache size
        if (this.searchCache.size > this.memoryThreshold) {
            const entries = Array.from(this.searchCache.entries());
            entries.sort((a, b) => a[1].timestamp - b[1].timestamp);

            // Remove oldest entries
            const toRemove = entries.slice(0, entries.length - this.memoryThreshold);
            toRemove.forEach(([key]) => this.searchCache.delete(key));
        }
    }

    /**
     * Clean up pagination cache
     */
    cleanupPaginationCache() {
        const now = Date.now();

        for (const [key, cached] of this.paginationCache.entries()) {
            if (now - cached.timestamp > this.cacheTimeout) {
                this.paginationCache.delete(key);
            }
        }
    }

    /**
     * Monitor memory usage and optimize if needed
     */
    monitorMemoryUsage() {
        if ('memory' in performance) {
            const memInfo = performance.memory;
            const usedMB = memInfo.usedJSHeapSize / 1024 / 1024;
            const limitMB = memInfo.jsHeapSizeLimit / 1024 / 1024;
            const usagePercent = (usedMB / limitMB) * 100;

            log(`Memory usage: ${usedMB.toFixed(2)}MB / ${limitMB.toFixed(2)}MB (${usagePercent.toFixed(1)}%)`, 'info');

            // If memory usage is high, force cleanup
            if (usagePercent > 80) {
                log('High memory usage detected, forcing cleanup', 'warn');
                this.forceMemoryCleanup();
            }
        }
    }

    /**
     * Force memory cleanup when usage is high
     */
    forceMemoryCleanup() {
        // Clear all caches
        this.searchCache.clear();
        this.paginationCache.clear();

        // Clear debounce timers
        this.debounceTimers.forEach(timer => clearTimeout(timer));
        this.debounceTimers.clear();

        // Trigger garbage collection if available
        if (window.gc) {
            window.gc();
        }

        log('Forced memory cleanup completed', 'info');
    }

    /**
     * Get performance metrics
     * @returns {Object} Performance metrics
     */
    getPerformanceMetrics() {
        const avgSearchTime = this.metrics.searchTimes.length > 0 ?
            this.metrics.searchTimes.reduce((a, b) => a + b, 0) / this.metrics.searchTimes.length : 0;

        const avgLoadTime = this.metrics.loadTimes.length > 0 ?
            this.metrics.loadTimes.reduce((a, b) => a + b, 0) / this.metrics.loadTimes.length : 0;

        const cacheHitRate = this.metrics.cacheHits + this.metrics.cacheMisses > 0 ?
            (this.metrics.cacheHits / (this.metrics.cacheHits + this.metrics.cacheMisses)) * 100 : 0;

        return {
            searchIndex: {
                size: this.searchIndex.size,
                memoryUsage: this.estimateIndexMemoryUsage()
            },
            cache: {
                searchCacheSize: this.searchCache.size,
                paginationCacheSize: this.paginationCache.size,
                hitRate: cacheHitRate.toFixed(2) + '%',
                hits: this.metrics.cacheHits,
                misses: this.metrics.cacheMisses
            },
            performance: {
                averageSearchTime: avgSearchTime.toFixed(2) + 'ms',
                averageLoadTime: avgLoadTime.toFixed(2) + 'ms',
                totalSearches: this.metrics.searchTimes.length,
                totalLoads: this.metrics.loadTimes.length
            },
            memory: {
                loadingIndicators: this.loadingIndicators.size,
                debounceTimers: this.debounceTimers.size
            }
        };
    }

    /**
     * Estimate memory usage of search index
     * @returns {string} Estimated memory usage
     */
    estimateIndexMemoryUsage() {
        let totalSize = 0;

        for (const [term, patientIds] of this.searchIndex.entries()) {
            totalSize += term.length * 2; // Approximate string size
            totalSize += patientIds.size * 36; // Approximate UUID size
        }

        return (totalSize / 1024).toFixed(2) + ' KB';
    }

    /**
     * Update search index when patient data changes
     * @param {Object} patient - Updated patient data
     * @param {string} operation - Operation type (create, update, delete)
     */
    updateSearchIndex(patient, operation) {
        try {
            if (operation === 'delete') {
                // Remove patient from all index entries
                for (const [term, patientIds] of this.searchIndex.entries()) {
                    patientIds.delete(patient.id);
                    if (patientIds.size === 0) {
                        this.searchIndex.delete(term);
                    }
                }
            } else {
                // Add or update patient in index
                this.indexPatient(patient);
            }

            // Clear related caches
            this.searchCache.clear();
            this.paginationCache.clear();

            log(`Search index updated for patient ${patient.id} (${operation})`, 'info');

        } catch (error) {
            log(`Failed to update search index: ${error.message}`, 'error');
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerformanceOptimizer;
}