import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { authMiddleware } from "../../utils/authMiddleware.js";
import middy from "@middy/core";

// Typ för AuthenticatedEvent
interface AuthenticatedEvent extends APIGatewayProxyEvent {
    user: { id: string }; // Add userId from JWT-token
}

const dynamoDBClient = new DynamoDBClient({ region: "eu-north-1" });
const db = DynamoDBDocumentClient.from(dynamoDBClient);

export const handler = async (
    event: AuthenticatedEvent
): Promise<APIGatewayProxyResult> => {
    if (!event.body) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Request body is required" }),
        };
    }

    const requestBody = JSON.parse(event.body);

    const { noteId, title, text } = requestBody;

    // Validera att noteId finns
    if (!noteId) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "noteId is required" }),
        };
    }

    // Hämta userId från authMiddleware
    const userId = event.user?.id;
    if (!userId) {
        return {
            statusCode: 401,
            body: JSON.stringify({ error: "Unauthorized: Missing user ID" }),
        };
    }

    // Dynamiskt bygg uppdateringsuttryck
    const params: any = {
        TableName: "notes-db",
        Key: {
            userId,
            noteId,
        },
        UpdateExpression: "SET",
        ExpressionAttributeNames: {},
        ExpressionAttributeValues: {},
        ReturnValues: "ALL_NEW",
    };

    let isFirst = true;
    if (title) {
        params.UpdateExpression += isFirst ? " #title = :title" : ", #title = :title";
        params.ExpressionAttributeNames["#title"] = "title";
        params.ExpressionAttributeValues[":title"] = title;
        isFirst = false;
    }

    if (text) {
        params.UpdateExpression += isFirst ? " #text = :text" : ", #text = :text";
        params.ExpressionAttributeNames["#text"] = "text";
        params.ExpressionAttributeValues[":text"] = text;
        isFirst = false;
    }

    // Lägg alltid till `modifiedAt`
    params.UpdateExpression += isFirst ? " modifiedAt = :modifiedAt" : ", modifiedAt = :modifiedAt";
    params.ExpressionAttributeValues[":modifiedAt"] = new Date().toISOString();

    try {
        const result = await db.send(new UpdateCommand(params));
        return {
            statusCode: 200,
            body: JSON.stringify({ success: true, updatedNote: result.Attributes }),
        };
    } catch (error) {
        console.error("Error updating note:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Could not update the note" }),
        };
    }
};

// Uppdaterad export med generisk typ för middy
export const main = middy<AuthenticatedEvent, APIGatewayProxyResult>(handler).use(authMiddleware());
