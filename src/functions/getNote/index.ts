import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import middy from "@middy/core";
import { authMiddleware } from "../../utils/authMiddleware.js";
import { fetchNotes } from "./fetchNotes.js";
import { errorHandler } from "../../utils/errorHandler.js";
import { sendResponse } from "../../response/index.js";

// Expanded type for event with user information
interface AuthenticatedEvent extends APIGatewayProxyEvent {
    user: { id: string }; // User ID added via authMiddleware
}

export const handler = async (
    event: AuthenticatedEvent
): Promise<APIGatewayProxyResult> => {

    const userId = event.user?.id!; // User ID is guaranteed by authMiddleware

    const notes = await fetchNotes(userId); // Get all notes

    return sendResponse(200, { success: true, notes });
};

export const main = middy(handler)
    .use(authMiddleware()) 
    .use(errorHandler); 
