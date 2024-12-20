import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { nanoid } from "nanoid";

const dynamoDBClient = new DynamoDBClient({ region: "eu-north-1" });
const db = DynamoDBDocumentClient.from(dynamoDBClient);

export async function saveNote(userId: string, note: { title: string; text: string }): Promise<string> {
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
            isDeleted: 0,
        },
    };   

    try {
        await db.send(new PutCommand(params));
        console.log("Note successfully saved with ID:", noteId);
        return noteId;
    } catch (error) {
        console.error("Error inserting note:", error); 
        throw new Error("Could not save the note");
    }
}
