import { handleError } from "../../response/handleError.js";
import { validateData, ValidationRule } from "../../utils/validateData.js";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { nanoid } from "nanoid";
import middy from "@middy/core";
import { authMiddleware } from "../../utils/authMiddleware.js";
import { sendResponse } from "../../response/index.js";

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

    const validationRules: ValidationRule[] = [
        { field: "title", required: true, maxLength: 100 },
        { field: "text", required: true, maxLength: 1000 },
    ];

    // Validate field lengths
    const validationErrors = validateData(note, validationRules);
    
    if (validationErrors.length > 0) {
        return handleError(400, validationErrors.join(", "));
    }

    // Get userId from middleware
    const userId = event.user?.id;
    if (!userId) {
        return handleError(401, "Unauthorized: Missing user ID");
    }

    console.log("User ID:", userId); // Debugging: log the userId

    // Initialize DynamoDB client
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

    console.log("DynamoDB params:", params); // Debugging: log DynamoDB parameters

    try {
        // Save the note to DynamoDB
        await db.send(new PutCommand(params));
        console.log("Note successfully saved with ID:", noteId); // Debugging: log success message
        return sendResponse(201, { success: true, id: noteId });
    } catch (error) {
        console.error("Error inserting note:", error); // Log unexpected errors
        return handleError(500, "Could not save the note");
    }
};

// Middy wraps the handler to include authentication middleware
export const main = middy<AuthenticatedEvent, APIGatewayProxyResult>(handler).use(authMiddleware());
