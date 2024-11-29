import { editNote } from "../updateNote/editNote.js";
import middy from "@middy/core";
import jsonBodyParser from "@middy/http-json-body-parser";
import { authMiddleware } from "../../utils/authMiddleware.js";
import { errorHandler } from "../../utils/errorHandler.js";
import { sendResponse } from "../../response/index.js";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { getDeletedNote } from "./getDeletedNote.js";
import { CustomError, HttpStatusCode } from "../../utils/errorHandler.js";
import { validateData } from "../../utils/validateData.js";
import { noteIdValidationRules } from "../../utils/validationRules.js";

interface AuthenticatedEvent extends APIGatewayProxyEvent {
    user: { id: string };
}

export const handler = async (
    event: AuthenticatedEvent
): Promise<APIGatewayProxyResult> => {
    const { noteId } = event.body as { noteId?: string };

      // Validate input
      const validationErrors = validateData(event.body, noteIdValidationRules);
      if (validationErrors.length > 0) {
          throw new CustomError(validationErrors.join(", "), HttpStatusCode.BadRequest);
      }

    // Validate noteId
    if (!noteId) {
        throw new CustomError("noteId is required", HttpStatusCode.BadRequest);
    }

    const userId = event.user?.id!;

    try {
        // Fetch the deleted note
        await getDeletedNote(userId, noteId!);

        // Restore the note
        await editNote({
            userId,
            noteId,
            isDeleted: false,
        });
        
        return sendResponse(HttpStatusCode.OK, {
            success: true,
            message: `Note with ID "${noteId}" has been restored`
        });
    } catch (error) {
        console.error("Error restoring note:", error);
        if (error instanceof CustomError) {
            throw error;
        }
        throw new CustomError("Internal server error", HttpStatusCode.InternalServerError);
    }
};

// Wrap handler with Middy
export const main = middy(handler)
    .use(jsonBodyParser()) // Automatically parses JSON body
    .use(authMiddleware()) // Authentication middleware
    .use(errorHandler); // Error handling middleware

