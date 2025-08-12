/**
 * Patient Data Model
 * Represents a patient record with validation and utility methods
 * 
 * This is a placeholder implementation - will be fully implemented in task 2
 */

class Patient {
    constructor(data = {}) {
        // Initialize with default values from schema
        this.id = data.id || generateId();
        this.firstName = data.firstName || '';
        this.lastName = data.lastName || '';
        this.dateOfBirth = data.dateOfBirth || null;
        this.age = data.age || 0;
        this.placeOfResidence = data.placeOfResidence || '';
        this.gender = data.gender || '';
        this.visits = data.visits || [];
        this.createdAt = data.createdAt || getCurrentTimestamp();
        this.updatedAt = data.updatedAt || getCurrentTimestamp();
    }

    // Placeholder methods - will be implemented in task 2
    validate() {
        console.log('Patient validation - to be implemented in task 2');
        return { isValid: true, errors: [] };
    }

    toJSON() {
        return {
            id: this.id,
            firstName: this.firstName,
            lastName: this.lastName,
            dateOfBirth: this.dateOfBirth,
            age: this.age,
            placeOfResidence: this.placeOfResidence,
            gender: this.gender,
            visits: this.visits,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Patient;
}