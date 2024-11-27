import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { CustomError, HttpStatusCode } from "../../utils/errorHandler.js";

const db = DynamoDBDocumentClient.from(new DynamoDBClient({ region: "eu-north-1" }));

export const getDeletedNote = async (userId: string, noteId: string) => {
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
        throw new CustomError("Note not found", HttpStatusCode.NotFound);
    }

    const isDeleted = result.Item.isDeleted;

    if (!isDeleted) {
        throw new CustomError("This note is already active", HttpStatusCode.BadRequest);
    }

    return result.Item;
};
