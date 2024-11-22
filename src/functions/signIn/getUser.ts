import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

const dynamoDbClient = new DynamoDBClient();
const db = DynamoDBDocumentClient.from(dynamoDbClient)

export async function getUser(username: string) {

    try {
        const params = {
            TableName: 'users-dev',
            Key: {
                username: { S: username }
            }
        }

        const userData = await db.send(new GetItemCommand(params));

        if (userData?.Item)
            return userData.Item;
        else
            return false

    } catch (error) {
        console.error("Error fetching user:", error);
        return null;
    }
}