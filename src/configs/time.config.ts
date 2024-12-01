import * as dotenv from 'dotenv';
dotenv.config();

export const ACCESS_TOKEN_EXPIRE = process.env.ACCESS_TOKEN_EXPIRES || '3h';
export const REFRESH_TOKEN_EXPIRE = process.env.REFRESH_TOKEN_EXPIRES || '3d';
export const OTP_CODE_EXPIRE = process.env.OTP_CODE_EXPIRES || '5m';
