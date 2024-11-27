import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { CustomError, HttpStatusCode } from "../../utils/errorHandler.js";

const dynamoDbClient = new DynamoDBClient();
const db = DynamoDBDocumentClient.from(dynamoDbClient);

export async function checkUserName(username: string): Promise<void> {
    const params = {
        TableName: "users-dev",
        KeyConditionExpression: "username = :username",
        ExpressionAttributeValues: {
            ":username": username,
        },
        Limit: 1,
    };

    const result = await db.send(new QueryCommand(params));

    if (result.Items && result.Items.length > 0) {
        throw new CustomError("Username already exists", HttpStatusCode.Conflict);
    }
}
