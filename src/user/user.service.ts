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
import { FavoriteMovie } from './schemas/favorite-movie.schema';
import { WatchListMovie } from './schemas/watchlist-movie.schema';
import { UserRatingList } from './schemas/user-rating-list.schema';

@Injectable()
export class UserService {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<User>,
        @InjectModel(Movie.name) private readonly movieModel: Model<Movie>,
        @InjectModel(FavoriteMovie.name) private readonly favoriteMovieModel: Model<FavoriteMovie>,
        @InjectModel(WatchListMovie.name) private readonly watchListMovieModel: Model<WatchListMovie>,
        @InjectModel(UserRatingList.name) private readonly userRatingListModel: Model<UserRatingList>,
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

    async voteRating(user: any, movieId: string, rating: number): Promise<any> {
        {
            try {
                const foundMovie = await this.movieModel.findOne({ _id: new Types.ObjectId(movieId) });
                if (!foundMovie) {
                    throw new BadRequestException('Movie not found');
                }
                const newVoteCount = foundMovie.vote_count + 1;
                const newVoteAverage = (foundMovie.vote_average * foundMovie.vote_count + rating) / newVoteCount;

                await this.movieModel.updateOne(
                    { _id: new Types.ObjectId(movieId) },
                    { vote_average: newVoteAverage, vote_count: newVoteCount },
                );

                const foundUserRating = await this.userRatingListModel.findOne({
                    user_id: user.id,
                });
                console.log(foundUserRating);
                if (!foundUserRating) {
                    const newUserRating = new this.userRatingListModel({
                        user_id: user.id,
                        rating_list: [
                            {
                                movie_id: new Types.ObjectId(movieId),
                                rating: rating,
                            },
                        ],
                    });
                    await newUserRating.save();
                } else {
                    const foundRating = await this.userRatingListModel.findOne({
                        user_id: user.id,
                        rating_list: {
                            $elemMatch: {
                                movie_id: new Types.ObjectId(movieId),
                            },
                        },
                    });
                    if (foundRating) {
                        await this.userRatingListModel.updateOne(
                            { user_id: user.id, 'rating_list.movieId': foundMovie._id },
                            { $set: { 'rating_list.$.rating': rating } },
                        );
                    } else {
                        foundUserRating.rating_list.push({
                            movie_id: new Types.ObjectId(movieId),
                            rating: rating,
                        });
                    }
                    await foundUserRating.save();
                }

                return {
                    message: 'Rating updated successfully',
                };
            } catch (error) {
                throw new InternalServerErrorException(error.message);
            }
        }
    }

    async fetchRatingList(user: any): Promise<any> {
        const foundUserRating = await this.userRatingListModel.findOne({ user_id: user.id }).lean();
        if (!foundUserRating) {
            return [];
        }
        const movies = await this.movieModel
            .find({ _id: { $in: foundUserRating.rating_list.map(item => item.movie_id) } })
            .lean();
        const moviesFilters = [];
        for (const movie of movies) {
            const { id, title, poster_path, backdrop_path, popularity, vote_average, vote_count, genres } = movie;
            const movieFilter = {
                id,
                title,
                poster_path,
                backdrop_path,
                popularity,
                vote_average,
                vote_count,
                genres,
            };
            moviesFilters.push(movieFilter);
        }
        return moviesFilters;
    }
    async addReview(user: any, movieId: string, content: string): Promise<any> {
        const foundMovie = await this.movieModel.findOne({ _id: new Types.ObjectId(movieId) });
        if (!foundMovie) {
            throw new BadRequestException('Movie not found');
        }

        const review = {
            author: user.username,
            author_details: {
                name: user.name,
                username: user.username,
                avatar_path: user.avatar_path,
                rating: 8,
            },
            content: content,
            created_at: new Date(),
            id: new Types.ObjectId().toString(),
            updated_at: new Date(),
            url: '',
        };

        foundMovie.reviews.push(review);
        await foundMovie.save();

        return review;
    }
    async addToFavorite(user: any, movieId: string): Promise<any> {
        const foundMovie = await this.movieModel.findOne({ _id: new Types.ObjectId(movieId) });
        if (!foundMovie) {
            throw new BadRequestException('Movie not found');
        }

        const foundUserFavorite = await this.favoriteMovieModel.findOne({ user_id: user.id });
        if (!foundUserFavorite) {
            const favoriteMovie = new this.favoriteMovieModel({
                user_id: user.id,
                favorites: [foundMovie._id],
            });
            await favoriteMovie.save();
            return favoriteMovie;
        } else {
            const foundFavorite = await this.favoriteMovieModel.findOne({
                user_id: user.id,
                favorites: foundMovie._id,
            });
            if (foundFavorite) {
                throw new ConflictException(`Movie with ID ${movieId} is already in the favorite list`);
            }
            foundUserFavorite.favorites.push(foundMovie._id as Types.ObjectId);
            await foundUserFavorite.save();
            return foundUserFavorite;
        }
    }

