import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand } from "@aws-sdk/lib-dynamodb";

const dynamoDbClient = new DynamoDBClient();
const db = DynamoDBDocumentClient.from(dynamoDbClient)

export async function createAccount(
    username: string,
    password: string,
    userId: string
): Promise<{ success: boolean, userId?: string, message?: string }> {

    try {

        if (!username || !password || !userId) {
            return { success: false, message: "missing required fields" }
        }
        const params = {
            TableName: 'users-dev',
            Item: {
                username,
                password,
                userId
            },
        };

        await db.send(new PutCommand(params));
        return { success: true, userId };
    } catch (error) {
        console.error("Error creating user", error);

        return { success: false, message: "Could not create account" };
    }
}