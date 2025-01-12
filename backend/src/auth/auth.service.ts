import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import BcryptHelper from 'src/helpers/bcrypt.helper';
import { User } from 'src/user/schemas/user.schema';
import { UserService } from 'src/user/user.service';

import { ACCESS_TOKEN_EXPIRE, REFRESH_TOKEN_EXPIRE } from 'src/configs/time.config';

@Injectable()
export class AuthService {
    constructor(
        private userService: UserService,
        private jwtService: JwtService,
    ) {}

    async validateUser(email: string, password: string): Promise<Partial<User>> {
        const user = await this.userService.findByEmail(email);
        if (!user) {
            return null;
        }

        const isPasswordMatched = await BcryptHelper.compare(password, user.password);
        if (isPasswordMatched) {
            return {
                ...user,
                password: null,
            };
        }
        return null;
    }

    async login(user: Partial<User>) {
        const payload = { email: user.email, id: user._id, username: user.username };
        return {
            access_token: this.jwtService.sign(payload, { expiresIn: ACCESS_TOKEN_EXPIRE }),
            refresh_token: this.jwtService.sign(payload, { expiresIn: REFRESH_TOKEN_EXPIRE }),
        };
    }
}
