import {
    Controller,
    Post,
    Body,
    BadRequestException,
    UsePipes,
    ValidationPipe,
    Get,
    Req,
    Res,
    UnauthorizedException,
    UseGuards,
    Delete,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Request, Response } from 'express';
import JWTHelper from 'src/helpers/jwt.helper';
import { GoogleAuthGuard } from 'src/helpers/google.guard.helper';
import { GoogleVerifyDto } from './dto/google-verify.dto';
import GoogleHelper from 'src/helpers/google.helper';
import { LocalAuthGuard } from 'src/auth/auth.local-guard';
import { AuthService } from 'src/auth/auth.service';
import { JwtAuthGuard } from 'src/auth/auth.jwt-guard';

@Controller('user')
export class UserController {
    constructor(
        private readonly userService: UserService,
        private readonly authService: AuthService,
    ) {}

    @Post('register')
    @UsePipes(new ValidationPipe({ transform: true }))
    async register(@Body() createUserDto: CreateUserDto) {
        try {
            const { email, username, password } = createUserDto;
            if (!email || !username || !password) {
                throw new BadRequestException('Email and username and password are required');
            }

            const data = await this.userService.register(email, username, password);
            if (data) {
                return {
                    statusCode: 201,
                    message: 'New user registered successfully',
                    data: data,
                };
            }
            throw new BadRequestException('Failed to register new user');
        } catch (error) {
            throw new BadRequestException('User register error: ' + error.message);
        }
    }

    @UseGuards(LocalAuthGuard)
    @Post('login')
    @UsePipes(new ValidationPipe({ transform: true }))
    async loginV2(@Req() req: Request, @Res() res: Response) {
        const user = req['user'];
        const data = await this.authService.login(user);
        return res.status(200).json({
            statusCode: 200,
            message: 'Login successfully',
            data: {
                user: {
                    id: user._id,
                    email: user.email,
                    username: user.username,
                },
                accessToken: data.access_token,
                refreshToken: data.refresh_token,
            },
        });
    }

    @UseGuards(JwtAuthGuard)
    @Get('logout')
    async logout(@Req() req: Request, @Res() res: Response) {
        await this.userService.logout(req['user']?.id);
        return res.status(200).json({
            statusCode: 200,
            message: 'Logout successfully',
        });
    }

    @UseGuards(JwtAuthGuard)
    @Get('profile')
    async getProfile(@Req() req: Request) {
        const user = req['user'];
        const data = await this.userService.getProfile(user?.id);

        return {
            statusCode: 200,
            message: 'Get profile successfully',
            data: data,
        };
    }

    @UseGuards(JwtAuthGuard)
    @Post('invoke-new-tokens')
    async invokeNewTokens(@Req() req: Request, @Res() res: Response) {
        const refreshToken = req.body?.refreshToken;
        if (!refreshToken) {
            throw new BadRequestException('Authorization credential is missing');
        }

        let decodedToken = null;
        try {
            decodedToken = JWTHelper.verifyToken(refreshToken) as { id: string };
        } catch (error) {
            throw new UnauthorizedException('Invalid or expired refresh token: ' + error.message);
        }

        const userId = decodedToken?.id;
        if (!userId) {
            throw new UnauthorizedException('Unauthorized user');
        }
        const data = (await this.userService.invokeNewTokens(refreshToken, userId)) as { refreshToken: string };

        return res.status(200).json({
            statusCode: 200,
            message: 'Invoke new tokens successfully',
            data: data,
        });
    }

    @Get('google/auth')
    @UseGuards(GoogleAuthGuard)
    async googleAuth() {
        // This method will be intercepted by the GoogleAuthGuard
    }

    @Get('google/callback')
    @UseGuards(GoogleAuthGuard)
    async googleLogin(@Req() req: Request, @Res() res: Response) {
        const user = req['user'];
        const data = await this.userService.googleLogin(user);
        return res.status(200).json({
            statusCode: 200,
            message: 'Google login successfully',
            data: data,
        });
    }

    @Post('google/verify')
    @UsePipes(new ValidationPipe({ transform: true }))
    async googleVerify(@Body() googleVerifyDto: GoogleVerifyDto, @Res() res: Response) {
        const { idToken } = googleVerifyDto;
        let googleUserInfo = {
            email: '',
            googleId: '',
            name: '',
        };
        try {
            googleUserInfo = (await GoogleHelper.verifyIdToken(idToken)) as {
                email: string;
                googleId: string;
                name: string;
            };
        } catch (error) {
            throw new BadRequestException('Google verify error: ' + error.message);
        }

        const data = await this.userService.googleVerify(googleUserInfo);
        return res.status(200).json({
            statusCode: 200,
            message: 'Google verify successfully',
            data: data,
        });
    }

