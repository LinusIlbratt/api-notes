import { MiddlewareObj } from "@middy/core";
import jwt, { JwtPayload } from "jsonwebtoken";
import { APIGatewayProxyEvent } from "aws-lambda";

interface AuthenticatedEvent extends APIGatewayProxyEvent {
    user?: { id: string }; // Store userinfo from token
}

// Middleware for auth
export const authMiddleware = (): MiddlewareObj<AuthenticatedEvent> => {
    console.log("authMiddleware triggered");
    return {
        before: async (handler) => {
            console.log("All headers in the event:", handler.event.headers);

            const authHeader = handler.event.headers?.Authorization || handler.event.headers?.authorization;
            const token = authHeader?.split(" ")[1];
            console.log("Token received:", token);

            if (!token) {
                throw new Error("Unauthorized: Missing Authorization header");
            }

            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY as string);
              //  console.log("Decoded token:", decoded); 

                // Check if decoded is a object, JwTPayload
                if (typeof decoded === "object" && decoded !== null && "id" in decoded) {
                    handler.event.user = { id: decoded.id as string }; // Store `userId` in event
                    console.log("User ID added to event:", handler.event.user);
                } else {
                    throw new Error("Unauthorized: Missing user ID in token");
                }
            } catch (err) {
                console.error("JWT Verification Error:", err);
                throw new Error("Unauthorized: Invalid token");
            }
        },
    };
};


