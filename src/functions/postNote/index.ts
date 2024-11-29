import middy from "@middy/core";
import jsonBodyParser from "@middy/http-json-body-parser";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { authMiddleware } from "../../utils/authMiddleware.js";
import { errorHandler } from "../../utils/errorHandler.js";
import { validateData } from "../../utils/validateData.js";
import { postNoteValidationRules } from "../../utils/validationRules.js";
import { saveNote } from "./saveNote.js";
import { CustomError, HttpStatusCode } from "../../utils/errorHandler.js";
import { sendResponse } from "../../response/index.js";

// Expanded type for event with user information
interface AuthenticatedEvent extends APIGatewayProxyEvent {
    user: { id: string };
}

export const handler = async (
    event: AuthenticatedEvent & { body: { title: string; text: string } }
): Promise<APIGatewayProxyResult> => {
    console.log("Received event:", JSON.stringify(event, null, 2));

    // Validate input
    const validationErrors = validateData(event.body, postNoteValidationRules);
    if (validationErrors.length > 0) {
        throw new CustomError(validationErrors.join(", "), HttpStatusCode.BadRequest);
    }

    // Extract user ID from middleware
    const userId = event.user.id;
    console.log("User ID:", userId);

    try {
        // Save note
        const { title, text } = event.body;
        const noteId = await saveNote(userId, { title, text });

       // Return response using sendResponse
       return sendResponse(HttpStatusCode.Created, { success: true, id: noteId });
    } catch (error) {
        console.error("Error saving note:", error);
        throw new CustomError("Could not save the note", HttpStatusCode.InternalServerError);
    }
};

// Middy wraps the handler to include middleware
export const main = middy(handler)
    .use(jsonBodyParser()) // Automatically parses JSON body
    .use(authMiddleware()) // Adds user authentication
    .use(errorHandler); // Handles errors
    
