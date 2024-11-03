import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { User } from './schemas/user.schema';
import BcryptHelper from 'src/helpers/bcrypt.helper';
import JWTHelper from 'src/helpers/jwt.helper';
import UserFilter from './user.filter';

@Injectable()
export class UserService {
    constructor(@InjectModel(User.name) private userModel: Model<User>) {}

    async register(email: string, username: string, password: string): Promise<User> {
        const existingUser = await this.userModel.findOne({
            $or: [{ email }, { username }],
        });
        if (existingUser) {
            throw new ConflictException('Email or username already exists');
        }

        const hashedPassword = await BcryptHelper.hash(password);

        const user = new this.userModel({ email, username, password: hashedPassword });
        return user.save();
    }

    async login(email: string, password: string): Promise<object> {
        const foundUser = await this.userModel.findOne({ email });
        if (!foundUser) {
            throw new ConflictException('User not found!');
        }

        const isPasswordMatch = await BcryptHelper.compare(password, foundUser.password);
        if (isPasswordMatch === false) {
            throw new BadRequestException('Credentials are incorrect!');
        }

        const accessToken = JWTHelper.generateToken({ email: foundUser.email, username: foundUser.username }, '15m');
        const refreshToken = uuidv4();

        return {
            user: UserFilter.makeBasicFilter(foundUser),
            accessToken,
            refreshToken,
        };
    }
}
