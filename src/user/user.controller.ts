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
    @Get('invoke-new-tokens')
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
}
