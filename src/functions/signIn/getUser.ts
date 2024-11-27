import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
import { CustomError, HttpStatusCode } from "../../utils/errorHandler.js";

const dynamoDbClient = new DynamoDBClient();

export async function getUser(username: string) {
    try {
        const params = {
            TableName: "users-dev",
            Key: {
                username: { S: username }, 
            },
        };

        const userData = await dynamoDbClient.send(new GetItemCommand(params));

        if (!userData.Item) {           
            throw new CustomError("User not found", HttpStatusCode.NotFound);
        }

        return userData.Item;
    } catch (error) {
        console.error("Error fetching user:", error);

        if (!(error instanceof CustomError)) {
            throw new CustomError("Failed to fetch user data", HttpStatusCode.InternalServerError);
        }

        throw error; 
    }
}
