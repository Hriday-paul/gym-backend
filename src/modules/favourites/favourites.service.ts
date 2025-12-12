import mongoose from "mongoose";
import { Favorites } from "./favourites.model";
import AppError from "../../error/AppError";
import httpstatus from "http-status"
import { GYM } from "../gym/gym.model";


const addFavourite = async (gym: string, user: string) => {

    const existProduct = await GYM.findById(gym);

    if (!existProduct) {
        throw new AppError(httpstatus.NOT_FOUND, "gym not found for save")
    }

    const exist = await Favorites.findOne({ gym, user });

    if (exist) {
        throw new AppError(httpstatus.FORBIDDEN, "gym already exist to your saved gyms")
    }

    const res = await Favorites.insertOne({ gym, user });

    return res;
}

const deletefavourite = async (gym: string, user: string) => {

    const exist = await Favorites.findOne({ _id : gym, user });

    if (!exist) {
        throw new AppError(httpstatus.NOT_FOUND, "Gym not found in the saved list")
    }

    const res = await Favorites.deleteOne({ _id : gym });

    return res;
}

const getAllMyFavourites = async (user: string) => {

    const favorites = await Favorites.find({ user }).sort("-createdAt").populate("gym")

    return favorites
}

export const favouriteService = {
    addFavourite,
    deletefavourite,
    getAllMyFavourites
}