import { startSession } from "mongoose";
import QueryBuilder from "../../builder/QueryBuilder";
import AppError from "../../error/AppError";
import { GYM } from "../gym/gym.model";
import { IClaimReq } from "./claimRequests.interface";
import { ClaimReq } from "./claimRequests.model";
import httpstatus from "http-status"
import { IUser } from "../user/user.interface";
import { sendNotification } from "../notification/notification.utils";

const AddclaimReq = async (payload: IClaimReq) => {

    const res = await ClaimReq.create(payload);
    return res;
}

const CheckclaimReq = async (gymId: string, userId: string) => {

    // check gym is available
    const gym = await GYM.findById(gymId);

    if (!gym) {
        throw new AppError(httpstatus.NOT_FOUND, "GYM not found");
    }
    //gym already claimed or not
    if (gym.isClaimed) {
        throw new AppError(httpstatus.BAD_REQUEST, "Requested GYM is not available for claim");
    }

    //check is exist or not
    const exist = await ClaimReq.findOne({ user: userId, gym: gymId });

    if (exist) {
        throw new AppError(httpstatus.CONFLICT, "You already requested to this GYM for claim");
    }

}

const ApproveClaimReq = async (claimId: string) => {

    const session = await startSession();

    try {

        session.startTransaction();

        //check is exist or not
        const exist = await ClaimReq.findOne({ _id: claimId }).populate("user");

        if (!exist) {
            throw new AppError(httpstatus.NOT_FOUND, "Claim request not available");
        }

        if (exist.status == "approved") {
            throw new AppError(httpstatus.BAD_REQUEST, "Claim already approved");
        }

        //owner transfer
        await GYM.updateOne({ _id: exist?.gym }, { user: exist?.user, isClaimed: true, status: "approved" });


        // update status
        await ClaimReq.updateOne({ _id: claimId }, { status: "approved" });

        // transaction complete;
        await session.commitTransaction();

        const user = exist?.user as unknown as IUser

        const tokenToUse = user?.fcmToken;

        sendNotification(tokenToUse ? [tokenToUse] : [], {
            title: `Gym request is approved`,
            message: `Your Gym request is approved. A New gym added to your account`,
            receiver: user?._id,
            receiverEmail: user?.email,
            receiverRole: user.role,
            sender: user._id,
        });

        return null;

    } catch (error: any) {
        await session.abortTransaction();
        throw new AppError(httpstatus.BAD_GATEWAY, error.message);
    } finally {
        session.endSession();
    }

}

const RejectClaimReq = async (claimId: string) => {

    //check is exist or not
    const exist = await ClaimReq.findOne({ _id: claimId }).populate("user");

    if (!exist) {
        throw new AppError(httpstatus.NOT_FOUND, "Claim request not available");
    }

    if (exist.status == "rejected") {
        throw new AppError(httpstatus.BAD_REQUEST, "Claim already rejected");
    }


    // update status
    await ClaimReq.updateOne({ _id: claimId }, { status: "rejected" });

    await GYM.updateOne({ _id: exist?.gym }, { isClaimed: false, status: "rejected" });

    const user = exist?.user as unknown as IUser

    const tokenToUse = user?.fcmToken;

    sendNotification(tokenToUse ? [tokenToUse] : [], {
        title: `Gym request is rejected`,
        message: `Your Gym request is rejected by admin. Please, provide valid information for approval.`,
        receiver: user?._id,
        receiverEmail: user?.email,
        receiverRole: user.role,
        sender: user._id,
    });

}

const claimStats = async () => {
    const total = await ClaimReq.countDocuments();
    const pending = await ClaimReq.countDocuments({ status: "pending" });
    const approved = await ClaimReq.countDocuments({ status: "approved" });
    const rejected = await ClaimReq.countDocuments({ status: "rejected" });

    return { total, pending, approved, rejected }
}

const allClaims = async (query: Record<string, any>) => {
    const claimModel = new QueryBuilder(ClaimReq.find().populate({
        path: "gym",
        match: { _id: { $exists: true } }
    }).populate("user"), query)
        .search(['email', 'phone'])
        .paginate()
        .sort();
    const data: any = await claimModel.modelQuery;
    const meta = await claimModel.countTotal();
    return {
        data,
        meta,
    };
}

export const claimReqService = {
    AddclaimReq,
    CheckclaimReq,
    ApproveClaimReq,
    RejectClaimReq,
    claimStats,
    allClaims
}