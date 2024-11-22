import { sendResponse } from "./index.js";

export const handleError = (statusCode: number, message: string = "", errorDetails: string = "") => {
    let responseMessage = message || ""; // message is always a string

    if (!responseMessage) {
        switch (statusCode) {
            case 400:
                responseMessage = 'Bad Request: The request is malformed or invalid.';
                break;
            case 401:
                responseMessage = 'Unauthorized: You need to log in to access this resource.';
                break;
            case 403:
                responseMessage = 'Forbidden: You dont have permission to access this resource.';
                break;
            case 404:
                responseMessage = 'Not Found: The resource you requested could not be found.';
                break;
            case 502:
                responseMessage = 'Bad Gateway: The server received an invalid response from an upstream server.';
                break;
            case 503:
                responseMessage = 'Service Unavailable: The server is temporarily unavailable, please try again later.';
                break;
            case 500:
                responseMessage = 'Internal Server Error: Something went wrong on the server.';
                break;
            default:
                responseMessage = 'An unexpected error occurred.';
        }
    }

    // Return the response with a general message and detailed error message
    return sendResponse(statusCode, {
        message: responseMessage || "Something went wrong",  // General message
        error: errorDetails || "No additional details provided",  // Specific error details
    });
};