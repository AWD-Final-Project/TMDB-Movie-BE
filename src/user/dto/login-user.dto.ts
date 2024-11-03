// create-user.dto.ts
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class LoginUserDto {
    @IsEmail({}, { message: 'User login error: Invalid email address' })
    @IsNotEmpty({ message: 'User login error: Email is required' })
    email: string;

    @IsNotEmpty({ message: 'User login error: Password is required' })
    @MinLength(3, { message: 'User login error: Password must be at least 3 characters long' })
    password: string;
}
