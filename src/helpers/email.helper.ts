import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
require('dotenv').config();

@Injectable()
export class EmailHelper {
    constructor(private configService: ConfigService) {}

    // Static sendEmail method
    static async sendEmail(email: string, otpPasscode: string): Promise<boolean> {
        const otpMessage = `
            <p>Thank you for registering an account on My TMDB-Movie Application. Your OTP code is:</p>
            <h2>${otpPasscode}</h2>
            <p>Please enter this code to verify your email address.</p>
            <strong>Note: The One-Time Password (OTP) is valid for 5 minutes.</strong>
        `;

        try {
            const transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 587,
                secure: false,
                auth: {
                    user: process.env.EMAIL_USERNAME,
                    pass: process.env.EMAIL_PASSWORD,
                },
            });

            const info = await transporter.sendMail({
                from: `"My TMDB-Movie" <myaiassistant24@gmail.com>`, // Sender address using static email
                to: email, // Receiver address
                subject: '[My TMDB-Movie] Verify Email', // Subject line
                text: `Your OTP code is: ${otpPasscode}`, // Plain text body
                html: otpMessage, // HTML body
            });

            return info.accepted.length > 0;
        } catch (error) {
            console.error('Failed to send OTP email:', error);
            return false;
        }
    }
}
