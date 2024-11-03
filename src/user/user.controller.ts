import { Controller, Post, Body, BadRequestException, UsePipes, ValidationPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

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
    async login(@Body() loginUserDto: LoginUserDto) {
        try {
            const { email, password } = loginUserDto;
            if (!email || !password) {
                throw new BadRequestException('Email and username and password are required');
            }

            const data = await this.userService.login(email, password);
            if (data) {
                return {
                    statusCode: 200,
                    message: 'Login successfully',
                    data: data,
                };
            }
            throw new BadRequestException('Failed to login');
        } catch (error) {
            throw new BadRequestException('Login error: ' + error.message);
        }
    }
}
