/**
 * Application Constants
 * Central location for all application constants and configuration values
 */

// Application Configuration
const APP_CONFIG = {
    name: 'Patient Management System',
    version: '1.0.0',
    author: 'Dr. S. Sahboub',
    description: 'Local Patient Management System for Pulmonology Practice'
};

// Storage Configuration
const STORAGE_CONFIG = {
    dataDirectory: 'C:\\PneumoApp\\Patients\\',
    assetsDirectory: 'C:\\PneumoApp\\assets\\',
    backupDirectory: 'C:\\PneumoApp\\backups\\',
    logoPath: 'assets/logo.svg',
    faviconPath: 'assets/favicon.ico'
};

// Authentication Configuration
const AUTH_CONFIG = {
    sessionTimeout: 8 * 60 * 60 * 1000, // 8 hours in milliseconds
    maxLoginAttempts: 5,
    lockoutDuration: 15 * 60 * 1000, // 15 minutes in milliseconds
    sessionStorageKey: 'pms_session',
    credentialsStorageKey: 'pms_credentials'
};

// UI Configuration
const UI_CONFIG = {
    toastDuration: 5000, // 5 seconds
    loadingDelay: 500, // 500ms
    animationDuration: 300, // 300ms
    searchDebounceDelay: 300, // 300ms
    autoSaveInterval: 30000 // 30 seconds
};

// Form Validation Rules
const VALIDATION_RULES = {
    patient: {
        firstName: {
            required: true,
            minLength: 2,
            maxLength: 50,
            pattern: /^[a-zA-Z\s\-']+$/
        },
        lastName: {
            required: true,
            minLength: 2,
            maxLength: 50,
            pattern: /^[a-zA-Z\s\-']+$/
        },
        dateOfBirth: {
            required: false,
            maxDate: new Date()
        },
        placeOfResidence: {
            required: false,
            minLength: 2,
            maxLength: 100
        },
        age: {
            required: false,
            min: 0,
            max: 150
        },
        atcdsMedicaux: {
            required: false,
            maxLength: 2000
        },
        atcdsChirurgicaux: {
            required: false,
            maxLength: 2000
        }
    }
};

// Error Messages
const ERROR_MESSAGES = {
    auth: {
        invalidCredentials: 'Invalid username or password',
        sessionExpired: 'Your session has expired. Please log in again.',
        accessDenied: 'Access denied. Please log in.',
        tooManyAttempts: 'Too many login attempts. Please try again later.'
    },
    storage: {
        saveError: 'Failed to save data. Please try again.',
        loadError: 'Failed to load data. Please refresh the page.',
        deleteError: 'Failed to delete record. Please try again.',
        accessError: 'Unable to access local storage. Please check permissions.',
        corruptData: 'Data appears to be corrupted. Please contact support.'
    },
    validation: {
        required: 'This field is required',
        minLength: 'Must be at least {min} characters long',
        maxLength: 'Must be no more than {max} characters long',
        pattern: 'Please enter a valid value',
        email: 'Please enter a valid email address',
        date: 'Please enter a valid date',
        future: 'Date cannot be in the future'
    },
    network: {
        offline: 'You are currently offline',
        timeout: 'Request timed out. Please try again.',
        serverError: 'Server error. Please try again later.'
    }
};

// Success Messages
const SUCCESS_MESSAGES = {
    patient: {
        created: 'Patient record created successfully',
        updated: 'Patient record updated successfully',
        deleted: 'Patient record deleted successfully'
    },
    auth: {
        loginSuccess: 'Welcome back!',
        logoutSuccess: 'You have been logged out successfully'
    },
    general: {
        saved: 'Changes saved successfully',
        deleted: 'Item deleted successfully',
        copied: 'Copied to clipboard'
    }
};

// Routes Configuration
const ROUTES = {
    login: '#/login',
    dashboard: '#/dashboard',
    patients: {
        list: '#/patients',
        create: '#/patients/create',
        view: '#/patients/view/:id',
        edit: '#/patients/edit/:id'
    }
};

// Patient Data Structure
const PATIENT_SCHEMA = {
    id: '',
    firstName: '',
    lastName: '',
    dateOfBirth: null,
    age: 0,
    placeOfResidence: '',
    gender: '',
    visits: [],
    createdAt: null,
    updatedAt: null
};

// Visit Data Structure
const VISIT_SCHEMA = {
    id: '',
    visitDate: null,
    medications: '',
    observations: '',
    additionalComments: '',
    createdAt: null
};

// Export constants for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        APP_CONFIG,
        STORAGE_CONFIG,
        AUTH_CONFIG,
        UI_CONFIG,
        VALIDATION_RULES,
        ERROR_MESSAGES,
        SUCCESS_MESSAGES,
        ROUTES,
        PATIENT_SCHEMA,
        VISIT_SCHEMA
    };
}