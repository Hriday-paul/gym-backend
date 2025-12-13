import { User } from "../user/user.models";
import { ICompetitionResult } from "./competition.interface";
import { Competition } from "./competition.model";

//add recent competition
const AddRecentCompetition = async (payload: ICompetitionResult, userId: string) => {
    const res = await User.updateOne({ _id: userId }, { competition: payload });
    await Competition.create({...payload, user : userId});
    return res
}

const DeleteRecentCompetition = async (id: string, userId: string) => {
    const res = await Competition.deleteOne({_id : id});
    return res;
}

const MyRecentCompetitions = async (userId: string) => {
    const res = await Competition.find({user : userId}).sort("-createdAt");
    return res;
}

export const competitionService = {
    AddRecentCompetition,
    DeleteRecentCompetition,
    MyRecentCompetitions
}