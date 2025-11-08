import { ObjectId } from "mongoose";

export interface IFriend {
    user_id : ObjectId,
    friend_id : ObjectId
}