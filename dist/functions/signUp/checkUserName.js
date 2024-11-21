import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
const dynamoDbClient = new DynamoDBClient();
const db = DynamoDBDocumentClient.from(dynamoDbClient);
export async function checkUserName(username) {
    try {
        const params = {
            TableName: "users",
            KeyConditionExpression: "username = :username",
            ExpressionAttributeValues: {
                ":username": username,
            },
            Limit: 1,
        };
        const result = await db.send(new QueryCommand(params));
        if (result.Items && result.Items.length > 0) {
            return true; // username was found
        }
        else {
            return false; // username was not found
        }
    }
    catch (error) {
        console.error("Error occurred while checking username:", error);
        throw error;
    }
}
