import { ValidationRule } from "./validateData.js";

export const postNoteValidationRules: ValidationRule[] = [
    { field: "title", required: true, maxLength: 100 },
    { field: "text", required: true, maxLength: 1000 },
];

export const updateNoteValidationRules: ValidationRule[] = [
    { field: "title", required: false, maxLength: 100 },
    { field: "text", required: false, maxLength: 1000 }
];

export const signUpRules: ValidationRule[] = [
    { field: "username", required: true, minLength: 3, maxLength: 30, pattern: /^[a-zA-Z0-9_]+$/ },
    { field: "password", required: true, minLength: 6 },
];

export const signInRules: ValidationRule[] = [
    { field: "username", required: true },
    { field: "password", required: true },
];

export const noteIdValidationRules: ValidationRule[] = [
    { field: "noteId", required: true},
];


