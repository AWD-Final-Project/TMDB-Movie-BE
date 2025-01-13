// create-user.dto.ts
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class CreateUserDto {
    @IsEmail({}, { message: 'User register error: Invalid email address' })
    @IsNotEmpty({ message: 'User register error: Email is required' })
    email: string;

    @IsNotEmpty({ message: 'User register error: Username is required' })
    username: string;

    @IsNotEmpty({ message: 'User register error: Password is required' })
    @MinLength(3, { message: 'User register error: Password must be at least 3 characters long' })
    password: string;
}
