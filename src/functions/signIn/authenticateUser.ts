import dotenv from 'dotenv';
dotenv.config();
import { getUser } from './getUser.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { CustomError, HttpStatusCode } from '../../utils/errorHandler.js';  // Använd CustomError för konsekvent felhantering

interface LoginResponse {
    success: boolean;
    statusCode: number;
    token?: string;
    message?: string;
}

export async function authenticateUser(username: string, password: string): Promise<LoginResponse> {
    const user = await getUser(username);

    if (!user) {
        throw new CustomError("User not found", HttpStatusCode.NotFound);  // 404
    }

    const hashedPassword = user.password?.S;
    if (!hashedPassword) {
        throw new CustomError("User password is missing or invalid", HttpStatusCode.BadRequest);  // 400
    }

    const correctPassword = await bcrypt.compare(password, hashedPassword);
    if (!correctPassword) {
        throw new CustomError("Incorrect username or password", HttpStatusCode.Unauthorized);  // 401
    }

    const secretKey = process.env.JWT_SECRET_KEY;
    if (!secretKey) {
        throw new CustomError("JWT_SECRET_KEY is not set in environment variables", HttpStatusCode.InternalServerError);  // 500
    }

    const token = jwt.sign(
        { id: user.userId?.S, username: user.username?.S },
        secretKey,
        { expiresIn: 3600 }
    );

    return { success: true, statusCode: HttpStatusCode.OK, token };  // 200
}
