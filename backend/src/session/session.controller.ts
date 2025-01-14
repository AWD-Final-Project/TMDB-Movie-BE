import { BadRequestException, Body, Controller, Post, Req } from '@nestjs/common';
import { SessionService } from './session.service';

@Controller('verify')
export class SessionController {
    constructor(private readonly sessionService: SessionService) {}

    @Post('send-activate-email')
    async sendActiveEmail(@Body('email') email: string) {
        if (!email) {
            throw new BadRequestException('Email is required');
        }

        try {
            await this.sessionService.sendOtpToVerifyEmail(email);

            return {
                statusCode: 200,
                message: 'Send active email successfully',
                data: [],
            };
        } catch (error) {
            throw new BadRequestException('Send active email error: ' + error.message);
        }
    }

    @Post('confirm-activate-otp')
    async confirmActivateOtp(@Body('email') email: string, @Body('otp') otp: string) {
        if (!email) {
            throw new BadRequestException('Email is required');
        }
        if (!otp) {
            throw new BadRequestException('OTP is required');
        }
        try {
            const isOtpValid = await this.sessionService.verifyActivateOTP(email, otp);
            if (isOtpValid) {
                return {
                    statusCode: 200,
                    message: 'OTP is valid',
                    data: [],
                };
            }
            throw new BadRequestException('OTP is invalid');
        } catch (error) {
            throw new BadRequestException('Confirm OTP error: ' + error.message);
        }
    }
    @Post('send-reset-pass-email')
    async sendResetPassEmail(@Body('email') email: string) {
        if (!email) {
            throw new BadRequestException('Email is required');
        }

        try {
            await this.sessionService.sendOtpToResetPassword(email);

            return {
                statusCode: 200,
                message: 'Send reset password email successfully',
                data: [],
            };
        } catch (error) {
            throw new BadRequestException('Send reset password email error: ' + error.message);
        }
    }
    @Post('confirm-reset-pass-otp')
    async confirmResetPassOtp(@Body('email') email: string, @Body('otp') otp: string) {
        if (!email) {
            throw new BadRequestException('Email is required');
        }
        if (!otp) {
            throw new BadRequestException('OTP is required');
        }
        try {
            const result = await this.sessionService.verifyResetPasswordOTP(email, otp);
            if (result) {
                return {
                    statusCode: 200,
                    message: 'OTP is valid',
                    data: result,
                };
            }
            throw new BadRequestException('OTP is invalid');
        } catch (error) {
            throw new BadRequestException('Confirm OTP error: ' + error.message);
        }
    }

    @Post('reset-password')
    async resetPassword(
        @Req() req: Request,
        @Body('password') password: string,
        @Body('confirmPassword') confirmPassword: string,
    ) {
        if (!password) {
            throw new BadRequestException('Password is required');
        }
        if (!confirmPassword) {
            throw new BadRequestException('Confirm password is required');
        }
        if (password !== confirmPassword) {
            throw new BadRequestException('Password and confirm password do not match');
        }
        try {
            const userId = req['user'].id;
            const result = await this.sessionService.resetPassword(userId, password);
            if (result) {
                return {
                    statusCode: 200,
                    message: 'Reset password successfully',
                    data: result,
                };
            }
        } catch (error) {
            throw new BadRequestException('Reset password error: ' + error.message);
        }
    }
}
