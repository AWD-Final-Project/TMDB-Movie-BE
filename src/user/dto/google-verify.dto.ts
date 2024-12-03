// google-verify.dto.ts
import { IsNotEmpty } from 'class-validator';

export class GoogleVerifyDto {
    @IsNotEmpty({ message: 'Google login error: Id token is required' })
    idToken: string;
}
