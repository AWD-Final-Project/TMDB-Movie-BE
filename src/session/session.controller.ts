import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
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
}
