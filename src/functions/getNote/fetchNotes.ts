import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

const dynamoDBClient = new DynamoDBClient({ region: "eu-north-1" });
const db = DynamoDBDocumentClient.from(dynamoDBClient);

export const fetchNotes = async (userId: string): Promise<any[]> => {
    const params = {
        TableName: "notes-db",
        KeyConditionExpression: "userId = :userId",
        ExpressionAttributeValues: {
            ":userId": userId,
        },
    };

    try {
        const result = await db.send(new QueryCommand(params));
        return result.Items || [];
    } catch (error) {
        console.error("Error fetching notes:", error);
        throw new Error("Could not fetch notes");
    }
};