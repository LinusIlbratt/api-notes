import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { sendResponse } from "../../response/index.js";  // Importera sendResponse för att skapa responsen
import { handleError } from "../../response/handleError.js";  // Importera handleError för felhantering
import { authenticateUser } from "./authenticateUser.js";
import {validateData, ValidationRule } from "../../utils/validateData.js";

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const { username, password }: { username: string; password: string } = JSON.parse(event.body || "{}");

    // Define validation rules for signIn
    const signInRules: ValidationRule[] = [
        { field: "username", required: true },
        { field: "password", required: true },
    ];

    // Validate fields based on the rules
    const validationErrors = validateData({ username, password }, signInRules);

    if (validationErrors.length > 0) {
        return handleError(400, validationErrors.join(", "));
    }

    // Call authenticatenUser to get the user and validate password
    const result = await authenticateUser(username, password);

    // If auth is a success, return a JWT-token
    if (result.success) {
        return sendResponse(result.statusCode || 200, { success: true, token: result.token });
    } else {
        // If auth fails, return message from result
        return handleError(result.statusCode || 400, result.message || "Authentication failed");
    }
};
