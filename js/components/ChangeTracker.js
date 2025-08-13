/**
 * Change Tracker Component
 * Tracks unsaved changes across all forms and components in the application
 */

class ChangeTracker {
    constructor() {
        this.trackedForms = new Map();
        this.trackedComponents = new Map();
        this.globalChangeListeners = new Set();
        this.isEnabled = true;

        // Bind methods
        this.trackForm = this.trackForm.bind(this);
        this.untrackForm = this.untrackForm.bind(this);
        this.hasUnsavedChanges = this.hasUnsavedChanges.bind(this);
        this.getUnsavedChangesDetails = this.getUnsavedChangesDetails.bind(this);
    }

    /**
     * Enable or disable change tracking
     * @param {boolean} enabled - Whether to enable tracking
     */
    setEnabled(enabled) {
        this.isEnabled = enabled;
        if (!enabled) {
            this.clearAllTracking();
        }
    }

    /**
     * Track changes in a form
     * @param {string} formId - Unique form identifier
     * @param {Object} options - Tracking options
     */
    trackForm(formId, options = {}) {
        if (!this.isEnabled) return;

        const formElement = document.getElementById(formId);
        if (!formElement) {
            console.warn(`Form with ID ${formId} not found`);
            return;
        }

        // Store form tracking info
        const trackingInfo = {
            formId,
            formElement,
            originalData: this.getFormData(formElement),
            hasChanges: false,
            displayName: options.displayName || formId,
            description: options.description || `Form: ${formId}`,
            onChangeCallback: options.onChangeCallback,
            lastModified: null,
            changeCount: 0
        };

        this.trackedForms.set(formId, trackingInfo);

        // Set up event listeners
        this.setupFormEventListeners(trackingInfo);

        console.log(`Started tracking form: ${formId}`);
    }

    /**
     * Stop tracking a form
     * @param {string} formId - Form identifier
     */
    untrackForm(formId) {
        const trackingInfo = this.trackedForms.get(formId);
        if (!trackingInfo) return;

        // Remove event listeners
        this.removeFormEventListeners(trackingInfo);

        // Remove from tracking
        this.trackedForms.delete(formId);

        console.log(`Stopped tracking form: ${formId}`);
    }

    /**
     * Track changes in a custom component
     * @param {string} componentId - Unique component identifier
     * @param {Object} options - Tracking options
     */
    trackComponent(componentId, options = {}) {
        if (!this.isEnabled) return;

        const trackingInfo = {
            componentId,
            hasChanges: false,
            displayName: options.displayName || componentId,
            description: options.description || `Component: ${componentId}`,
            checkChangesCallback: options.checkChangesCallback,
            getDataCallback: options.getDataCallback,
            lastModified: null,
            changeCount: 0
        };

        this.trackedComponents.set(componentId, trackingInfo);

        console.log(`Started tracking component: ${componentId}`);
    }

    /**
     * Stop tracking a component
     * @param {string} componentId - Component identifier
     */
    untrackComponent(componentId) {
        this.trackedComponents.delete(componentId);
        console.log(`Stopped tracking component: ${componentId}`);
    }

    /**
     * Mark a form as having changes
     * @param {string} formId - Form identifier
     * @param {boolean} hasChanges - Whether form has changes
     */
    markFormChanged(formId, hasChanges = true) {
        const trackingInfo = this.trackedForms.get(formId);
        if (!trackingInfo) return;

        const previousState = trackingInfo.hasChanges;
        trackingInfo.hasChanges = hasChanges;
        trackingInfo.lastModified = hasChanges ? new Date() : null;

        if (hasChanges) {
            trackingInfo.changeCount++;
        }

        // Notify listeners if state changed
        if (previousState !== hasChanges) {
            this.notifyChangeListeners();
        }
    }

    /**
     * Mark a component as having changes
     * @param {string} componentId - Component identifier
     * @param {boolean} hasChanges - Whether component has changes
     */
    markComponentChanged(componentId, hasChanges = true) {
        const trackingInfo = this.trackedComponents.get(componentId);
        if (!trackingInfo) return;

        const previousState = trackingInfo.hasChanges;
        trackingInfo.hasChanges = hasChanges;
        trackingInfo.lastModified = hasChanges ? new Date() : null;

        if (hasChanges) {
            trackingInfo.changeCount++;
        }

        // Notify listeners if state changed
        if (previousState !== hasChanges) {
            this.notifyChangeListeners();
        }
    }

