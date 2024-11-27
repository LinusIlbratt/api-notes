import { editNote } from "../updateNote/editNote.js";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import middy from "@middy/core";
import { authMiddleware } from "../../utils/authMiddleware.js";
import { handleError } from "../../response/handleError.js";
import { sendResponse } from "../../response/index.js";

const dynamoDBClient = new DynamoDBClient({ region: "eu-north-1" });
const db = DynamoDBDocumentClient.from(dynamoDBClient);

interface AuthenticatedEvent extends APIGatewayProxyEvent {
    user: { id: string };
}

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

    const userId = event.user?.id;
    if (!userId) {
        return handleError(401, "Unauthorized: Missing user ID");
    }

    try {
       
        const params = {
            TableName: "notes-db",
            Key: {
                userId,
                noteId,
            },
            ProjectionExpression: "isDeleted",
        };

        const result = await db.send(new GetCommand(params));

        if (!result.Item) {
            return handleError(404, "Note not found");
        }

        const isDeleted = result.Item.isDeleted;

        if (!isDeleted) {
            return handleError(400, "This note is already active");
        }
        
        const updatedNote = await editNote({
            userId,
            noteId,
            isDeleted: false, // Restore note
        });

        return sendResponse(200, {
            success: true,
            message: `Note with ID "${noteId}" has been restored`,
            updatedNote,
        });
    } catch (error) {
        console.error("Error restoring note:", error);
        return handleError(500, "Could not restore the note");
    }
};

export const main = middy<AuthenticatedEvent, APIGatewayProxyResult>(handler).use(authMiddleware());
