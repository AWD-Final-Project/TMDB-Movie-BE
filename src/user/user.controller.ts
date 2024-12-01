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
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { Request, Response } from 'express';
import JWTHelper from 'src/helpers/jwt.helper';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

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

    @Post('login')
    @UsePipes(new ValidationPipe({ transform: true }))
    async login(@Body() loginUserDto: LoginUserDto, @Res() res: Response) {
        try {
            const { email, password } = loginUserDto;
            if (!email || !password) {
                throw new BadRequestException('Email and username and password are required');
            }

            const data = await this.userService.login(email, password);
            if (data) {
                return res.status(200).json({
                    statusCode: 200,
                    message: 'Login successfully',
                    data: {
                        user: data.user,
                        accessToken: data.accessToken,
                        refreshToken: data.refreshToken,
                    },
                });
            }
            throw new BadRequestException('Failed to login');
        } catch (error) {
            throw new BadRequestException('Login error: ' + error.message);
        }
    }

    @Get('logout')
    async logout(@Req() req: Request, @Res() res: Response) {
        await this.userService.logout(req['user']?.id);
        return res.status(200).json({
            statusCode: 200,
            message: 'Logout successfully',
        });
    }

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
}
