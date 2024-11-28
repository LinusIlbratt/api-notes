import { MiddlewareObj } from "@middy/core";
import jwt from "jsonwebtoken";
import { APIGatewayProxyEvent } from "aws-lambda";
import { CustomError, HttpStatusCode } from "./errorHandler.js";

interface AuthenticatedEvent extends APIGatewayProxyEvent {
    user?: { id: string }; 
}

export const authMiddleware = (): MiddlewareObj<AuthenticatedEvent> => {
    console.log("authMiddleware triggered");
    return {
        before: async (handler) => {
            console.log("All headers in the event:", handler.event.headers);

            const authHeader = handler.event.headers?.Authorization || handler.event.headers?.authorization;
            const token = authHeader?.split(" ")[1];
            console.log("Token received:", token);

            if (!token) {
                
                throw new CustomError("Unauthorized: Missing Authorization header", HttpStatusCode.Unauthorized);
            }

            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY as string);
                if (typeof decoded === "object" && decoded !== null && "id" in decoded) {
                    handler.event.user = { id: decoded.id as string }; 
                    console.log("User ID added to event:", handler.event.user);
                } else {
                    
                    throw new CustomError("Unauthorized: Missing user ID in token", HttpStatusCode.Unauthorized);
                }
            } catch (err) {
                console.error("JWT Verification Error:", err);
                
                throw new CustomError("Unauthorized: Invalid token", HttpStatusCode.Unauthorized);
            }
        },
    };
};
