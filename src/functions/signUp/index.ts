import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { sendResponse } from "../../response/index.js"
import bcrypt from 'bcryptjs';
import { nanoid } from "nanoid";
import { createAccount } from "./createAccount.js";
import { checkUserName } from "./checkUserName.js";
import { handleError } from "../../response/handleError.js";
import { validateData} from "../../utils/validateData.js";
import { signUpRules } from "../../utils/validationRules.js";

export const handler = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    try {
        const { username, password } = JSON.parse(event.body || "{}");        
        
        const validationErrors = validateData({ username, password }, signUpRules);
        if (validationErrors.length > 0) {
            return handleError(400, validationErrors.join(", "));
        }

        if (await checkUserName(username)) {
            return handleError(400, "Username already exists");
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const userId = nanoid();
        await createAccount(username, hashedPassword, userId);
        
        return sendResponse(200, { success: true, userId, message: "User created successfully" });
    } catch (error: any) {
        console.error("Error in sign-up handler:", error);

        // Return error based on error type
        if (error.message === "Username already exists") {
            return handleError(400, error.message);
        }
        if (error.message === "Missing required fields") {
            return handleError(400, error.message);
        }
        return handleError(500);
    }
};
