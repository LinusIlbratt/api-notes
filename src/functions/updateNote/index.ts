import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { authMiddleware } from "../../utils/authMiddleware.js";
import { editNote } from "./editNote.js";
import { sendResponse } from "../../response/index.js";
import { handleError } from "../../response/handleError.js";
import middy from "@middy/core";
import { validateData } from "../../utils/validateData.js";
import { updateNoteValidationRules } from "../../utils/validationRules.js";

// Type for AuthenticatedEvent Typ för AuthenticatedEvent
interface AuthenticatedEvent extends APIGatewayProxyEvent {
    user: { id: string }; // Add userId from JWT-token
}

export const handler = async (
    event: AuthenticatedEvent
): Promise<APIGatewayProxyResult> => {
    if (!event.body) {
        return handleError(400, "Request body is required");
    }

    const requestBody = JSON.parse(event.body);
    const { noteId, title, text } = requestBody;

    // Check to see that noteId exists
    if (!noteId) {
        return handleError(400, "noteId is required");
    }

    // Validate atleast that title or text exists
    if (!title && !text) {
        return handleError(400, "At least one of title or text must be provided for update");
    }

    // Validate field length for title and text
    const validationErrors = validateData(requestBody, updateNoteValidationRules);
    if (validationErrors.length > 0) {
        return handleError(400, validationErrors.join(", "));
    }

    // Get userId from authMiddleware
    const userId = event.user?.id;
    if (!userId) {
        return handleError(401, "Unauthorized: Missing user ID");
    }

    try {
        // Update the note with editNote
        const updatedNote = await editNote({ userId, noteId, title, text });
        return sendResponse(200, { success: true, updatedNote });
    } catch (error: any) {
        if (error.name === "ConditionalCheckFailedException") {
            return handleError(404, "Note not found");
        }
        console.error("Error updating note:", error);
        return handleError(500, "Could not update the note");
    }
};

export const main = middy<AuthenticatedEvent, APIGatewayProxyResult>(handler).use(authMiddleware());
