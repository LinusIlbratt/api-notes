import { ValidationRule } from "./validateData.js";

export const postNoteValidationRules: ValidationRule[] = [
    { field: "title", required: true, maxLength: 100 },
    { field: "text", required: true, maxLength: 1000 },
];