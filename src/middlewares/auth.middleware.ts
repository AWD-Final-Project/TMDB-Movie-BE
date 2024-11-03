// auth.middleware.ts
import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import JWTHelper from 'src/helpers/jwt.helper';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        const token = req.headers['authorization'];
        if (!token) {
            throw new UnauthorizedException('Authentication credential is required!');
        }

        try {
            const decoded = JWTHelper.verifyToken(token);
            req['user'] = decoded;
            next();
        } catch (error) {
            throw new UnauthorizedException('Authentication failed: ' + error.message);
        }
    }
}