    async removeFromFavorite(user: any, movieId: string): Promise<void> {
        const foundFavoriteUser = await this.favoriteMovieModel.findOne({ user_id: user.id });
        if (!foundFavoriteUser) {
            throw new BadRequestException('Not found data favorite movies of user');
        }
        const index = foundFavoriteUser.favorites.indexOf(new Types.ObjectId(movieId));
        if (index > -1) {
            foundFavoriteUser.favorites.splice(index, 1);
            await foundFavoriteUser.save();
        } else {
            throw new BadRequestException('Movie not found in favorites');
        }
    }
    async fetchFavoriteMovies(user: any): Promise<any> {
        const favoriteMovies = await this.favoriteMovieModel.findOne({ user_id: user.id }).lean();
        if (!favoriteMovies) {
            return [];
        }
        const movies = await this.movieModel.find({ _id: { $in: favoriteMovies.favorites } }).lean();
        const moviesFilters = [];
        for (const movie of movies) {
            const {
                id,
                title,
                overview,
                release_date,
                poster_path,
                backdrop_path,
                popularity,
                vote_average,
                vote_count,
                genres,
            } = movie;
            const movieFilter = {
                id,
                title,
                overview,
                release_date,
                poster_path,
                backdrop_path,
                popularity,
                vote_average,
                vote_count,
                genres,
            };
            moviesFilters.push(movieFilter);
        }
        return moviesFilters;
    }

    async addToWatchList(user: any, movieId: string): Promise<any> {
        const foundMovie = await this.movieModel.findOne({ _id: new Types.ObjectId(movieId) });
        if (!foundMovie) {
            throw new BadRequestException('Movie not found');
        }

        const foundUserWatchList = await this.watchListMovieModel.findOne({ user_id: user.id });
        if (!foundUserWatchList) {
            const watchListMovie = new this.watchListMovieModel({
                user_id: user.id,
                watchlist: [foundMovie._id],
            });
            await watchListMovie.save();
            return watchListMovie;
        } else {
            const foundWatchList = await this.watchListMovieModel.findOne({
                user_id: user.id,
                watch_list: foundMovie._id,
            });
            if (foundWatchList) {
                throw new ConflictException(`Movie with ID ${movieId} is already in the watch list`);
            }
            foundUserWatchList.watch_list.push(foundMovie._id as Types.ObjectId);
            await foundUserWatchList.save();
            return foundUserWatchList;
        }
    }

    async removeFromWatchList(user: any, movieId: string): Promise<any> {
        const foundWatchListUser = await this.watchListMovieModel.findOne({ user_id: user.id });
        if (!foundWatchListUser) {
            throw new BadRequestException('Not found data watch list of user');
        }
        const index = foundWatchListUser.watch_list.indexOf(new Types.ObjectId(movieId));
        if (index > -1) {
            foundWatchListUser.watch_list.splice(index, 1);
            await foundWatchListUser.save();
        } else {
            throw new BadRequestException('Movie not found in watch list');
        }
    }

    async fetchWatchListMovies(user: any): Promise<any> {
        const watchListMovies = await this.watchListMovieModel.findOne({ user_id: user.id }).lean();
        if (!watchListMovies) {
            return [];
        }
        const movies = await this.movieModel.find({ _id: { $in: watchListMovies.watch_list } }).lean();
        const moviesFilters = [];
        for (const movie of movies) {
            const {
                id,
                title,
                overview,
                release_date,
                poster_path,
                backdrop_path,
                popularity,
                vote_average,
                vote_count,
                genres,
            } = movie;
            const movieFilter = {
                id,
                title,
                overview,
                release_date,
                poster_path,
                backdrop_path,
                popularity,
                vote_average,
                vote_count,
                genres,
            };
            moviesFilters.push(movieFilter);
        }
        return moviesFilters;
    }
}
