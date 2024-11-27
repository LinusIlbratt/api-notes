import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { editNote } from "../updateNote/editNote.js";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import middy from "@middy/core";
import { authMiddleware } from "../../utils/authMiddleware.js";
import { handleError } from "../../response/handleError.js";
import { sendResponse } from "../../response/index.js";


interface AuthenticatedEvent extends APIGatewayProxyEvent {
    user: { id: string }; // Add userId from JWT-token
}

const db = DynamoDBDocumentClient.from(new DynamoDBClient({ region: "eu-north-1" }));

export const handler = async (
    event: AuthenticatedEvent
): Promise<APIGatewayProxyResult> => {
    if (!event.body) {
        return handleError(400, "Request body is required");
    }

    const { noteId } = JSON.parse(event.body);

    if (!noteId) {
        return handleError(400, "noteId is required");
    }

    // Get userId from authMiddleware
    const userId = event.user?.id;
    if (!userId) {
        return handleError(401, "Unauthorized: Missing user ID");
    }

    // Getting the note
    const params = {
        TableName: "notes-db",
        Key: {
            userId,
            noteId,
        },
        ProjectionExpression: "isDeleted",
    };

    try {
        const result = await db.send(new GetCommand(params));

        if (!result.Item) {
            return handleError(404, "Note not found");
        }

        const isDeleted = result.Item.isDeleted;

        if (isDeleted) {
            return handleError(400, "This note is already deleted");
        }
    
        // Mark note as deleted
        await editNote({ userId, noteId, isDeleted: true });

        return sendResponse(200, {
            success: true,
            message: `You have deleted the note with the id "${noteId}"`,
        });
    } catch (error) {
        console.error("Error marking note as deleted:", error);
        return handleError(500);
    }
    
};

// Middy for auth
export const main = middy<AuthenticatedEvent, APIGatewayProxyResult>(handler).use(authMiddleware());