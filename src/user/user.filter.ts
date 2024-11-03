import { User } from './schemas/user.schema';

class UserFilter {
    static makeBasicFilter(user: User): object {
        return {
            id: user?._id,
            email: user?.email,
            username: user?.username,
            fullname: user?.fullname,
        };
    }

    static makeDetailFilter(user: User): object {
        return {
            ...user,
            password: undefined,
            __v: undefined,
        };
    }
}

export default UserFilter;
