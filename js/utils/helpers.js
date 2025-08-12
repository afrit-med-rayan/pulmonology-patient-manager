/**
 * Utility Helper Functions
 * Common utility functions used throughout the application
 */

/**
 * Generate a unique ID (UUID v4)
 * @returns {string} Unique identifier
 */
function generateId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

/**
 * Format date for display
 * @param {Date|string} date - Date to format
 * @param {string} format - Format type ('short', 'long', 'time')
 * @returns {string} Formatted date string
 */
function formatDate(date, format = 'short') {
    if (!date) return '';

    const dateObj = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(dateObj.getTime())) return '';

    const options = {
        short: { year: 'numeric', month: '2-digit', day: '2-digit' },
        long: { year: 'numeric', month: 'long', day: 'numeric' },
        time: { hour: '2-digit', minute: '2-digit' }
    };

    return dateObj.toLocaleDateString('en-US', options[format] || options.short);
}

/**
 * Calculate age from date of birth
 * @param {Date|string} dateOfBirth - Date of birth
 * @returns {number} Age in years
 */
function calculateAge(dateOfBirth) {
    if (!dateOfBirth) return 0;

    const birthDate = typeof dateOfBirth === 'string' ? new Date(dateOfBirth) : dateOfBirth;
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    return age;
}

/**
 * Sanitize HTML to prevent XSS attacks
 * @param {string} html - HTML string to sanitize
 * @returns {string} Sanitized HTML string
 */
function sanitizeHtml(html) {
    if (!html) return '';

    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
}

/**
 * Debounce function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Deep clone an object
 * @param {Object} obj - Object to clone
 * @returns {Object} Cloned object
 */
function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => deepClone(item));
    if (typeof obj === 'object') {
        const clonedObj = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                clonedObj[key] = deepClone(obj[key]);
            }
        }
        return clonedObj;
    }
}

/**
 * Check if two objects are equal (deep comparison)
 * @param {*} obj1 - First object
 * @param {*} obj2 - Second object
 * @returns {boolean} True if objects are equal
 */
