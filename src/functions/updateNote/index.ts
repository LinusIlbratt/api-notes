import middy from "@middy/core";
import jsonBodyParser from "@middy/http-json-body-parser";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { authMiddleware } from "../../utils/authMiddleware.js";
import { validateData } from "../../utils/validateData.js";
import { updateNoteValidationRules } from "../../utils/validationRules.js";
import { editNote } from "./editNote.js";
import { CustomError, HttpStatusCode } from "../../utils/errorHandler.js";
import { errorHandler } from "../../utils/errorHandler.js";
import { sendResponse } from "../../response/index.js";


interface AuthenticatedEvent extends APIGatewayProxyEvent {
    user: { id: string }; // UserId from JWT-token
}

export const handler = async (
    event: AuthenticatedEvent & { body: { noteId: string; title?: string; text?: string } }
): Promise<APIGatewayProxyResult> => {
    const { noteId, title, text } = event.body;

      // Validate field lengths
      const validationErrors = validateData(event.body, updateNoteValidationRules);
      if (validationErrors.length > 0) {
          throw new CustomError(validationErrors.join(", "), HttpStatusCode.BadRequest);
      }

    // Validate noteId
    if (!noteId) {
        throw new CustomError("noteId is required", HttpStatusCode.BadRequest);
    }

    // Validate at least one field to update
    if (!title && !text) {
        throw new CustomError(
            "At least one of title or text must be provided for update",
            HttpStatusCode.BadRequest
        );
    }

    // Get userId from middleware
    const userId = event.user?.id;
    if (!userId) {
        throw new CustomError("Unauthorized: Missing user ID", HttpStatusCode.Unauthorized);
    }

    try {
        const updatedNote = await editNote({ userId, noteId, title, text });
    
        return sendResponse(HttpStatusCode.OK, {
            success: true,
            updatedNote,
        });
    } catch (error: any) {
        console.error("Error in updateNote handler:", error);
    
        if (error instanceof CustomError) {
            return sendResponse(error.statusCode, { success: false, message: error.message });
        }
            
        return sendResponse(HttpStatusCode.InternalServerError, {
            success: false,
            message: "Internal server error",
        });
    }
    
};

export const main = middy(handler)
    .use(jsonBodyParser()) 
    .use(authMiddleware()) 
    .use(errorHandler); 
