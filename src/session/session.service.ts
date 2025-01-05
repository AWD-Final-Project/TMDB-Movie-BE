import { BadRequestException, ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Session } from './schemas/session.schema';
import { User } from 'src/user/schemas/user.schema';
import { Model, Types } from 'mongoose';
import { generateOtpCode } from '../utils/otp.util';
import { MongooseUtil } from '../utils/mongoose.util';
import { EmailHelper } from 'src/helpers/email.helper';
@Injectable()
export class SessionService {
    constructor(
        @InjectModel(Session.name) private readonly sessionModel: Model<Session>,
        @InjectModel(User.name) private readonly userModel: Model<User>,
    ) {}

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

    async sendOtpToVerifyEmail(userEmail: string): Promise<void> {
        // Generate OTP
        const otp = generateOtpCode();

        // Find the user by email
        const user = await this.userModel.findOne({ email: userEmail });
        if (!user) {
            throw new BadRequestException('User not found');
        }
        if (user.status === 'active') {
            throw new BadRequestException('This account is already activated');
        }

        // Find the access record for the user
        const foundAccess = await this.sessionModel.findOne({
            userId: MongooseUtil.convertToMongooseObjectIdType(user.id),
        });
        if (!foundAccess) {
            throw new BadRequestException('User access record not found');
        }

        try {
            // Send the OTP email
            await EmailHelper.sendEmail(user.email, otp.code.toString());

            // Save the OTP to the access record
            foundAccess.otp = {
                code: otp.code.toString(),
                expiredAt: new Date(Date.now() + 5 * 60 * 1000), // OTP valid for 5 minutes
            };
            await foundAccess.save();
        } catch (error) {
            throw new InternalServerErrorException('Failed to send OTP via email');
        }
    }

    async verifyActivateOTP(userEmail: string, otpCode: string) {
        // Find the user by email
        const user = await this.userModel.findOne({ email: userEmail });
        if (!user) {
            throw new BadRequestException('User not found');
        } else if (user.status === 'active') {
            throw new BadRequestException('This account is already activated');
        }

        // Find the access record for the user
        const foundAccess = await this.sessionModel.findOne({
            userId: MongooseUtil.convertToMongooseObjectIdType(user.id),
        });
        if (!foundAccess) {
            throw new ConflictException('Something went wrong');
        } else if (!foundAccess?.otp?.code || !foundAccess?.otp?.expiredAt) {
            throw new ConflictException('OTP code does not exist');
        }

        const otp = foundAccess.otp;

        // Check if OTP code matches
        if (otp.code !== otpCode) {
            throw new ConflictException('OTP code is incorrect');
        }

        // Check if OTP has expired
        else if (new Date() > new Date(otp.expiredAt)) {
            throw new ConflictException('OTP code is expired');
        }

        // Update email_verified status to true
        const updatedUser = await this.userModel.updateOne({ email: user.email }, { status: 'active' }, { new: true });

        return updatedUser;
    }

    async sendOtpToResetPassword(userEmail: string): Promise<void> {
        // Generate OTP
        const otp = generateOtpCode();

        // Find the user by email
        const user = await this.userModel.findOne({ email: userEmail });
        if (!user) {
            throw new BadRequestException('User not found');
        }

        // Find the access record for the user
        const foundAccess = await this.sessionModel.findOne({
            userId: MongooseUtil.convertToMongooseObjectIdType(user.id),
        });
        if (!foundAccess) {
            throw new BadRequestException('User access record not found');
        }

        try {
            // Send the OTP email
            await EmailHelper.sendResetPasswordEmail(user.email, otp.code.toString());

            // Save the OTP to the access record
            foundAccess.otpResetPassword = {
                code: otp.code.toString(),
                expiredAt: new Date(Date.now() + 5 * 60 * 1000), // OTP valid for 5 minutes
            };
            await foundAccess.save();
        } catch (error) {
            throw new InternalServerErrorException('Failed to send OTP via email');
        }
    }
}
