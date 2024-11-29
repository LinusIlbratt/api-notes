import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { CustomError, HttpStatusCode } from "../../utils/errorHandler.js";
import { authenticateUser } from "./authenticateUser.js";
import { validateData } from "../../utils/validateData.js";
import middy from "@middy/core";
import jsonBodyParser from "@middy/http-json-body-parser";
import { errorHandler } from "../../utils/errorHandler.js";
import { signInRules } from "../../utils/validationRules.js";
import { sendResponse } from "../../response/index.js";

// Handler
export const handler = async (event: APIGatewayProxyEvent & { body: { username: string; password: string } }): Promise<APIGatewayProxyResult> => {
    const { username, password } = event.body;

    // Validate input
    const validationErrors = validateData(event.body, signInRules);
    if (validationErrors.length > 0) {
        throw new CustomError(`Validation failed: ${validationErrors.join(", ")}`, HttpStatusCode.BadRequest);  
    }

    try {
        // Authenticate user
        const result = await authenticateUser(username, password);

        if (result.success) {
            return sendResponse(HttpStatusCode.OK, { // 200 OK
                success: true,
                token: result.token,
            });
        } else {
            throw new CustomError(result.message || "Authentication failed", result.statusCode || HttpStatusCode.Unauthorized);
        }
    } catch (error) {
        console.error("Error during authentication:", error);

        if (error instanceof CustomError) {
            throw error; // Rethrow the error if it's a known CustomError
        }

        throw new CustomError("An unexpected error occurred during authentication", HttpStatusCode.InternalServerError);
    }
};

export const main = middy(handler)
    .use(jsonBodyParser())  
    .use(errorHandler);  
