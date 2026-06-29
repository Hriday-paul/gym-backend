import httpStatus from 'http-status';
import jwt from 'jsonwebtoken';
import { JwtPayload } from 'jsonwebtoken';
import catchAsync from '../utils/catchAsync';
import AppError from '../error/AppError';
import config from '../config/index';
import { User } from '../modules/user/user.models';

const auth = (...userRoles: string[]) => {
    return catchAsync(async (req, res, next) => {
        const token = req?.headers?.authorization?.split(' ')[1];

        if (!token) {
            throw new AppError(httpStatus.UNAUTHORIZED, 'You don’t have permission to continue. Please log in again.');
        }
        let decode;
        try {
            decode = jwt.verify(
                token,
                config.jwt_access_secret as string,
            ) as JwtPayload;
        } catch (err) {
            throw new AppError(httpStatus.UNAUTHORIZED, 'You don’t have permission to continue. Please log in again.');
        }
        const { role, userId } = decode;
        const isUserExist = await User.findById(userId);

        if (!isUserExist) {
            throw new AppError(httpStatus.NOT_FOUND, 'Account does not exist');
        }

        if (!isUserExist?.isverified) {
            throw new AppError(httpStatus.UNAUTHORIZED, 'Your account has not been verified!');
        }

        if (isUserExist?.isDeleted) {
            throw new AppError(httpStatus.FORBIDDEN, 'Your account has been deleted');
        }

        if (isUserExist?.status == 0) {
            throw new AppError(httpStatus.FORBIDDEN, 'Your account has been blocked');
        }

        if (userRoles && !userRoles.includes(role)) {
            throw new AppError(httpStatus.UNAUTHORIZED, 'You don’t have permission to continue. Please log in again.');
        }

        req.user = { _id: userId, role };

        next();
    });
};
export default auth;
