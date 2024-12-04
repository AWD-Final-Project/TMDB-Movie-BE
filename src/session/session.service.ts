import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Session } from './schemas/session.schema';
import { Model, Types } from 'mongoose';

@Injectable()
export class SessionService {
    constructor(@InjectModel(Session.name) private readonly sessionModel: Model<Session>) {}

    async createNewSession(userId: string): Promise<Session> {
        const existingSession = await this.sessionModel.findOne({ userId: new Types.ObjectId(userId) });
        if (existingSession) {
            throw new ConflictException(`User's session already exists`);
        }

        const currentLogin = {
            loggedInAt: Date.now(),
        };

        return await this.sessionModel.create({
            userId: new Types.ObjectId(userId),
            lastLogin: currentLogin,
        });
    }

    async findSessionById(sessionId: string): Promise<Session> {
        return await this.sessionModel.findById(new Types.ObjectId(sessionId));
    }

    async findSessionByUserId(userId: string): Promise<Session> {
        return await this.sessionModel.findOne({ userId: new Types.ObjectId(userId) });
    }

    async addNewLoginHistory(userId: string, refreshToken: string): Promise<Session> {
        const currentLogin = {
            loggedInAt: Date.now(),
            refreshToken,
        };

        return await this.sessionModel.findOneAndUpdate(
            { userId: new Types.ObjectId(userId) },
            {
                $push: { loginHistory: currentLogin },
                lastLogin: currentLogin,
            },
            { new: true },
        );
    }

    async updateSession(sessionId: string, refreshToken: string): Promise<Session> {
        return await this.sessionModel.findByIdAndUpdate(
            new Types.ObjectId(sessionId),
            {
                $set: {
                    'lastLogin.refreshToken': refreshToken,
                    'loginHistory.$[elem].refreshToken': refreshToken,
                },
            },
            {
                arrayFilters: [{ 'elem.refreshToken': { $exists: true } }],
                new: true,
            },
        );
    }

    async handleLogoutSession(sessionId: string): Promise<void> {
        const logoutTime = Date.now();

        await this.sessionModel.findByIdAndUpdate(
            new Types.ObjectId(sessionId),
            {
                $set: {
                    'lastLogin.loggedOutAt': logoutTime,
                    'loginHistory.$[elem].loggedOutAt': logoutTime,
                },
            },
            {
                arrayFilters: [{ 'elem.loggedOutAt': { $exists: false } }],
            },
        );
    }
}