    @UseGuards(JwtAuthGuard)
    @Post('vote-rating')
    @UsePipes(new ValidationPipe({ transform: true }))
    async voteRating(@Req() req: Request, @Res() res: Response) {
        const { movieId, value } = req.body;
        if (!movieId || !value) {
            throw new BadRequestException('Movie ID and rating value are required');
        }
        if (value < 0 || value > 10) {
            throw new BadRequestException('value must be between 0 and 10');
        }

        await this.userService.voteRating(user, movieId, value);
        return res.status(200).json({
            statusCode: 200,
            message: 'Vote value successfully',
            data: [],
        });
    }

    @UseGuards(JwtAuthGuard)
    @Get('rating-list')
    async getRatingList(@Req() req: Request, @Res() res: Response) {
        const user = req['user'];
        const ratingList = await this.userService.fetchRatingList(user);
        return res.status(200).json({
            statusCode: 200,
            message: 'Get rating list successfully',
            data: ratingList,
        });
    }

    @UseGuards(JwtAuthGuard)
    @Post('add-review')
    @UsePipes(new ValidationPipe({ transform: true }))
    async addReview(@Req() req: Request, @Body() body: any, @Res() res: Response) {
        const user = req['user'];
        const { movieId, content } = body;
        if (!movieId || !content) {
            throw new BadRequestException('Movie ID and content are required');
        }

        const review = await this.userService.addReview(user, movieId, content);
        return res.status(201).json({
            statusCode: 200,
            message: 'Review added successfully',
            data: review,
        });
    }
    @UseGuards(JwtAuthGuard)
    @Post('add-to-favorite')
    @UsePipes(new ValidationPipe({ transform: true }))
    async addToFavorite(@Req() req: Request, @Body() body: any, @Res() res: Response) {
        const user = req['user'];
        const { movieId } = body;
        if (!movieId) {
            throw new BadRequestException('Movie ID is required');
        }
        const favoriteMovie = await this.userService.addToFavorite(user, movieId);
        return res.status(201).json({
            statusCode: 201,
            message: 'Movie added to favorite list successfully',
            data: favoriteMovie,
        });
    }

    @UseGuards(JwtAuthGuard)
    @Delete('remove-from-favorite')
    @UsePipes(new ValidationPipe({ transform: true }))
    async removeFromFavorite(@Req() req: Request, @Body() body: any, @Res() res: Response) {
        const user = req['user'];
        const { movieId } = body;
        if (!movieId) {
            throw new BadRequestException('Movie ID is required');
        }

        await this.userService.removeFromFavorite(user, movieId);
        return res.status(200).json({
            statusCode: 200,
            message: 'Movie removed from favorite list successfully',
        });
    }

    @UseGuards(JwtAuthGuard)
    @Get('favorite-movies')
    async getFavoriteMovies(@Req() req: Request, @Res() res: Response) {
        const user = req['user'];
        const favoriteMovies = await this.userService.fetchFavoriteMovies(user);
        return res.status(200).json({
            statusCode: 200,
            message: 'Get favorite movies successfully',
            data: favoriteMovies,
        });
    }

    @UseGuards(JwtAuthGuard)
    @Post('add-to-watchlist')
    @UsePipes(new ValidationPipe({ transform: true }))
    async addToWatchList(@Req() req: Request, @Body() body: any, @Res() res: Response) {
        const user = req['user'];
        const { movieId } = body;
        if (!movieId) {
            throw new BadRequestException('Movie ID is required');
        }

        const watchListMovie = await this.userService.addToWatchList(user, movieId);
        return res.status(201).json({
            statusCode: 201,
            message: 'Movie added to watch list successfully',
            data: watchListMovie,
        });
    }

    @UseGuards(JwtAuthGuard)
    @Delete('remove-from-watchlist')
    @UsePipes(new ValidationPipe({ transform: true }))
    async removeFromWatchList(@Req() req: Request, @Body() body: any, @Res() res: Response) {
        const user = req['user'];
        const { movieId } = body;
        if (!movieId) {
            throw new BadRequestException('Movie ID is required');
        }

        await this.userService.removeFromWatchList(user, movieId);
        return res.status(200).json({
            statusCode: 200,
            message: 'Movie removed from watch list successfully',
        });
    }

    @UseGuards(JwtAuthGuard)
    @Get('watchlist-movies')
    async getWatchListMovies(@Req() req: Request, @Res() res: Response) {
        const user = req['user'];
        const watchListMovies = await this.userService.fetchWatchListMovies(user);
        return res.status(200).json({
            statusCode: 200,
            message: 'Get watchlist movies successfully',
            data: watchListMovies,
        });
    }
}
