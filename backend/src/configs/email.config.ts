import * as dotenv from 'dotenv';
dotenv.config();

export default () => ({
    email_username: process.env.EMAIL_USERNAME,
    email_password: process.env.EMAIL_PASSWORD,
});
