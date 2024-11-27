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

    rules.forEach((rule) => {
        const value = data[rule.field];

        // If field is required and missing
        if (rule.required && !value) {
            errors.push(`${rule.field} is required`);
            return;
        }

        // If field is optional and doesnt exist, skip validation
        if (!rule.required && (value === undefined || value === null)) {
            return;
        }

        // Validate minLength if field exists
        if (rule.minLength && value.length < rule.minLength) {
            errors.push(`${rule.field} must be at least ${rule.minLength} characters long.`);
            return;
        }

        //  Validate maxLength if field exists
        if (rule.maxLength && value.length > rule.maxLength) {
            errors.push(`${rule.field} must not exceed ${rule.maxLength} characters.`);
            return;
        }

        // Validate pattern if field exists 
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