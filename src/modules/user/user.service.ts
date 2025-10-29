import QueryBuilder from "../../builder/QueryBuilder";
import AppError from "../../error/AppError";
import { IUser } from "./user.interface";
import { User } from "./user.models";
import httpStatus from 'http-status'

// update user profile
const updateProfile = async (payload: IUser, userId: string, image: string) => {

    const { contact, first_name, last_name, address, bio, date_of_birth, location, notification } = payload

    const updateFields: Partial<IUser> = { contact, first_name, last_name, address, bio, date_of_birth, location, notification };

    if (image) updateFields.image = image;

    // Remove undefined or null fields to prevent overwriting existing values with null
    Object.keys(updateFields).forEach((key) => {
        if (updateFields[key as keyof IUser] === undefined || updateFields[key as keyof IUser] === '' || updateFields[key as keyof IUser] === null) {
            delete updateFields[key as keyof IUser];
        }
    });

    // check updated field found or not
    if (Object.keys(updateFields).length === 0) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            'No valid field found',
        );
    }

    const result = await User.updateOne({ _id: userId }, updateFields)

    return result
}

//get all users
const allUsers = async (query: Record<string, any>) => {
    const userModel = new QueryBuilder(User.find({ role: { $ne: "admin" }, isDeleted: false }, { password: 0 }), query)
        .search(['first_name', 'last_name', 'email', 'contact'])
        .filter()
        .paginate()
        .sort();
    const data: any = await userModel.modelQuery;
    const meta = await userModel.countTotal();
    return {
        data,
        meta,
    };
}


const getUserById = async (id: string) => {
    const result = await User.findById(id, { password: 0, verification: 0 });
    return result;
};

//user status update
const status_update_user = async (payload: { status: boolean }, id: string) => {

    const result = await User.updateOne({ _id: id }, { status: payload?.status })

    return result
}

const deletemyAccount = async (userId: string) => {

    const exist = await User.findById(userId);

    if (!exist) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            'User not found',
        );
    }

    const res = await User.updateOne({ _id: userId, role: { $ne: "admin" } }, { isDeleted: true });

    return res;
}

const userDetails = async(userId : string)=>{
    const res = await User.findById(userId).select("-password -fcmToken -verification");
    return res;
}

export const userService = {
    updateProfile,
    getUserById,
    allUsers,
    status_update_user,
    deletemyAccount,
    userDetails
}