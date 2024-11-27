import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { CustomError, HttpStatusCode } from "../../utils/errorHandler.js";

interface Note {
    isDeleted: boolean;
}

const db = DynamoDBDocumentClient.from(new DynamoDBClient({ region: "eu-north-1" }));

export const fetchUniqueNote = async (userId: string, noteId: string): Promise<Note> => {
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
    
    return result.Item as Note;
};
