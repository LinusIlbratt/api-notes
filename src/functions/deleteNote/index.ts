import { editNote } from "../updateNote/editNote.js";
import middy from "@middy/core";
import { authMiddleware } from "../../utils/authMiddleware.js";
import jsonBodyParser from "@middy/http-json-body-parser";
import { errorHandler } from "../../utils/errorHandler.js";
import { APIGatewayProxyResult, APIGatewayProxyEvent } from "aws-lambda";
import { fetchUniqueNote } from "./fetchUniqueNote.js";
import { validateNoteId } from "../../utils/validateData.js";
import { sendResponse } from "../../response/index.js";
import { CustomError, HttpStatusCode } from "../../utils/errorHandler.js";
import { validateData } from "../../utils/validateData.js";
import { noteIdValidationRules } from "../../utils/validationRules.js";

interface AuthenticatedEvent extends APIGatewayProxyEvent {
    user: { id: string }; // Add userId from JWT-token
}

export const handler = async (
    event: AuthenticatedEvent
): Promise<APIGatewayProxyResult> => {
    const { noteId } = event.body as { noteId?: string }; // `jsonBodyParser` handle parsing

    // Validate input
    const validationErrors = validateData(event.body, noteIdValidationRules);
    if (validationErrors.length > 0) {
        throw new CustomError(validationErrors.join(", "), HttpStatusCode.BadRequest);
    }

    validateNoteId(noteId); 
    const userId = event.user?.id!; 

    try {
        // Fetch note to check if it exists
        await fetchUniqueNote(userId, noteId!);

        // Update note to isDeleted: true
        await editNote({ userId, noteId: noteId!, isDeleted: true });

        // Return the response using sendResponse
        return sendResponse(HttpStatusCode.OK, {
            success: true,
            message: `You have deleted the note with the id "${noteId}"`,
        });
    } catch (error) {
        console.error("Error deleting note:", error);
        throw new CustomError("Could not delete the note", HttpStatusCode.InternalServerError);
    }
};

export const main = middy(handler)
    .use(jsonBodyParser()) // Parsing JSON body
    .use(authMiddleware()) // Auth
    .use(errorHandler); // Error handling
