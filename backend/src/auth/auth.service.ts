import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import BcryptHelper from 'src/helpers/bcrypt.helper';
import { User } from 'src/user/schemas/user.schema';
import { UserService } from 'src/user/user.service';

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

    async login(user: any) {
        try {
            const response = await this.userService.updateLogin(user?._id);
            return response;
        } catch (error: any) {
            throw new BadRequestException(error.message ?? 'Error while logging in');
        }
    }
}
