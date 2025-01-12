// auth.middleware.ts
import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import JWTHelper from 'src/helpers/jwt.helper';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
    constructor(private readonly userService: UserService) {}

    async use(req: Request, res: Response, next: NextFunction) {
        const accessToken = req.headers['authorization'];
        if (!accessToken) {
            throw new UnauthorizedException('Authentication credential is required!');
        }

        try {
            const decoded = JWTHelper.verifyToken(accessToken);
            req['user'] = decoded;
            next();
        } catch (error) {
            if (JWTHelper.checkIfTokenExpiredError(error) === true) {
                throw new UnauthorizedException('Token has expired!');
            }
            throw new UnauthorizedException('Authentication failed: ' + error.message);
        }
    }
}