function isEqual(obj1, obj2) {
    if (obj1 === obj2) return true;
    if (obj1 == null || obj2 == null) return false;
    if (typeof obj1 !== typeof obj2) return false;

    if (typeof obj1 === 'object') {
        const keys1 = Object.keys(obj1);
        const keys2 = Object.keys(obj2);

        if (keys1.length !== keys2.length) return false;

        for (const key of keys1) {
            if (!keys2.includes(key) || !isEqual(obj1[key], obj2[key])) {
                return false;
            }
        }
        return true;
    }

    return false;
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if email is valid
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Capitalize first letter of each word
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
function capitalizeWords(str) {
    if (!str) return '';
    return str.replace(/\w\S*/g, (txt) =>
        txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
}

/**
 * Format file size in human readable format
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted size string
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Get current timestamp
 * @returns {number} Current timestamp
 */
function getCurrentTimestamp() {
    return Date.now();
}

/**
 * Format timestamp for display
 * @param {number} timestamp - Timestamp to format
 * @returns {string} Formatted timestamp
 */
function formatTimestamp(timestamp) {
    return formatDate(new Date(timestamp), 'long') + ' at ' + formatDate(new Date(timestamp), 'time');
}

/**
 * Check if string contains search term (case insensitive)
 * @param {string} str - String to search in
 * @param {string} searchTerm - Term to search for
 * @returns {boolean} True if string contains search term
 */
function containsSearchTerm(str, searchTerm) {
    if (!str || !searchTerm) return false;
    return str.toLowerCase().includes(searchTerm.toLowerCase());
}

/**
 * Escape special characters for use in regex
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 */
function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Get browser information
 * @returns {Object} Browser information
 */
function getBrowserInfo() {
    const ua = navigator.userAgent;
    let browser = 'Unknown';

    if (ua.includes('Chrome')) browser = 'Chrome';
    else if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Safari')) browser = 'Safari';
    else if (ua.includes('Edge')) browser = 'Edge';

    return {
        name: browser,
        userAgent: ua,
        language: navigator.language,
        platform: navigator.platform
    };
}

/**
 * Sanitize and format patient name
 * @param {string} name - Name to sanitize and format
 * @returns {string} Sanitized and formatted name
 */
function sanitizePatientName(name) {
    if (!name) return '';

    // Remove HTML tags and trim
    const sanitized = sanitizeHtml(name).trim();

    // Remove extra spaces and capitalize properly
    return sanitized.replace(/\s+/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * Format phone number for display
 * @param {string} phone - Phone number to format
 * @returns {string} Formatted phone number
 */
function formatPhoneNumber(phone) {
    if (!phone) return '';

    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '');

    // Format based on length
    if (digits.length === 10) {
        return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    } else if (digits.length === 11 && digits[0] === '1') {
        return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
    }

    return phone; // Return original if can't format
}

/**
 * Sanitize medical text fields
 * @param {string} text - Medical text to sanitize
 * @returns {string} Sanitized medical text
 */
function sanitizeMedicalText(text) {
    if (!text) return '';

    // Remove HTML tags but preserve line breaks
    const sanitized = sanitizeHtml(text);

    // Normalize line breaks and remove excessive whitespace
    return sanitized
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

/**
 * Format date for input fields (YYYY-MM-DD)
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string for input
 */
function formatDateForInput(date) {
    if (!date) return '';

    const dateObj = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(dateObj.getTime())) return '';

    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

/**
 * Parse date from input field
 * @param {string} dateString - Date string from input field
 * @returns {Date|null} Parsed date or null if invalid
 */
function parseDateFromInput(dateString) {
    if (!dateString) return null;

    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
}

/**
 * Format gender for display
 * @param {string} gender - Gender value
 * @returns {string} Formatted gender
 */
function formatGender(gender) {
    if (!gender) return '';

    const normalized = gender.toLowerCase().trim();

    switch (normalized) {
        case 'male':
        case 'm':
            return 'Male';
        case 'female':
        case 'f':
            return 'Female';
        case 'other':
        case 'o':
            return 'Other';
        default:
            return capitalizeWords(gender);
    }
}

/**
 * Normalize gender value for storage
 * @param {string} gender - Gender value to normalize
 * @returns {string} Normalized gender value
 */
function normalizeGender(gender) {
    if (!gender) return '';

    const normalized = gender.toLowerCase().trim();

    switch (normalized) {
        case 'male':
        case 'm':
            return 'male';
        case 'female':
        case 'f':
            return 'female';
        case 'other':
        case 'o':
            return 'other';
        default:
            return normalized;
    }
}

/**
 * Truncate text to specified length with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
function truncateText(text, maxLength) {
    if (!text || text.length <= maxLength) return text;

    return text.substring(0, maxLength - 3) + '...';
}

/**
 * Remove special characters from text (keep alphanumeric, spaces, basic punctuation)
 * @param {string} text - Text to clean
 * @returns {string} Cleaned text
 */
function removeSpecialCharacters(text) {
    if (!text) return '';

    return text.replace(/[^\w\s\-'.,!?]/g, '').trim();
}

/**
 * Validate and format age
 * @param {number|string} age - Age to validate and format
 * @returns {number} Validated age or 0 if invalid
 */
function validateAge(age) {
    const numAge = typeof age === 'string' ? parseInt(age, 10) : age;

    if (isNaN(numAge) || numAge < 0 || numAge > 150) {
        return 0;
    }

    return numAge;
}

/**
 * Format text for search (normalize for comparison)
 * @param {string} text - Text to normalize for search
 * @returns {string} Normalized text
 */
function normalizeForSearch(text) {
    if (!text) return '';

    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s]/g, '') // Remove punctuation
        .replace(/\s+/g, ' '); // Normalize spaces
}

/**
 * Create initials from name
 * @param {string} firstName - First name
 * @param {string} lastName - Last name
 * @returns {string} Initials
 */
function createInitials(firstName, lastName) {
    const first = firstName ? firstName.charAt(0).toUpperCase() : '';
    const last = lastName ? lastName.charAt(0).toUpperCase() : '';
    return first + last;
}

/**
 * Format visit summary for display
 * @param {Object} visit - Visit object
 * @returns {string} Formatted visit summary
 */
function formatVisitSummary(visit) {
    if (!visit) return '';

    const date = formatDate(visit.visitDate);
    const hasContent = visit.medications || visit.observations || visit.additionalComments;

    if (!hasContent) {
        return `Visit on ${date}`;
    }

    const parts = [];
    if (visit.medications) parts.push('medications');
    if (visit.observations) parts.push('observations');
    if (visit.additionalComments) parts.push('comments');

    return `Visit on ${date} (${parts.join(', ')})`;
}

/**
 * Check if application is running in development mode
 * @returns {boolean} True if in development mode
 */
function isDevelopment() {
    return location.hostname === 'localhost' || location.hostname === '127.0.0.1';
}

/**
 * Log message with timestamp (only in development)
 * @param {string} message - Message to log
 * @param {string} level - Log level ('info', 'warn', 'error')
 */
function log(message, level = 'info') {
    if (isDevelopment()) {
        const timestamp = new Date().toISOString();
        console[level](`[${timestamp}] ${message}`);
    }
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        generateId,
        formatDate,
        calculateAge,
        sanitizeHtml,
        debounce,
        deepClone,
        isEqual,
        isValidEmail,
        capitalizeWords,
        formatFileSize,
        getCurrentTimestamp,
        formatTimestamp,
        containsSearchTerm,
        escapeRegex,
        getBrowserInfo,
        isDevelopment,
        log,
        sanitizePatientName,
        formatPhoneNumber,
        sanitizeMedicalText,
        formatDateForInput,
        parseDateFromInput,
        formatGender,
        normalizeGender,
        truncateText,
        removeSpecialCharacters,
        validateAge,
        normalizeForSearch,
        createInitials,
        formatVisitSummary
    };
}