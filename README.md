Notes API
The Notes API is a secure platform designed for managing and storing notes for individual users. Each note is tied to a specific user, and only authenticated users can access their own notes. The API supports the creation, reading, updating, restoration, and deletion of notes. It leverages AWS Lambda, API Gateway, DynamoDB, and Middy middleware for authentication and authorization.

Technologies Used
AWS API Gateway – API routing and request handling.
AWS Lambda – Serverless compute for backend logic.
AWS DynamoDB – NoSQL database for storing notes.
AWS CloudWatch – Logging and monitoring for API performance.
Middy – Middleware for handling authentication and input validation.

Endpoints
Public Endpoints (No authentication required)
POST /api/user/signup: Creates a new user account.
Protected Endpoints (Authentication required)
POST /api/login: Logs in and generates an authentication token for the user.
POST /api/create: Creates a new note for the authenticated user.
POST /api/restore: Restores a deleted note by setting isDeleted to false and expireAt to null.
GET /api/get: Retrieves all notes for the authenticated user.
PUT /api/update: Updates an existing note for the authenticated user.
DELETE /api/delete: Deletes a note for the authenticated user.

Note Object Structure
Each note consists of the following fields:

id (string): A unique identifier for the note.
title (string): The title of the note (max 50 characters).
text (string): The content of the note (max 300 characters).
createdAt (date): The timestamp when the note was created.
modifiedAt (date): The timestamp when the note was last modified.
isDeleted (number): Indicates whether the note is deleted (1 for deleted, 0 for active).
expireAt (number): TTL (Time-to-Live) timestamp used by DynamoDB for automatic deletion.

Error Handling
The API returns the following HTTP status codes along with a JSON response:

200 OK: The request was successful.
201 Created: The resource was successfully created (e.g., new note).
400 Bad Request: The request was invalid, such as missing or malformed data.
401 Unauthorized: The user is not authenticated or the session has expired.
404 Not Found: The requested resource does not exist.
409 Conflict: A conflict occurred, such as trying to create a note that already exists.
500 Internal Server Error: A server-side error occurred.
