import { Response, Request } from 'express';

class CookieHelper {
    public static setCookie(
        res: Response,
        name: string,
        value: string,
        options: { days?: number; httpOnly?: boolean; secure?: boolean; sameSite?: 'Strict' | 'Lax' | 'None' },
    ) {
        let cookieString = `${name}=${value || ''}; Path=/`;

        if (options.days) {
            const date = new Date();
            date.setTime(date.getTime() + options.days * 24 * 60 * 60 * 1000);
            cookieString += `; Expires=${date.toUTCString()}`;
        }

        if (options.httpOnly) {
            cookieString += '; HttpOnly';
        }

        if (options.secure) {
            cookieString += '; Secure';
        }

        if (options.sameSite) {
            cookieString += `; SameSite=${options.sameSite}`;
        }

        res.setHeader('Set-Cookie', cookieString);
    }

    public static getCookie(req: Request, name: string): string | null {
        const cookies = req.headers.cookie;
        if (!cookies) return null;

        const nameEQ = `${name}=`;
        const cookieOptions = cookies.split(';');
        for (let i = 0; i < cookieOptions.length; i += 1) {
            const c = cookieOptions[i].trim();
            if (c.indexOf(nameEQ) === 0) {
                return c.substring(nameEQ.length, c.length);
            }
        }
        return null;
    }

    public static eraseCookie(res: Response, name: string) {
        res.setHeader('Set-Cookie', `${name}=; Max-Age=-99999999; Path=/`);
    }
}

export default CookieHelper;
