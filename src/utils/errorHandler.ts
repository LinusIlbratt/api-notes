import { MiddlewareObj, Request } from "@middy/core";
import { APIGatewayProxyResult } from "aws-lambda";
import { sendResponse } from "../response/index.js";

export enum HttpStatusCode {
    OK = 200,
    Created = 201,
    BadRequest = 400,
    Unauthorized = 401,
    NotFound = 404,
    Conflict = 409,
    InternalServerError = 500,
}

export class CustomError extends Error {
    statusCode: number;

    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
    }
}


export const errorHandler: MiddlewareObj = {
    onError: async (request: Request<any, any, Error | null, any, any>): Promise<APIGatewayProxyResult> => {
        console.error("Error occurred:", request.error);

        const error = request.error as CustomError;
        const statusCode = error?.statusCode || HttpStatusCode.BadRequest;

        return sendResponse(statusCode, {
            success: false,
            message: error?.message || "An error occurred",
        });
    },
};