import QueryBuilder from "../../builder/QueryBuilder";
import AppError from "../../error/AppError";
import { GYM } from "../gym/gym.model";
import { IClaimReq } from "./claimRequests.interface";
import { ClaimReq } from "./claimRequests.model";
import httpstatus from "http-status"

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

    //check is exist or not
    const exist = await ClaimReq.findOne({ _id: claimId });

    if (!exist) {
        throw new AppError(httpstatus.NOT_FOUND, "Claim request not available");
    }

    if (exist.status == "approved") {
        throw new AppError(httpstatus.BAD_REQUEST, "Claim already approved");
    }

    //owner transfer
    const updated = await GYM.updateOne({ _id: exist?.gym }, { user: exist?.user, isClaimed: true });


    // update status
    await ClaimReq.updateOne({ _id: claimId }, { status: "approved" });

}

const claimStats = async () => {
    const total = await ClaimReq.countDocuments();
    const pending = await ClaimReq.countDocuments({ status: "pending" });
    const approved = await ClaimReq.countDocuments({ status: "approved" });
    const rejected = await ClaimReq.countDocuments({ status: "rejected" });

    return { total, pending, approved, rejected }
}

const allClaims = async (query: Record<string, any>) => {
    const claimModel = new QueryBuilder(ClaimReq.find().populate("gym").populate("user"), query)
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
    claimStats,
    allClaims
}