import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
dotenv.config();

import { ACCESS_TOKEN_EXPIRE, REFRESH_TOKEN_EXPIRE } from '../configs/time.config';
import { User } from 'src/user/schemas/user.schema';

import { JWT_SECRET } from '../configs/secret.config';

class JWTHelper {
    static generateToken(payload: object, expiresIn: string): string {
        return jwt.sign(payload, JWT_SECRET, { expiresIn });
    }

    static generateAccessToken(payload: Partial<User>): string {
        return this.generateToken(
            {
                id: payload._id.toString(),
                email: payload.email,
                username: payload.username,
                role: payload.role,
                status: payload.status,
            },
            ACCESS_TOKEN_EXPIRE,
        );
    }

    static generateRefreshToken(payload: Partial<User>): string {
        return this.generateToken(
            {
                id: payload._id.toString(),
                revokedAt: new Date(),
            },
            REFRESH_TOKEN_EXPIRE,
        );
    }

    static verifyToken(token: string): any {
        return jwt.verify(token, JWT_SECRET);
    }

    static checkIfTokenExpiredError(error: any): boolean {
        return error instanceof jwt.TokenExpiredError;
    }

    static checkIfTokenSignatureError(error: any): boolean {
        return error instanceof jwt.JsonWebTokenError && error.message === 'invalid signature';
    }
}

export default JWTHelper;
