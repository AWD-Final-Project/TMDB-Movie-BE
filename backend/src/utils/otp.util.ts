export function generateOtpCode(timeInMilliseconds: number = 5 * 60 * 1000): { code: number; expiredAt: Date } {
    const otpPasscode = Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit OTP
    const expiredCode = new Date(Date.now() + timeInMilliseconds); // Set expiration time for the OTP

    return {
        code: otpPasscode,
        expiredAt: expiredCode,
    };
}
