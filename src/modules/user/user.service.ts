import mongoose from "mongoose";
import QueryBuilder from "../../builder/QueryBuilder";
import AppError from "../../error/AppError";
import { ICompetitionResult, IUser } from "./user.interface";
import { User } from "./user.models";
import httpStatus from 'http-status'
import { Competition } from "../competition/competition.model";


const updateProfile = async (payload: IUser, userId: string, image: string) => {
    const { contact, first_name, last_name, belt_rank, disciplines, email, favourite_quote, height, home_gym, weight, location } = payload

    const updateFields: Partial<IUser> = { contact, first_name, last_name, belt_rank, disciplines, email, favourite_quote, height, home_gym, weight, location };

    if (image) updateFields.image = image;

    // Remove undefined or null fields to prevent overwriting existing values with null
    Object.keys(updateFields).forEach((key) => {
        if (updateFields[key as keyof IUser] === undefined || updateFields[key as keyof IUser] === '' || updateFields[key as keyof IUser] === null) {
            delete updateFields[key as keyof IUser];
        }
    });

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
const allUsers = async (query: Record<string, any>, userId: string) => {
    const userModel = new QueryBuilder(User.find({ role: { $ne: "admin" }, isverified: true, _id: { $ne: userId }, isDeleted: false }, { password: 0, verification: 0, fcmToken: 0, isDeleted: 0, isSocialLogin: 0 }), query)
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

const getUnfriends = async (query: Record<string, any>, userId: string) => {

    const page = parseInt(query?.page) || 1;
    const limit = parseInt(query?.limit) || 10;
    const skip = (page - 1) * limit;

    const search = query?.searchTerm || "";

    const userObjectId = new mongoose.Types.ObjectId(userId);

    const filters: any = {
        $or: [
            { first_name: { $regex: search, $options: "i" } },
            { last_name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { contact: { $regex: search, $options: "i" } },
        ],
        _id: { $ne: userObjectId },
        role: { $ne: "admin" },
        isverified: true,
        isDeleted: false
    };

    const result = await User.aggregate([
        {
            $match: filters
        },
        {
            $lookup: {
                from: "friends",
                let: { userId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $or: [
                                    { $and: [{ $eq: ["$user_id", userObjectId] }, { $eq: ["$friend_id", "$$userId"] }] },
                                    { $and: [{ $eq: ["$friend_id", userObjectId] }, { $eq: ["$user_id", "$$userId"] }] }
                                ]
                            }
                        }
                    }
                ],
                as: "friendship"
            }
        },
        {
            $match: { friendship: { $size: 0 } }
        },
        {
            $project: {
                password: 0,
                verification: 0,
                fcmToken: 0,
                isDeleted: 0,
                isSocialLogin: 0
            }
        },
        // 4. Pagination
        { $skip: skip },
        { $limit: limit },
        { $sort: { createdAt: -1 } },
    ]);

    const total = await User.countDocuments(filters);

    const totalPage = Math.ceil(total / limit);

    const meta = {
        page,
        limit,
        total,
        totalPage,
    };

    return { data: result, meta }
};


const getUserById = async (id: string) => {
    const result = await User.findById(id, {
        password: 0, verification: 0, "isDeleted": 0,
        "isSocialLogin": 0,
        "isverified": 0,
        fcmToken: 0,
        notification: 0,
        status: 0,
    });

    const res = result ? result.toObject() : result;

    const lastCompetition = await Competition.findOne({ user: id })
        .sort({ createdAt: -1 });

    interface IUserWithCompetition extends IUser {
        competition?: ICompetitionResult | null;
    }

    if (res) {
        (res as IUserWithCompetition).competition = lastCompetition

    }

    return res;
};

//user status update
const status_update_user = async (payload: { status: boolean }, id: string) => {

    const result = await User.updateOne({ _id: id }, { status: payload?.status })

    return result
}

//add recent competition
const AddRecentCompetition = async (payload: ICompetitionResult, userId: string) => {
    const res = await User.updateOne({ _id: userId }, { competition: payload });
    return res
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

export const userService = {
    updateProfile,
    getUserById,
    allUsers,
    status_update_user,
    AddRecentCompetition,
    deletemyAccount,
    getUnfriends
}