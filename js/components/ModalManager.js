/**
 * Modal Manager Component
 * Handles modal dialogs and confirmations
 */

class ModalManager {
    constructor() {
        this.activeModals = new Map();
        this.modalContainer = null;
        this.initialize();
    }

    /**
     * Initialize modal manager
     */
    initialize() {
        // Get or create modal container
        this.modalContainer = document.getElementById('modal-container');
        if (!this.modalContainer) {
            this.modalContainer = document.createElement('div');
            this.modalContainer.id = 'modal-container';
            this.modalContainer.className = 'modal-container hidden';
            document.body.appendChild(this.modalContainer);
        }

        // Set up global event listeners
        this.setupEventListeners();
    }

    /**
     * Set up event listeners for modal interactions
     */
    setupEventListeners() {
        // Close modal on backdrop click
        this.modalContainer.addEventListener('click', (event) => {
            if (event.target === this.modalContainer) {
                this.closeTopModal();
            }
        });

        // Handle escape key
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && this.activeModals.size > 0) {
                this.closeTopModal();
            }
        });
    }

    /**
     * Show logout confirmation modal
     * @param {Object} options - Modal options
     * @returns {Promise} Promise that resolves with user choice
     */
    showLogoutConfirmation(options = {}) {
        const modalId = 'logout-confirmation';

        return new Promise((resolve) => {
            const modalHtml = `
                <div class="modal-backdrop">
                    <div class="modal-dialog logout-confirmation-modal">
                        <div class="modal-header">
                            <h3 class="modal-title">Unsaved Changes Detected</h3>
                        </div>
                        <div class="modal-body">
                            <div class="modal-icon warning">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                                    <line x1="12" y1="9" x2="12" y2="13"/>
                                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                                </svg>
                            </div>
                            <p class="modal-message">
                                You have unsaved changes that will be lost if you logout now. 
                                What would you like to do?
                            </p>
                            ${options.changesDetails ? `
                                <div class="changes-details">
                                    <p><strong>Unsaved changes in:</strong></p>
                                    <ul>
                                        ${options.changesDetails.map(detail => `<li>${detail}</li>`).join('')}
                                    </ul>
                                </div>
                            ` : ''}
                        </div>
                        <div class="modal-actions">
                            <button type="button" class="btn btn-primary save-and-exit-btn" data-action="save-and-exit">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                                    <polyline points="17,21 17,13 7,13 7,21"/>
                                    <polyline points="7,3 7,8 15,8"/>
                                </svg>
                                Save and Exit
                            </button>
                            <button type="button" class="btn btn-danger exit-without-saving-btn" data-action="exit-without-saving">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                                    <polyline points="16,17 21,12 16,7"/>
                                    <line x1="21" y1="12" x2="9" y2="12"/>
                                </svg>
                                Exit Without Saving
                            </button>
                            <button type="button" class="btn btn-secondary cancel-btn" data-action="cancel">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="18" y1="6" x2="6" y2="18"/>
                                    <line x1="6" y1="6" x2="18" y2="18"/>
                                </svg>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            `;

            this.showModal(modalId, modalHtml, {
                closable: false,
                onAction: (action) => {
                    this.closeModal(modalId);
                    resolve(action);
                }
            });
        });
    }

    /**
     * Show a generic confirmation modal
     * @param {Object} options - Modal options
     * @returns {Promise} Promise that resolves with user choice
     */
    showConfirmation(options = {}) {
        const modalId = options.id || 'confirmation-modal';
        const title = options.title || 'Confirm Action';
        const message = options.message || 'Are you sure you want to proceed?';
        const confirmText = options.confirmText || 'Confirm';
        const cancelText = options.cancelText || 'Cancel';
        const type = options.type || 'info'; // info, warning, danger

        return new Promise((resolve) => {
            const modalHtml = `
                <div class="modal-backdrop">
                    <div class="modal-dialog confirmation-modal">
                        <div class="modal-header">
                            <h3 class="modal-title">${title}</h3>
                        </div>
                        <div class="modal-body">
                            <div class="modal-icon ${type}">
                                ${this.getIconSvg(type)}
                            </div>
                            <p class="modal-message">${message}</p>
                        </div>
                        <div class="modal-actions">
                            <button type="button" class="btn btn-primary confirm-btn" data-action="confirm">
                                ${confirmText}
                            </button>
                            <button type="button" class="btn btn-secondary cancel-btn" data-action="cancel">
                                ${cancelText}
                            </button>
                        </div>
                    </div>
                </div>
            `;

            this.showModal(modalId, modalHtml, {
                closable: true,
                onAction: (action) => {
                    this.closeModal(modalId);
                    resolve(action === 'confirm');
                }
            });
        });
    }

    /**
     * Show a modal
     * @param {string} modalId - Unique modal identifier
     * @param {string} html - Modal HTML content
     * @param {Object} options - Modal options
     */
    showModal(modalId, html, options = {}) {
        // Close existing modal with same ID
        if (this.activeModals.has(modalId)) {
            this.closeModal(modalId);
        }

        // Create modal element
        const modalElement = document.createElement('div');
        modalElement.className = 'modal';
        modalElement.dataset.modalId = modalId;
        modalElement.innerHTML = html;

        // Store modal reference
        this.activeModals.set(modalId, {
            element: modalElement,
            options: options
        });

        // Add to container
        this.modalContainer.appendChild(modalElement);
        this.modalContainer.classList.remove('hidden');

        // Set up action handlers
        if (options.onAction) {
            modalElement.addEventListener('click', (event) => {
                const action = event.target.dataset.action;
                if (action) {
                    event.preventDefault();
                    event.stopPropagation();
                    options.onAction(action);
                }
            });
        }

        // Focus first button
        setTimeout(() => {
            const firstButton = modalElement.querySelector('button');
            if (firstButton) {
                firstButton.focus();
            }
        }, 100);

        // Add animation class
        setTimeout(() => {
            modalElement.classList.add('modal-show');
        }, 10);
    }

    /**
     * Close a specific modal
     * @param {string} modalId - Modal identifier
     */
    closeModal(modalId) {
        const modal = this.activeModals.get(modalId);
        if (!modal) return;

        // Add closing animation
        modal.element.classList.add('modal-hide');

        // Remove after animation
        setTimeout(() => {
            if (modal.element.parentNode) {
                modal.element.parentNode.removeChild(modal.element);
            }
            this.activeModals.delete(modalId);

            // Hide container if no modals remain
            if (this.activeModals.size === 0) {
                this.modalContainer.classList.add('hidden');
            }
        }, 200);
    }

    /**
     * Close the topmost modal
     */
    closeTopModal() {
        if (this.activeModals.size === 0) return;

        // Get the last modal added (topmost)
        const modalIds = Array.from(this.activeModals.keys());
        const topModalId = modalIds[modalIds.length - 1];
        const topModal = this.activeModals.get(topModalId);

        // Only close if closable
        if (topModal.options.closable !== false) {
            this.closeModal(topModalId);
        }
    }

    /**
     * Close all modals
     */
    closeAllModals() {
        const modalIds = Array.from(this.activeModals.keys());
        modalIds.forEach(modalId => this.closeModal(modalId));
    }

    /**
     * Get icon SVG for modal type
     * @param {string} type - Modal type
     * @returns {string} SVG HTML
     */
    getIconSvg(type) {
        const icons = {
            info: `
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="16" x2="12" y2="12"/>
                    <line x1="12" y1="8" x2="12.01" y2="8"/>
                </svg>
            `,
            warning: `
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
            `,
            danger: `
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
            `,
            success: `
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22,4 12,14.01 9,11.01"/>
                </svg>
            `
        };

        return icons[type] || icons.info;
    }

    /**
     * Check if any modals are currently open
     * @returns {boolean} True if modals are open
     */
    hasOpenModals() {
        return this.activeModals.size > 0;
    }

    /**
     * Get count of open modals
     * @returns {number} Number of open modals
     */
    getOpenModalCount() {
        return this.activeModals.size;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ModalManager;
}