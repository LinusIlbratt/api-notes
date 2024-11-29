import middy from "@middy/core";
import jsonBodyParser from "@middy/http-json-body-parser";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { createAccount } from "./createAccount.js";
import { checkUserName } from "./checkUserName.js";
import { CustomError, HttpStatusCode } from "../../utils/errorHandler.js";
import { validateData } from "../../utils/validateData.js";
import { signUpRules } from "../../utils/validationRules.js";
import { errorHandler } from "../../utils/errorHandler.js";
import { sendResponse } from "../../response/index.js";

export const handler = async (
    event: APIGatewayProxyEvent & { body: { username: string; password: string } } 
): Promise<APIGatewayProxyResult> => {
    const { username, password } = event.body; 

    // Validate input
    const validationErrors = validateData(event.body, signUpRules);
    if (validationErrors.length > 0) {
        throw new CustomError(`Validation failed: ${validationErrors.join(", ")}`, HttpStatusCode.BadRequest);  
    }

    try {
        // Check if username already exists
        await checkUserName(username);

        // Hash the password and create user account
        const hashedPassword = await bcrypt.hash(password, 10);
        const userId = nanoid();
        await createAccount(username, hashedPassword, userId);

        // Return success response with sendResponse
        return sendResponse(HttpStatusCode.Created, { // 201 Created
            success: true,
            userId,
            message: "User created successfully",
        });
    } catch (error) {
        // Handle expected errors (like CustomError)
        if (error instanceof CustomError) {
            throw error;  // Let CustomError propagate, it will be handled by errorHandler
        }

        // Log and handle unexpected errors
        console.error("Unexpected error in sign-up handler:", error);
        throw new CustomError("An unexpected error occurred", HttpStatusCode.InternalServerError);
    }
};

export const main = middy(handler)
    .use(jsonBodyParser()) 
    .use(errorHandler); 
