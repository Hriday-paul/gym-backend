import { model, Schema } from 'mongoose';
import { IFriend } from './friends.interface';

const FriendSchema: Schema<IFriend> = new Schema(
    {
        user_id: { type: Schema.Types.ObjectId, ref: "users", required: true },
        friend_id: { type: Schema.Types.ObjectId, ref: "users", required: true },
    },
    { timestamps: true },
);

export const Friend = model<IFriend>('friends', FriendSchema);
