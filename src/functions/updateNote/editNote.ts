import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand, UpdateCommandInput } from "@aws-sdk/lib-dynamodb";
import { handleError } from "../../response/handleError.js";

const dynamoDBClient = new DynamoDBClient({ region: "eu-north-1" });
const db = DynamoDBDocumentClient.from(dynamoDBClient);

interface ModifyNoteParams {
    userId: string;
    noteId: string;
    title?: string;
    text?: string;
}

function addUpdateExpression(
    params: UpdateCommandInput,
    attributeName: string,
    value: any,
    isFirst: boolean
): boolean {
    params.UpdateExpression += isFirst ? ` #${attributeName} = :${attributeName}` : `, #${attributeName} = :${attributeName}`;
    params.ExpressionAttributeNames![`#${attributeName}`] = attributeName;
    params.ExpressionAttributeValues![`:${attributeName}`] = value;
    return false;
}


export async function editNote({ userId, noteId, title, text }: ModifyNoteParams) {
    // Check if necessary params exists
    if (!userId || !noteId) {
        return handleError(400, "userId and noteId are required to update a note");
    }

    const params: UpdateCommandInput = {
        TableName: "notes-db",
        Key: {
            userId,
            noteId,
        },
        UpdateExpression: "SET",
        ExpressionAttributeNames: {},
        ExpressionAttributeValues: {},
        ConditionExpression: "attribute_exists(userId) AND attribute_exists(noteId)", // Ensure the item exists
        ReturnValues: "ALL_NEW",
    };

    let isFirst = true;

    if (title) {
        isFirst = addUpdateExpression(params, "title", title, isFirst);
    }

    if (text) {
        isFirst = addUpdateExpression(params, "text", text, isFirst);
    }

    // Always add modifiedAt
    addUpdateExpression(params, "modifiedAt", new Date().toISOString(), isFirst);
   
    const result = await db.send(new UpdateCommand(params));
    return result.Attributes; // Return the updated attributes 
    
}
