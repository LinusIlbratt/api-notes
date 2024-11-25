
import { handleError } from "../../response/handleError.js";
import { validateData } from "../../utils/validateData.js";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { nanoid } from "nanoid";
import middy from "@middy/core";
import { authMiddleware } from "../../utils/authMiddleware.js";
import { sendResponse } from "../../response/index.js";

// Expanderad typ för event med användarinformation
interface AuthenticatedEvent extends APIGatewayProxyEvent {
    user: { id: string }; // Lägg till userId från JWT-token
}

export const handler = async (
    event: AuthenticatedEvent
): Promise<APIGatewayProxyResult> => {
    console.log("Received event:", JSON.stringify(event, null, 2)); // Logga hela eventet

    // Kontrollera att request body finns
    if (!event.body) {
        return sendResponse(400, { error: "Request body is required" });
    }

    let note;
    try {
        note = JSON.parse(event.body);
    } catch (error) {
        console.log("Error parsing JSON:", error); // Logga JSON-parsningsfel
        return sendResponse(400, { error: "Invalid JSON in request body" });
    }

    console.log("Parsed note:", note); // Logga den parsade anteckningen

    // Kontrollera att nödvändiga fält finns
    if (!note.title || !note.text) {
        return sendResponse(400, { error: "Title and text are required" });
    }

    console.log("Note passed validation");

    // Hämta userId från middleware
    const userId = event.user?.id;
    console.log("User ID:", userId); // Logga userId

    if (!userId) {
        return sendResponse(401, { error: "Unauthorized: Missing user ID" });
    }

    // Initiera DynamoDB-klient
    const dynamoDBClient = new DynamoDBClient({ region: "eu-north-1" });
    const db = DynamoDBDocumentClient.from(dynamoDBClient);
    const noteId = nanoid();

    const params = {
        TableName: "notes-db",
        Item: {
            userId,
            noteId,
            title: note.title,
            text: note.text,
            createdAt: new Date().toISOString(),
            modifiedAt: new Date().toISOString(),
        },
    };

    console.log("DynamoDB params:", params); // Logga DynamoDB-parametrar

    try {
        await db.send(new PutCommand(params));
        console.log("Note successfully saved with ID:", noteId); // Logga framgång
        return sendResponse(201, { success: true, id: noteId });
    } catch (error) {
        console.error("Error inserting note:", error); // Logga felet
        return sendResponse(500, { error: "Could not save the note" });
    }
};


// Typdefiniera Middy för att stödja AuthenticatedEvent
export const main = middy<AuthenticatedEvent, APIGatewayProxyResult>(handler).use(authMiddleware());


