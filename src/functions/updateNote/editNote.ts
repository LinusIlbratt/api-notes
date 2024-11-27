import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand, UpdateCommandInput } from "@aws-sdk/lib-dynamodb";
import { CustomError, HttpStatusCode } from "../../utils/errorHandler.js";

const dynamoDBClient = new DynamoDBClient({ region: "eu-north-1" });
const db = DynamoDBDocumentClient.from(dynamoDBClient);

interface ModifyNoteParams {
    userId: string;
    noteId: string;
    title?: string;
    text?: string;
    isDeleted?: boolean;
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

export async function editNote({ userId, noteId, title, text, isDeleted }: ModifyNoteParams) {
    if (!userId || !noteId) {
        throw new CustomError("userId and noteId are required to update a note", HttpStatusCode.BadRequest);
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
    let modifiedAtUpdated = false;

    // Add updates for title
    if (title) {
        isFirst = addUpdateExpression(params, "title", title, isFirst);
        modifiedAtUpdated = true;
    }

    // Add updates for text
    if (text) {
        isFirst = addUpdateExpression(params, "text", text, isFirst);
        modifiedAtUpdated = true;
    }

    // Handle isDeleted and TTL
    if (typeof isDeleted === "boolean") {
        const isDeletedNumeric = isDeleted ? 1 : 0;
        isFirst = addUpdateExpression(params, "isDeleted", isDeletedNumeric, isFirst);

        if (isDeleted) {
            const ttlInSeconds = 10 * 24 * 60 * 60; // 10 days
            const currentTimeInSeconds = Math.floor(Date.now() / 1000);
            const expireAt = currentTimeInSeconds + ttlInSeconds;
            isFirst = addUpdateExpression(params, "expireAt", expireAt, isFirst);
        } else {
            isFirst = addUpdateExpression(params, "expireAt", null, isFirst);
        }
    }

    // Update modifiedAt if necessary
    if (modifiedAtUpdated) {
        addUpdateExpression(params, "modifiedAt", new Date().toISOString(), isFirst);
    }

    try {
        const result = await db.send(new UpdateCommand(params));
        return result.Attributes; // Return updated attributes
    } catch (error) {
        console.error("Error updating note:", error);
        throw new CustomError("Could not update the note", HttpStatusCode.InternalServerError);
    }
}
