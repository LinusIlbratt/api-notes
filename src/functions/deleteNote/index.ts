import { editNote } from "../updateNote/editNote.js";
import middy from "@middy/core";
import { authMiddleware } from "../../utils/authMiddleware.js";
import jsonBodyParser from "@middy/http-json-body-parser";
import { errorHandler } from "../../utils/errorHandler.js";
import { APIGatewayProxyResult, APIGatewayProxyEvent } from "aws-lambda";
import { fetchUniqueNote } from "./fetchUniqueNote.js";
import { validateNoteId } from "../../utils/validateData.js";

interface AuthenticatedEvent extends APIGatewayProxyEvent {
    user: { id: string }; // Add userId from JWT-token
}

export const handler = async (
    event: AuthenticatedEvent
): Promise<APIGatewayProxyResult> => {
    const { noteId } = event.body as { noteId?: string }; // `jsonBodyParser` handle parsing

    validateNoteId(noteId); 
    const userId = event.user?.id!; 

    await fetchUniqueNote(userId, noteId!); // Fetch note

    // Update note to isDeleted: true
    await editNote({ userId, noteId: noteId!, isDeleted: true });

    return {
        statusCode: 200,
        body: JSON.stringify({
            success: true,
            message: `You have deleted the note with the id "${noteId}"`,
        }),
    };
};

export const main = middy(handler)
    .use(jsonBodyParser()) // Parsar JSON body
    .use(authMiddleware()) // Autentisering
    .use(errorHandler); // Felhantering
