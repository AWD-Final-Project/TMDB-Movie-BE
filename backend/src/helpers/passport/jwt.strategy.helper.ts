import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { JWT_SECRET } from 'src/configs/secret.config';

@Injectable()
export class JwtStrategyHelper extends PassportStrategy(Strategy) {
    constructor() {
        super({
            ignoreExpiration: false,
            secretOrKey: JWT_SECRET,
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        });
    }

    async validate(payload: any) {
        return {
            email: payload.email,
            id: payload.id,
            username: payload.username,
        };
    }
}
