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

export const handler = async (
    event: APIGatewayProxyEvent & { body: { username: string; password: string } } // Typa body som objekt
): Promise<APIGatewayProxyResult> => {
    const { username, password } = event.body; // Automatisk parsing med jsonBodyParser

    // 1. Validera input
    const validationErrors = validateData({ username, password }, signUpRules);
    if (validationErrors.length > 0) {
        throw new CustomError(validationErrors.join(", "), HttpStatusCode.BadRequest);
    }

    try {
        
        await checkUserName(username);

        const hashedPassword = await bcrypt.hash(password, 10);
        const userId = nanoid();
        await createAccount(username, hashedPassword, userId);

        return {
            statusCode: HttpStatusCode.Created,
            body: JSON.stringify({
                success: true,
                userId,
                message: "User created successfully",
            }),
        };
    } catch (error) {       
        if (error instanceof CustomError) {
            throw error;
        }
        console.error("Unexpected error in sign-up handler:", error);
        throw new CustomError("An unexpected error occurred", HttpStatusCode.InternalServerError);
    }
};

export const main = middy(handler)
    .use(jsonBodyParser()) 
    .use(errorHandler); 
