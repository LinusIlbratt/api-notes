import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { sendResponse } from "../../response/index.js"
import bcrypt from 'bcryptjs';
import { nanoid } from "nanoid";
import { createAccount } from "./createAccount.js";
import { checkUserName } from "./checkUserName.js";

export const handler = async (
    event: APIGatewayProxyEvent
    ): Promise<APIGatewayProxyResult> => {
    try {
        const { username, password } = JSON.parse(event.body || "{}");

        const usernameExists = await checkUserName(username);

        if (usernameExists) {
            return sendResponse(400, { sucess: false, message: "Username already exists"});
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const userId = nanoid();

        const result = await createAccount(username, hashedPassword, userId);
        return sendResponse(200, result)

    } catch (error) {
        console.error("Something went wrong:", error);
        return sendResponse(400, { success: false, message: "Unable to process the request" });
    }
}