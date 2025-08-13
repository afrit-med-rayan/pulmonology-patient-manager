/**
 * Logo Manager Component
 * Handles logo display, loading, and branding across the application
 */

class LogoManager {
    constructor() {
        this.logoFormats = ['svg', 'png', 'jpg', 'jpeg'];
        this.logoSizes = {
            small: { maxHeight: '40px', maxWidth: '120px' },
            medium: { maxHeight: '60px', maxWidth: '180px' },
            large: { maxHeight: '80px', maxWidth: '240px' },
            xlarge: { maxHeight: '120px', maxWidth: '360px' }
        };
        this.fallbackText = 'Dr. S. Sahboub';
        this.fallbackSubtext = 'Pulmonology Practice';
        this.logoCache = new Map();
        this.loadAttempts = new Map();
        this.maxRetries = 3;

        // Bind methods
        this.createLogo = this.createLogo.bind(this);
        this.loadLogo = this.loadLogo.bind(this);
        this.handleLogoError = this.handleLogoError.bind(this);
    }

    /**
     * Create a logo element with proper fallback handling
     * @param {Object} options - Logo configuration options
     * @returns {HTMLElement} Logo container element
     */
    createLogo(options = {}) {
        const {
            size = 'medium',
            showSubtext = false,
            className = '',
            id = '',
            alt = 'Dr. S. Sahboub Logo',
            priority = ['svg'],
            container = 'div',
            onClick = null,
            ariaLabel = 'Dr. S. Sahboub Pulmonology Practice Logo'
        } = options;

        // Create container element
        const logoContainer = document.createElement(container);
        logoContainer.className = `logo-container ${className}`.trim();
        if (id) logoContainer.id = id;

        // Add ARIA attributes for accessibility
        logoContainer.setAttribute('role', 'img');
        logoContainer.setAttribute('aria-label', ariaLabel);

        // Add click handler if provided
        if (onClick && typeof onClick === 'function') {
            logoContainer.style.cursor = 'pointer';
            logoContainer.addEventListener('click', onClick);
            logoContainer.setAttribute('tabindex', '0');
            logoContainer.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onClick(e);
                }
            });
        }

        // Create logo image element
        const logoImg = document.createElement('img');
        logoImg.className = `logo logo-${size}`;
        logoImg.alt = alt;
        logoImg.style.display = 'block';

        // Apply size constraints
        const sizeConfig = this.logoSizes[size] || this.logoSizes.medium;
        logoImg.style.maxHeight = sizeConfig.maxHeight;
        logoImg.style.maxWidth = sizeConfig.maxWidth;
        logoImg.style.height = 'auto';
        logoImg.style.width = 'auto';

        // Create fallback text elements
        const logoText = document.createElement('h1');
        logoText.className = `logo-text logo-text-${size}`;
        logoText.textContent = this.fallbackText;
        logoText.style.display = 'none';
        logoText.style.margin = '0';

        const logoSubtext = document.createElement('p');
        logoSubtext.className = `logo-subtext logo-subtext-${size}`;
        logoSubtext.textContent = this.fallbackSubtext;
        logoSubtext.style.display = 'none';
        logoSubtext.style.margin = '0';
        logoSubtext.style.fontSize = '0.8em';
        logoSubtext.style.opacity = '0.7';

        // Set up error handling
        logoImg.addEventListener('error', () => {
            this.handleLogoError(logoImg, logoText, logoSubtext, showSubtext, priority);
        });

        // Set up load success handling
        logoImg.addEventListener('load', () => {
            console.log(`Logo loaded successfully: ${logoImg.src}`);
            logoImg.style.display = 'block';
            logoText.style.display = 'none';
            logoSubtext.style.display = 'none';
        });

        // Append elements to container
        logoContainer.appendChild(logoImg);
        logoContainer.appendChild(logoText);
        if (showSubtext) {
            logoContainer.appendChild(logoSubtext);
        }

        // Start loading logo with fallback to SVG only if PNG priority fails
        const safePriority = priority.filter(format => format === 'svg' || this.logoCache.has(format));
        if (safePriority.length === 0) {
            safePriority.push('svg'); // Always try SVG as last resort
        }
        this.loadLogo(logoImg, safePriority);

        return logoContainer;
    }

    /**
     * Load logo with format priority and caching
     * @param {HTMLImageElement} imgElement - Image element to load logo into
     * @param {Array} formatPriority - Array of formats to try in order
     */
    async loadLogo(imgElement, formatPriority = ['svg', 'png']) {
        // Check cache first for any of the priority formats
        for (const format of formatPriority) {
            if (this.logoCache.has(format)) {
                const cachedSrc = this.logoCache.get(format);
                if (cachedSrc) {
                    imgElement.src = cachedSrc;
                    console.log(`Logo loaded from cache: ${cachedSrc}`);
                    return;
                }
            }
        }

        // Try each format in priority order
        for (const format of formatPriority) {
            const logoPath = `assets/logo.${format}`;

            try {
                const exists = await this.checkFileExists(logoPath);
                if (exists) {
                    imgElement.src = logoPath;
                    this.logoCache.set(format, logoPath);
                    console.log(`Logo loaded: ${logoPath}`);
                    return;
                }
            } catch (error) {
                console.warn(`Failed to check logo format ${format}:`, error);
                continue;
            }
        }

        // If no formats work, trigger error handling
        console.warn(`No logo formats available from: ${formatPriority.join(', ')}`);
        imgElement.dispatchEvent(new Event('error'));
    }

    /**
     * Check if a file exists
     * @param {string} url - URL to check
     * @returns {Promise<boolean>} True if file exists
     */
    checkFileExists(url) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                resolve(true);
            };
            img.onerror = () => {
                // Silently handle missing files without console errors
                resolve(false);
            };

            // Set src after event handlers to avoid race conditions
            try {
                img.src = url;
            } catch (error) {
                resolve(false);
            }
        });
    }

    /**
     * Handle logo loading errors with fallback
     * @param {HTMLImageElement} imgElement - Failed image element
     * @param {HTMLElement} textElement - Fallback text element
     * @param {HTMLElement} subtextElement - Fallback subtext element
     * @param {boolean} showSubtext - Whether to show subtext
     * @param {Array} formatPriority - Formats that were attempted
     */
    handleLogoError(imgElement, textElement, subtextElement, showSubtext, formatPriority) {
        const attemptKey = formatPriority.join('-');
        const attempts = this.loadAttempts.get(attemptKey) || 0;

        if (attempts < this.maxRetries) {
            // Retry loading
            this.loadAttempts.set(attemptKey, attempts + 1);
            console.warn(`Logo load failed, retrying... (attempt ${attempts + 1}/${this.maxRetries})`);

            setTimeout(() => {
                this.loadLogo(imgElement, formatPriority);
            }, 1000 * (attempts + 1)); // Exponential backoff

            return;
        }

        // Max retries reached, show fallback
        console.warn('Logo loading failed after max retries, showing text fallback');
        imgElement.style.display = 'none';
        textElement.style.display = 'block';

        if (showSubtext) {
            subtextElement.style.display = 'block';
        }

        // Apply fallback styling
        this.applyFallbackStyling(textElement, subtextElement);
    }

    /**
     * Apply styling to fallback text elements
     * @param {HTMLElement} textElement - Main text element
     * @param {HTMLElement} subtextElement - Subtext element
     */
    applyFallbackStyling(textElement, subtextElement) {
        // Main text styling
        textElement.style.fontFamily = 'Arial, sans-serif';
        textElement.style.fontWeight = 'bold';
        textElement.style.color = 'var(--primary-color, #2c5aa0)';
        textElement.style.textShadow = '0 1px 2px rgba(0, 0, 0, 0.1)';
        textElement.style.lineHeight = '1.2';

        // Subtext styling
        if (subtextElement) {
            subtextElement.style.fontFamily = 'Arial, sans-serif';
            subtextElement.style.fontWeight = 'normal';
            subtextElement.style.color = 'var(--text-secondary, #6c757d)';
            subtextElement.style.fontSize = '0.75em';
            subtextElement.style.fontStyle = 'italic';
            subtextElement.style.marginTop = '0.25em';
        }
    }

    /**
     * Create a logo for the login page
     * @param {Object} options - Logo options
     * @returns {HTMLElement} Login logo element
     */
    createLoginLogo(options = {}) {
        return this.createLogo({
            size: 'large',
            showSubtext: true,
            className: 'login-logo',
            alt: 'Dr. S. Sahboub Pulmonology Practice',
            ariaLabel: 'Dr. S. Sahboub Pulmonology Practice - Login',
            ...options
        });
    }

    /**
     * Create a logo for the main application header
     * @param {Object} options - Logo options
     * @returns {HTMLElement} Header logo element
     */
    createHeaderLogo(options = {}) {
        return this.createLogo({
            size: 'medium',
            showSubtext: false,
            className: 'header-logo',
            alt: 'Dr. S. Sahboub Logo',
            ariaLabel: 'Dr. S. Sahboub Pulmonology Practice',
            onClick: options.onClick,
            ...options
        });
    }

    /**
     * Create a small logo for compact spaces
     * @param {Object} options - Logo options
     * @returns {HTMLElement} Small logo element
     */
    createSmallLogo(options = {}) {
        return this.createLogo({
            size: 'small',
            showSubtext: false,
            className: 'small-logo',
            alt: 'Dr. S. Sahboub',
            ariaLabel: 'Dr. S. Sahboub',
            ...options
        });
    }

    /**
     * Update logo across all instances in the page
     * @param {string} newLogoPath - Path to new logo file
     */
    updateAllLogos(newLogoPath) {
        const logoImages = document.querySelectorAll('.logo');
        logoImages.forEach(img => {
            if (img.tagName === 'IMG') {
                img.src = newLogoPath;
            }
        });

        // Clear cache to force reload
        this.logoCache.clear();
        this.loadAttempts.clear();
    }

    /**
     * Get logo information and status
     * @returns {Object} Logo status information
     */
    getLogoStatus() {
        return {
            cacheSize: this.logoCache.size,
            cachedLogos: Array.from(this.logoCache.entries()),
            loadAttempts: Array.from(this.loadAttempts.entries()),
            supportedFormats: this.logoFormats,
            availableSizes: Object.keys(this.logoSizes),
            fallbackText: this.fallbackText,
            fallbackSubtext: this.fallbackSubtext
        };
    }

    /**
     * Preload logos for better performance
     * @param {Array} formats - Formats to preload
     */
    async preloadLogos(formats = ['svg', 'png']) {
        console.log('Preloading logos...');
        const preloadPromises = formats.map(format => {
            const logoPath = `assets/logo.${format}`;
            return this.checkFileExists(logoPath).then(exists => {
                if (exists) {
                    this.logoCache.set(format, logoPath);
                    console.log(`Preloaded logo: ${logoPath}`);
                } else {
                    console.log(`Logo format ${format} not available: ${logoPath}`);
                }
                return { format, exists, path: logoPath };
            }).catch(error => {
                console.warn(`Error checking logo format ${format}:`, error);
                return { format, exists: false, path: logoPath, error: error.message };
            });
        });

        const results = await Promise.all(preloadPromises);
        const availableFormats = results.filter(r => r.exists).map(r => r.format);
        console.log(`Logo preload complete. Available formats: ${availableFormats.join(', ')}`);
        return results;
    }

    /**
     * Auto-detect available logo formats
     * @returns {Promise<Array>} Array of available formats
     */
    async detectAvailableFormats() {
        console.log('Detecting available logo formats...');
        const results = await this.preloadLogos(this.logoFormats);
        return results.filter(r => r.exists).map(r => r.format);
    }

    /**
     * Clear logo cache
     */
    clearCache() {
        this.logoCache.clear();
        this.loadAttempts.clear();
        console.log('Logo cache cleared');
    }

    /**
     * Set custom fallback text
     * @param {string} text - Main fallback text
     * @param {string} subtext - Subtext fallback
     */
    setFallbackText(text, subtext = '') {
        this.fallbackText = text;
        this.fallbackSubtext = subtext;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LogoManager;
}