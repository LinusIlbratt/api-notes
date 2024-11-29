# Notes API

The **Notes API** is a secure platform designed for managing and storing notes for individual users. Each note is tied to a specific user, and only authenticated users can access their own notes. The API supports the creation, reading, updating, restoration, and deletion of notes. It leverages **AWS Lambda**, **API Gateway**, **DynamoDB**, and **Middy middleware** for authentication and authorization.

Download export file here and import it to Insomnia/Postman to test the endpoints.
[Download Insomnia Export Here](./docs/Linus_Insomnia_API_Notes.json)

## Technologies Used
- **AWS API Gateway** – API routing and request handling.
- **AWS Lambda** – Serverless compute for backend logic.
- **AWS DynamoDB** – NoSQL database for storing notes.
- **AWS CloudWatch** – Logging and monitoring for API performance.
- **Middy** – Middleware for handling authentication and input validation.

## Endpoints

### Public Endpoints (No authentication required)

- **POST /api/user/signup**: Create a new user account.

  Signup to be able to login and use the API.

  **Request Body:**
  ```json
  {
    "username": "your_username",
    "password": "your_password"
  }
  ```

  **Response:**
  ```json
  {
    "success": true,
    "userId": "your_userId",
    "message": "User created successfully"
  }
  ```

- **POST /api/login**: Log in and generate an authentication token for the user.

  Authenticate a user and retrieve a JWT token.

  **Request Body:**
  ```json
  {
    "username": "your_username",
    "password": "your_password"
  }
  ```

  **Response:**
  ```json
  {
    "success": true,
    "token": "your_token"
  }
  ```

### Protected Endpoints (Authentication required)

- **POST /api/create**: Create a new note for the authenticated user.

  Add a note.

  **Request Body:**
  ```json
  {
    "title": "note_title",
    "text": "note_text"
  }
  ```

  **Response:**
  ```json
  {
    "success": true,
    "noteId": "the_noteId"
  }
  ```

- **GET /api/get**: Retrieve all notes for the authenticated user.

  Retrieve all notes.

  **Response:**
  ```json
  {
    "success": true,
    "notes": [
      {
        "modifiedAt": "2024-11-26T11:52:51.830Z",
        "noteId": "noteId",
        "userId": "userId",
        "createdAt": "2024-11-25T12:30:29.489Z",
        "isDeleted": 0,
        "text": "note_text",
        "title": "the_title"
      }
    ]
  }
  ```

- **POST /api/create**: Create a note.

  **Request Body:**
  ```json
  {
    "title": "note_title",
    "text": "note_text"
  }
  ```

  **Response:**
  ```json
  {
    "success": true,
    "id": "note_id"
  }
  ```

- **DELETE /api/delete**: Soft delete a note with a TTL timer.

  **Request Body:**
  ```json
  {
    "noteId": "noteId"
  }
  ```

  **Response:**
  ```json
  {
    "success": true,
    "message": "You have deleted the note with the id \"noteId\""
  }
  ```

- **GET /api/getDeletedNotes**: Retrieve all notes marked for deletion.

  **Response:**
  ```json
  {
    "success": true,
    "notes": [
      {
        "expireAt": 1733752146,
        "modifiedAt": "2024-11-29T08:53:11.454Z",
        "noteId": "noteId",
        "userId": "userId",
        "createdAt": "2024-11-29T07:26:14.789Z",
        "isDeleted": 1,
        "text": "note_text",
        "title": "note_title"
      }
    ]
  }
  ```

- **POST /api/restore**: Restore a soft deleted note and set the TTL timer to null.

  **Request Body:**
  ```json
  {
    "noteId": "noteId"
  }
  ```

  **Response:**
  ```json
  {
    "success": true,
    "message": "Note with ID \"noteId\" has been restored"
  }
  ```

## Error Handling

The API returns the following HTTP status codes along with a JSON response:
- **200 OK**: The request was successful.
- **201 Created**: The resource was successfully created (e.g., a new note).
- **400 Bad Request**: The request was invalid, such as missing or malformed data.
- **401 Unauthorized**: The user is not authenticated or the session has expired.
- **404 Not Found**: The requested resource does not exist.
- **409 Conflict**: A conflict occurred, such as trying to create a note that already exists.
- **500 Internal Server Error**: A server-side error occurred.

