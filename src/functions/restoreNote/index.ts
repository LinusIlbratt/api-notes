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

    // Fetch deleted note
    await getDeletedNote(userId, noteId);

    // Restore note
    const updatedNote = await editNote({
        userId,
        noteId,
        isDeleted: false,
    });

    return sendResponse(200, {
        success: true,
        message: `Note with ID "${noteId}" has been restored`,
        updatedNote,
    });
};

// Wrap handler with Middy
export const main = middy(handler)
    .use(jsonBodyParser()) // Automatically parses JSON body
    .use(authMiddleware()) // Authentication middleware
    .use(errorHandler); // Error handling middleware