    /**
     * Check if any tracked forms or components have unsaved changes
     * @returns {boolean} True if there are unsaved changes
     */
    hasUnsavedChanges() {
        if (!this.isEnabled) return false;

        // Check forms
        for (const [formId, trackingInfo] of this.trackedForms) {
            if (this.checkFormChanges(trackingInfo)) {
                return true;
            }
        }

        // Check components
        for (const [componentId, trackingInfo] of this.trackedComponents) {
            if (this.checkComponentChanges(trackingInfo)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Get details about unsaved changes
     * @returns {Object} Details about unsaved changes
     */
    getUnsavedChangesDetails() {
        const details = {
            hasChanges: false,
            forms: [],
            components: [],
            totalChanges: 0,
            descriptions: []
        };

        // Check forms
        for (const [formId, trackingInfo] of this.trackedForms) {
            if (this.checkFormChanges(trackingInfo)) {
                details.hasChanges = true;
                details.forms.push({
                    id: formId,
                    displayName: trackingInfo.displayName,
                    description: trackingInfo.description,
                    lastModified: trackingInfo.lastModified,
                    changeCount: trackingInfo.changeCount
                });
                details.descriptions.push(trackingInfo.displayName);
                details.totalChanges += trackingInfo.changeCount;
            }
        }

        // Check components
        for (const [componentId, trackingInfo] of this.trackedComponents) {
            if (this.checkComponentChanges(trackingInfo)) {
                details.hasChanges = true;
                details.components.push({
                    id: componentId,
                    displayName: trackingInfo.displayName,
                    description: trackingInfo.description,
                    lastModified: trackingInfo.lastModified,
                    changeCount: trackingInfo.changeCount
                });
                details.descriptions.push(trackingInfo.displayName);
                details.totalChanges += trackingInfo.changeCount;
            }
        }

        return details;
    }

    /**
     * Mark all tracked items as saved (clear unsaved changes)
     */
    markAllAsSaved() {
        // Clear form changes
        for (const [formId, trackingInfo] of this.trackedForms) {
            trackingInfo.hasChanges = false;
            trackingInfo.originalData = this.getFormData(trackingInfo.formElement);
            trackingInfo.lastModified = null;
            trackingInfo.changeCount = 0;
        }

        // Clear component changes
        for (const [componentId, trackingInfo] of this.trackedComponents) {
            trackingInfo.hasChanges = false;
            trackingInfo.lastModified = null;
            trackingInfo.changeCount = 0;
        }

        this.notifyChangeListeners();
    }

    /**
     * Mark a specific form as saved
     * @param {string} formId - Form identifier
     */
    markFormAsSaved(formId) {
        const trackingInfo = this.trackedForms.get(formId);
        if (!trackingInfo) return;

        trackingInfo.hasChanges = false;
        trackingInfo.originalData = this.getFormData(trackingInfo.formElement);
        trackingInfo.lastModified = null;
        trackingInfo.changeCount = 0;

        this.notifyChangeListeners();
    }

    /**
     * Mark a specific component as saved
     * @param {string} componentId - Component identifier
     */
    markComponentAsSaved(componentId) {
        const trackingInfo = this.trackedComponents.get(componentId);
        if (!trackingInfo) return;

        trackingInfo.hasChanges = false;
        trackingInfo.lastModified = null;
        trackingInfo.changeCount = 0;

        this.notifyChangeListeners();
    }

    /**
     * Add a global change listener
     * @param {Function} callback - Callback function
     */
    addChangeListener(callback) {
        this.globalChangeListeners.add(callback);
    }

    /**
     * Remove a global change listener
     * @param {Function} callback - Callback function
     */
    removeChangeListener(callback) {
        this.globalChangeListeners.delete(callback);
    }

    /**
     * Clear all tracking
     */
    clearAllTracking() {
        // Remove all form event listeners
        for (const [formId, trackingInfo] of this.trackedForms) {
            this.removeFormEventListeners(trackingInfo);
        }

        this.trackedForms.clear();
        this.trackedComponents.clear();
        this.notifyChangeListeners();
    }

    /**
     * Set up event listeners for a form
     * @param {Object} trackingInfo - Form tracking information
     */
    setupFormEventListeners(trackingInfo) {
        const { formElement } = trackingInfo;

        // Create bound event handler
        const changeHandler = () => {
            this.handleFormChange(trackingInfo);
        };

        // Store handler reference for cleanup
        trackingInfo.changeHandler = changeHandler;

        // Listen for various change events
        const events = ['input', 'change', 'keyup', 'paste'];
        events.forEach(eventType => {
            formElement.addEventListener(eventType, changeHandler);
        });

        // Store event info for cleanup
        trackingInfo.eventTypes = events;
    }

    /**
     * Remove event listeners for a form
     * @param {Object} trackingInfo - Form tracking information
     */
    removeFormEventListeners(trackingInfo) {
        const { formElement, changeHandler, eventTypes } = trackingInfo;

        if (changeHandler && eventTypes) {
            eventTypes.forEach(eventType => {
                formElement.removeEventListener(eventType, changeHandler);
            });
        }
    }

    /**
     * Handle form change event
     * @param {Object} trackingInfo - Form tracking information
     */
    handleFormChange(trackingInfo) {
        // Debounce change detection
        if (trackingInfo.changeTimeout) {
            clearTimeout(trackingInfo.changeTimeout);
        }

        trackingInfo.changeTimeout = setTimeout(() => {
            const hasChanges = this.checkFormChanges(trackingInfo);
            const previousState = trackingInfo.hasChanges;

            trackingInfo.hasChanges = hasChanges;
            if (hasChanges) {
                trackingInfo.lastModified = new Date();
                trackingInfo.changeCount++;
            }

            // Call custom callback if provided
            if (trackingInfo.onChangeCallback) {
                trackingInfo.onChangeCallback(hasChanges, trackingInfo);
            }

            // Notify listeners if state changed
            if (previousState !== hasChanges) {
                this.notifyChangeListeners();
            }
        }, 300); // 300ms debounce
    }

    /**
     * Check if a form has changes
     * @param {Object} trackingInfo - Form tracking information
     * @returns {boolean} True if form has changes
     */
    checkFormChanges(trackingInfo) {
        const currentData = this.getFormData(trackingInfo.formElement);
        return !this.isEqual(currentData, trackingInfo.originalData);
    }

    /**
     * Check if a component has changes
     * @param {Object} trackingInfo - Component tracking information
     * @returns {boolean} True if component has changes
     */
    checkComponentChanges(trackingInfo) {
        if (trackingInfo.checkChangesCallback) {
            return trackingInfo.checkChangesCallback();
        }
        return trackingInfo.hasChanges;
    }

    /**
     * Get form data as object
     * @param {Element} formElement - Form element
     * @returns {Object} Form data
     */
    getFormData(formElement) {
        const formData = new FormData(formElement);
        const data = {};

        for (const [key, value] of formData.entries()) {
            if (key.includes('[')) {
                // Handle array fields (like visits)
                const match = key.match(/(\w+)\[(\d+)\]\[(\w+)\]/);
                if (match) {
                    const [, arrayName, index, fieldName] = match;
                    if (!data[arrayName]) data[arrayName] = [];
                    if (!data[arrayName][index]) data[arrayName][index] = {};
                    data[arrayName][index][fieldName] = value;
                }
            } else {
                data[key] = value;
            }
        }

        return data;
    }

    /**
     * Deep equality check for objects
     * @param {*} obj1 - First object
     * @param {*} obj2 - Second object
     * @returns {boolean} True if objects are equal
     */
    isEqual(obj1, obj2) {
        if (obj1 === obj2) return true;
        if (obj1 == null || obj2 == null) return false;
        if (typeof obj1 !== typeof obj2) return false;

        if (typeof obj1 === 'object') {
            const keys1 = Object.keys(obj1);
            const keys2 = Object.keys(obj2);

            if (keys1.length !== keys2.length) return false;

            for (const key of keys1) {
                if (!keys2.includes(key)) return false;
                if (!this.isEqual(obj1[key], obj2[key])) return false;
            }

            return true;
        }

        return obj1 === obj2;
    }

    /**
     * Notify all change listeners
     */
    notifyChangeListeners() {
        const hasChanges = this.hasUnsavedChanges();
        const details = this.getUnsavedChangesDetails();

        this.globalChangeListeners.forEach(callback => {
            try {
                callback(hasChanges, details);
            } catch (error) {
                console.error('Error in change listener:', error);
            }
        });
    }

    /**
     * Get tracking statistics
     * @returns {Object} Tracking statistics
     */
    getTrackingStats() {
        return {
            isEnabled: this.isEnabled,
            trackedFormsCount: this.trackedForms.size,
            trackedComponentsCount: this.trackedComponents.size,
            hasUnsavedChanges: this.hasUnsavedChanges(),
            totalChangeListeners: this.globalChangeListeners.size,
            trackedForms: Array.from(this.trackedForms.keys()),
            trackedComponents: Array.from(this.trackedComponents.keys())
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChangeTracker;
}