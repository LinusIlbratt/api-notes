import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { handleError } from "../../response/handleError.js";
import { sendResponse } from "../../response/index.js";
import middy from "@middy/core";
import { authMiddleware } from "../../utils/authMiddleware.js";
import { fetchNotes } from "./fetchNotes.js";

// Expanded type for event with user information
interface AuthenticatedEvent extends APIGatewayProxyEvent {
    user: { id: string }; 
}

export const handler = async (
    event: AuthenticatedEvent
): Promise<APIGatewayProxyResult> => {
    console.log("Received event:", JSON.stringify(event, null, 2)); 

    // Hämta userId från middleware
    const userId = event.user?.id;
    if (!userId) {
        return handleError(401, "Unauthorized: Missing user ID");
    }

    console.log("Fetching notes for user ID:", userId); 

    try {
        
        const notes = await fetchNotes(userId);
        return sendResponse(200, { success: true, notes });
    } catch (error) {
        console.error("Error fetching notes:", error); 
        return handleError(500, "Could not fetch notes");
    }
};

// Middy wraps the handler to include authentication middleware
export const main = middy<AuthenticatedEvent, APIGatewayProxyResult>(handler).use(authMiddleware());
