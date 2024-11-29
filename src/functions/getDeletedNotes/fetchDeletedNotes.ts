import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { CustomError, HttpStatusCode } from "../../utils/errorHandler.js";

const dynamoDBClient = new DynamoDBClient({ region: "eu-north-1" });
const db = DynamoDBDocumentClient.from(dynamoDBClient);

export const fetchDeletedNotes = async (userId: string): Promise<any[]> => {
    const params = {
        TableName: "notes-db",
        KeyConditionExpression: "userId = :userId",
        FilterExpression: "isDeleted = :isDeleted",
        ExpressionAttributeValues: {
            ":userId": userId,
            ":isDeleted": 1,
        },
    };

    const result = await db.send(new QueryCommand(params));
    if (!result.Items || result.Items.length === 0) {
        throw new CustomError("No notes found", HttpStatusCode.NotFound);
    }
    return result.Items || [];
};