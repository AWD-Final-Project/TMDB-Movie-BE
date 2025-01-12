import * as bcrypt from 'bcrypt';

class BcryptHelper {
    static async hash(raw: string): Promise<string> {
        const salt = await bcrypt.genSalt(10);
        return bcrypt.hash(raw, salt);
    }

    static async compare(raw: string, hashed: string): Promise<boolean> {
        return bcrypt.compare(raw, hashed);
    }
}

export default BcryptHelper;
