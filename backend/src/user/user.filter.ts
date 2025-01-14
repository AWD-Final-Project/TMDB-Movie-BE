import { User } from './schemas/user.schema';

class UserFilter {
    static makeBasicFilter(user: User): object {
        return {
            id: user?._id,
            email: user?.email,
            username: user?.username,
        };
    }

    static makeDetailFilter(user: Partial<User>): object {
        return {
            id: user?._id,
            email: user?.email,
            username: user?.username,
            fullname: user?.fullname,
            address: user?.address,
            status: user?.status,
        };
    }
}

export default UserFilter;
