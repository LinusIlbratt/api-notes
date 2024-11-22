import dotenv from 'dotenv';
dotenv.config();

import { getUser } from './getUser.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

interface LoginResponse {
    success: boolean;
    statusCode: number;
    token?: string;
    message?: string;
}

export async function authenticateUser(username: string, password: string): Promise<LoginResponse> {
    const user = await getUser(username);

    if (!user) {
        return { success: false, statusCode: 404, message: "User not found" };
    }

    const hashedPassword = user.password?.S;

    if (!hashedPassword || hashedPassword.trim() === "") {
        return { success: false, statusCode: 400, message: "User password is missing or invalid" };
    }

    const correctPassword = await bcrypt.compare(password, hashedPassword);

    if (!correctPassword) {
        return { success: false, statusCode: 401, message: "Incorrect username or password" };
    }

    const secretKey = process.env.JWT_SECRET_KEY;

    if (!secretKey) {
        return { success: false, statusCode: 500, message: "JWT_SECRET_KEY is not set in environment variables" };
    }

    const token = jwt.sign(
        { id: user.userId, username: user.username },
        secretKey,
        { expiresIn: 3600 }
    );

    return { success: true, statusCode: 200, token };
}