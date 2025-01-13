import { OAuth2Client } from 'google-auth-library';
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from '../configs/google.config';

class GoogleHelper {
    static CLIENT = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET);

    static async verifyIdToken(idToken: string): Promise<object> {
        try {
            const ticket = await GoogleHelper.CLIENT.verifyIdToken({
                idToken,
                audience: GOOGLE_CLIENT_ID,
            });

            const payload = ticket.getPayload();
            return {
                googleId: payload?.sub ?? '', // ID người dùng trên Google
                email: payload?.email ?? '',
                name: payload?.name ?? '',
                picture: payload?.picture ?? '',
            };
        } catch (error) {
            console.log('Error verifying Google ID token: ', error);
            throw new Error('Invalid Google ID token');
        }
    }
}

export default GoogleHelper;
