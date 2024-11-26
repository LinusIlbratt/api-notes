import { handleError } from "../../response/handleError.js";
import { validateData } from "../../utils/validateData.js";
import { postNoteValidationRules } from "../../utils/validationRules.js";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import middy from "@middy/core";
import { authMiddleware } from "../../utils/authMiddleware.js";
import { sendResponse } from "../../response/index.js";
import { saveNote } from "./saveNote.js";

// Expanded type for event with user information
interface AuthenticatedEvent extends APIGatewayProxyEvent {
    user: { id: string }; // Add userId from JWT-token
}

export const handler = async (
    event: AuthenticatedEvent
): Promise<APIGatewayProxyResult> => {
    console.log("Received event:", JSON.stringify(event, null, 2)); // Debugging: log the incoming event

    // Check if request body exists
    if (!event.body) {
        return handleError(400, "Request body is required");
    }

    let note;
    try {
        // Parse the request body
        note = JSON.parse(event.body);
        console.log("Parsed note:", note); // Debugging: log the parsed note
    } catch (error) {
        console.error("Error parsing JSON:", error); // Log parsing errors
        return handleError(400, "Invalid JSON in request body");
    }

    // Validate required fields
    if (!note.title || !note.text) {
        return handleError(400, "Title and text are required");
    }

    // Validate field lengths
    const validationErrors = validateData(note, postNoteValidationRules);
    
    if (validationErrors.length > 0) {
        return handleError(400, validationErrors.join(", "));
    }

    // Get userId from middleware
    const userId = event.user?.id;
    if (!userId) {
        return handleError(401, "Unauthorized: Missing user ID");
    }

    console.log("User ID:", userId); // Debugging: log the userId

    try {
        // Save a note with saveNote function
        const noteId = await saveNote(userId, note);
        return sendResponse(201, { success: true, id: noteId });
    } catch (error) {
        console.error("Error saving note:", error);
        return handleError(500, "Could not save the note");
    }
};

// Middy wraps the handler to include authentication middleware
export const main = middy<AuthenticatedEvent, APIGatewayProxyResult>(handler).use(authMiddleware());
