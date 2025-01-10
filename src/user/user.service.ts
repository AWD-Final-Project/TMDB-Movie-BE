import { Injectable, ConflictException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import BcryptHelper from 'src/helpers/bcrypt.helper';
import JWTHelper from 'src/helpers/jwt.helper';
import UserFilter from './user.filter';
import { Types } from 'mongoose';
import { SessionService } from 'src/session/session.service';
import { Movie } from 'src/movie/schemas/movie.schema';

@Injectable()
export class UserService {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<User>,
        @InjectModel(Movie.name) private readonly movieModel: Model<Movie>,
        private readonly sessionService: SessionService,
    ) {}

    async register(email: string, username: string, password: string): Promise<object> {
        const existingUser = await this.userModel.findOne({
            $or: [{ email }, { username }],
        });
        if (existingUser) {
            throw new ConflictException('Email or username already exists');
        }

        const hashedPassword = await BcryptHelper.hash(password);

        const newUser = new this.userModel({ email, username, password: hashedPassword });
        const returnedUser = await newUser.save();

        const newUserSession = await this.sessionService.createNewSession(returnedUser._id.toString());
        if (!newUserSession) {
            throw new InternalServerErrorException('Something went wrong creating user session');
        }

        return UserFilter.makeBasicFilter(returnedUser);
    }

    async login(
        email: string,
        password: string,
    ): Promise<{
        user: Partial<User>;
        accessToken: string;
        refreshToken: string;
    }> {
        const foundUser = await this.userModel.findOne({ email: email, type: 'local' });
        if (!foundUser) {
            throw new ConflictException('User not found!');
        }

        if (foundUser.type === 'local' && foundUser.status === 'inactive') {
            throw new BadRequestException('Please activate your account first!');
        }

        const isPasswordMatch = await BcryptHelper.compare(password, foundUser.password);
        if (isPasswordMatch === false) {
            throw new BadRequestException('Credentials are incorrect!');
        }

        const accessToken = JWTHelper.generateAccessToken(foundUser);
        const refreshToken = JWTHelper.generateRefreshToken(foundUser);
        await this.userModel.updateOne({ email }, { refreshToken });

        await this.sessionService.addNewLoginHistory(foundUser._id.toString(), refreshToken);
        return {
            user: UserFilter.makeBasicFilter(foundUser),
            accessToken,
            refreshToken,
        };
    }

    async logout(userId: string): Promise<void> {
        await this.userModel.updateOne({ _id: new Types.ObjectId(userId) }, { refreshToken: '' });
        const foundSession = await this.sessionService.findSessionByUserId(userId);
        if (!foundSession) {
            throw new BadRequestException('Session not found');
        }
        await this.sessionService.handleLogoutSession(foundSession._id.toString());
    }

    async getProfile(userId: string): Promise<object> {
        const foundUser = (await this.userModel.findById(new Types.ObjectId(userId)).lean()) as Partial<User>;
        if (!foundUser) {
            throw new BadRequestException('User not found');
        }

        return UserFilter.makeDetailFilter(foundUser);
    }

    async invokeNewTokens(refreshToken: string, userId: string): Promise<object> {
        const foundUser = await this.userModel.findById(new Types.ObjectId(userId));
        if (!foundUser) {
            throw new BadRequestException('User not found');
        }

        if (foundUser.refreshToken !== refreshToken) {
            throw new BadRequestException('Access denied!');
        }

        const newAccessToken = JWTHelper.generateAccessToken(foundUser);
        const newRefreshToken = JWTHelper.generateRefreshToken(foundUser);

        await this.userModel.updateOne({ _id: foundUser._id }, { refreshToken: newRefreshToken });
        await this.sessionService.updateSession(foundUser._id.toString(), newRefreshToken);

        return {
            user: UserFilter.makeBasicFilter(foundUser),
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        };
    }

    async findById(userId: string): Promise<Partial<User>> {
        return (await this.userModel.findById(new Types.ObjectId(userId)).lean()) as Partial<User>;
    }

    async findByEmail(userEmail: string): Promise<Partial<User>> {
        return (await this.userModel.findOne({ email: userEmail }).lean()) as Partial<User>;
    }

    async googleLogin(googleUser: any): Promise<{
        user: Partial<User>;
        accessToken: string;
        refreshToken: string;
    }> {
        const email = googleUser.email;
        const foundUser = await this.userModel.findOne({ email, type: 'google' });

        let accessToken = '';
        let refreshToken = '';
        let newUser = foundUser;

        if (!newUser) {
            const hashedPassword = await BcryptHelper.hash(googleUser.id);
            newUser = await this.userModel.create({
                email,
                username: email?.split('@')[0] ?? email,
                password: hashedPassword,
                type: 'google',
            });
            await this.sessionService.createNewSession(newUser._id.toString());
        } else {
            const isPasswordMatch = await BcryptHelper.compare(googleUser.id, newUser.password);
            if (isPasswordMatch === false) {
                throw new BadRequestException('Credentials are incorrect!');
            }
        }
        accessToken = JWTHelper.generateAccessToken(newUser);
        refreshToken = JWTHelper.generateRefreshToken(newUser);

        await this.userModel.updateOne({ email }, { refreshToken });
        await this.sessionService.addNewLoginHistory(newUser._id.toString(), refreshToken);

        return {
            user: UserFilter.makeBasicFilter(newUser),
            accessToken,
            refreshToken,
        };
    }

    async googleVerify(googleUserInfo: { email: string; googleId: string; name: string }): Promise<{
        user: Partial<User>;
        accessToken: string;
        refreshToken: string;
    }> {
        if (!googleUserInfo || !googleUserInfo.email || !googleUserInfo.googleId) {
            return null;
        }

        const foundUser = await this.userModel.findOne({ email: googleUserInfo.email, type: 'google' });
        let accessToken = '';
        let refreshToken = '';
        let newUser = foundUser;

        if (!newUser) {
            const hashedPassword = await BcryptHelper.hash(googleUserInfo.googleId);
            newUser = await this.userModel.create({
                email: googleUserInfo.email,
                username: googleUserInfo.name,
                password: hashedPassword,
                type: 'google',
            });
            await this.sessionService.createNewSession(newUser._id.toString());
        } else {
            const isPasswordMatch = await BcryptHelper.compare(googleUserInfo.googleId, newUser.password);
            if (isPasswordMatch === false) {
                throw new BadRequestException('Credentials are incorrect!');
            }
        }
        accessToken = JWTHelper.generateAccessToken(newUser);
        refreshToken = JWTHelper.generateRefreshToken(newUser);

        await this.userModel.updateOne({ email: newUser.email }, { refreshToken });
        await this.sessionService.addNewLoginHistory(newUser._id.toString(), refreshToken);
        return {
            user: UserFilter.makeBasicFilter(newUser),
            accessToken,
            refreshToken,
        };
    }

    async voteRating(movieId: string, rating: number): Promise<any> {
        {
            try {
                const foundMovie = await this.movieModel.findOne({ tmdb_id: movieId });
                if (!foundMovie) {
                    throw new BadRequestException('Movie not found');
                }
                console.log('foundMovie: ', foundMovie.vote_count);
                const newVoteCount = foundMovie.vote_count + 1;
                console.log('newVoteCount: ', newVoteCount);
                const newVoteAverage = (foundMovie.vote_average * foundMovie.vote_count + rating) / newVoteCount;

                await this.movieModel.updateOne(
                    { tmdb_id: movieId },
                    { vote_average: newVoteAverage, vote_count: newVoteCount },
                );

                return {
                    message: 'Rating updated successfully',
                };
            } catch (error) {
                throw new InternalServerErrorException(error.message);
            }
        }
    }
}
