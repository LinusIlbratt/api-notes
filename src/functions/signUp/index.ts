import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { sendResponse } from "../../response/index.js"
import bcrypt from 'bcryptjs';
import { nanoid } from "nanoid";
import { createAccount } from "./createAccount.js";
import { checkUserName } from "./checkUserName.js";
import { send } from "process";
import { handleError } from "../../response/handleError.js";

export const handler = async (
    event: APIGatewayProxyEvent
    ): Promise<APIGatewayProxyResult> => {
    try {
        const { username, password } = JSON.parse(event.body || "{}");

        // Check if username already exists (400)
        const usernameExists = await checkUserName(username);
        if (usernameExists) {
            return handleError(400, "Username already exists");
        }

        // Hash and salt the password
        const hashedPassword = await bcrypt.hash(password, 10);
        const userId = nanoid(); // Generate a unique user-ID

        // Creates an account (400 if it fails)
        const result = await createAccount(username, hashedPassword, userId);
        if (!result.success) {
            // Use specific error message if available, otherwise fallback to a generic message.
            return handleError(400, result.message || "Could not create account"); 
        }

        // Registration success (200)
        return sendResponse(200, { success: true, userId, message: "User created successfully" });

    } catch (error) {
        console.error("Error in sign-up handler:", error);
        // Unexpected error (500)
        return handleError(500);
    }
}