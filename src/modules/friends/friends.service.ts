import mongoose from "mongoose";
import AppError from "../../error/AppError";
import { IFriend } from "./friends.interface";
import { Friend } from "./friends.model"
import httpstatus from "http-status"

const MyFriends = async (query: Record<string, any>, userId: string) => {
    const search = query?.searchTerm || "";
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const res = await Friend.aggregate([
        { $match: { user_id: userObjectId } },
        {
            $lookup: {
                from: "users",
                localField: "friend_id",
                foreignField: "_id",
                as: "friend"
            }
        },
        { $unwind: "$friend" },
        {
            $match: {
                $or: [
                    { "friend.first_name": { $regex: search, $options: "i" } },
                    { "friend.last_name": { $regex: search, $options: "i" } },
                    { "friend.email": { $regex: search, $options: "i" } },
                    { "friend.contact": { $regex: search, $options: "i" } },
                ]
            }
        },
        {
            $project: {
                "friend.password": 0,
                "friend.verification": 0,
                "friend.isDeleted": 0,
                "friend.isSocialLogin": 0,
                "friend.isverified": 0,
                "friend.fcmToken": 0,
                "friend.notification": 0,
                "friend.status": 0
            }
        },
        { $sort: { createdAt: -1 } }
    ]);

    return res;
};

const FolowFriend = async (userId: string, payload: IFriend) => {
    //check exist
    const exist = await Friend.findOne({ friend_id: payload?.friend_id, user_id: userId });
    if (exist) {
        throw new AppError(httpstatus.CONFLICT, "You already folowed by this user")
    }
    const res = await Friend.create({ friend_id: payload?.friend_id, user_id: userId })

    return res;
}

const UnFolowFriend = async (friendId: string, userId: string) => {
    //check exist
    const exist = await Friend.findOne({ friend_id: friendId, user_id: userId });
    if (!exist) {
        throw new AppError(httpstatus.NOT_FOUND, "User not found in friend list")
    }

    const res = await Friend.deleteOne({ friend_id: friendId, user_id: userId });

    return res;
}

export const friendService = {
    MyFriends,
    FolowFriend,
    UnFolowFriend
}