import { editNote } from "../updateNote/editNote.js";
import middy from "@middy/core";
import jsonBodyParser from "@middy/http-json-body-parser";
import { authMiddleware } from "../../utils/authMiddleware.js";
import { errorHandler } from "../../utils/errorHandler.js";
import { sendResponse } from "../../response/index.js";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { getDeletedNote } from "./getDeletedNote.js";
import { CustomError, HttpStatusCode } from "../../utils/errorHandler.js";

interface AuthenticatedEvent extends APIGatewayProxyEvent {
    user: { id: string };
}

export const handler = async (
    event: AuthenticatedEvent
): Promise<APIGatewayProxyResult> => {
    const { noteId } = event.body as { noteId?: string };

    // Validate noteId
    if (!noteId) {
        throw new CustomError("noteId is required", HttpStatusCode.BadRequest);
    }

    const userId = event.user?.id!;

    try {
        // Fetch the deleted note
        await getDeletedNote(userId, noteId!);

        // Restore the note
        const updatedNote = await editNote({
            userId,
            noteId,
            isDeleted: false,
        });

        // Return the response using sendResponse
        return sendResponse(HttpStatusCode.OK, {
            success: true,
            message: `Note with ID "${noteId}" has been restored`,
            updatedNote,
        });
    } catch (error) {
        console.error("Error restoring note:", error);
        if (error instanceof CustomError) {
            throw error;
        }
        throw new CustomError("Internal server error", HttpStatusCode.InternalServerError);
    }
};

// Wrap handler with Middy
export const main = middy(handler)
    .use(jsonBodyParser()) // Automatically parses JSON body
    .use(authMiddleware()) // Authentication middleware
    .use(errorHandler); // Error handling middleware

