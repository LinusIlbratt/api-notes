export interface ValidationRule {
    field: string; // Specific filed in the request body
    required: boolean; // Wheter the field is required
    minLength?: number, // Optional: Minimum length
    maxLength?: number, // Optional: Maximum length
    pattern?: RegExp; // Optional: Pattern to match (e.g. for password with letters and numbers)
}

// validation for different endpoints
export const validateData = (data: any, rules: ValidationRule[]): string[] => {
    const errors: string[] = [];

    const allowedFields = rules.map((rule) => rule.field); // Fields allowed based on the rules

    // Control for extra fields 
    const extraFields = Object.keys(data).filter((key) => !allowedFields.includes(key));
    if (extraFields.length > 0) {
        errors.push(`Extra fields are not allowed: ${extraFields.join(", ")}`);
    }

    rules.forEach((rule) => {
        const value = data[rule.field];
        
        if (rule.required && (value === undefined || value === null)) {
            errors.push(`${rule.field} is required`);
            return;
        }
        
        if (!rule.required && (value === undefined || value === null)) {
            return;
        }
        
        if (typeof value !== 'string') {
            errors.push(`${rule.field} must be a string.`);
            return;
        }

        if (rule.minLength && value.length < rule.minLength) {
            errors.push(`${rule.field} must be at least ${rule.minLength} characters long.`);
            return;
        }

        if (rule.maxLength && value.length > rule.maxLength) {
            errors.push(`${rule.field} must not exceed ${rule.maxLength} characters.`);
            return;
        }

        if (rule.pattern && !rule.pattern.test(value)) {
            errors.push(`${rule.field} is invalid.`);
            return;
        }
    });

    return errors;
};


// Validate noteId
export const validateNoteId = (noteId?: string): void => {
    if (!noteId) {
        throw new Error("noteId is required");
    }
};