import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { CustomError, HttpStatusCode } from "../../utils/errorHandler.js";

const dynamoDbClient = new DynamoDBClient();
const db = DynamoDBDocumentClient.from(dynamoDbClient);

export async function createAccount(username: string, password: string, userId: string): Promise<string> {
    if (!username || !password || !userId) {
        throw new CustomError("Missing required fields", HttpStatusCode.BadRequest);
    }

    const params = {
        TableName: "users-dev",
        Item: {
            username,
            password,
            userId,
            createdAt: new Date().toISOString(),
        },
        ConditionExpression: "attribute_not_exists(username)", 
    };

    try {
        await db.send(new PutCommand(params));
        return userId;
    } catch (error: any) {
        console.error("Error creating user:", error);

        if (error.name === "ConditionalCheckFailedException") {
            throw new CustomError("Username already exists", HttpStatusCode.Conflict);
        }

        throw new CustomError("Could not create account", HttpStatusCode.InternalServerError);
    }
}
