import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';

dotenv.config();
const secret = process.env.JWT_SECRET;

class JWTHelper {
    static generateToken(payload: object, expiresIn: string): string {
        return jwt.sign(payload, secret, { expiresIn });
    }

    static verifyToken(token: string): object {
        return jwt.verify(token, secret);
    }

    static checkIfTokenExpiredError(error: any): boolean {
        return error instanceof jwt.TokenExpiredError;
    }
}

export default JWTHelper;
