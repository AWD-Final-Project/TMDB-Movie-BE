import { Injectable, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User } from './schemas/user.schema';

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

        const SALT = bcrypt.genSaltSync(10);
        const hashedPassword = await bcrypt.hash(password, SALT);

        const user = new this.userModel({ email, username, password: hashedPassword });
        return user.save();
    }
}
