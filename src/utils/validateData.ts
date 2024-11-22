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
        const value = data[rule.field]

        // Check if field is required
        if (rule.required && !value) {
            errors.push(`${rule.field} is required`)
            return;
        }

        // Validate minLength if defined
        if (rule.minLength && value.length < rule.minLength) {
            errors.push(`${rule.field} must be at least ${rule.minLength} characters long.`);
            return;
        }

        // Validate maxLength if defined
        if (rule.maxLength && value.length > rule.maxLength) {
            errors.push(`${rule.field} must not exceed ${rule.maxLength} characters.`);
            return;
        }

        // Validate pattern if defined (e.g., for username format)
        if (rule.pattern && !rule.pattern.test(value)) {
            errors.push(`${rule.field} is invalid.`);
            return;
        }
    });

    return errors;
}