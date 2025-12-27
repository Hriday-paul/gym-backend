import AppError from "../../error/AppError";
import { deleteFromS3 } from "../../utils/s3";
import { User } from "../user/user.models";
import { IGym } from "./gym.interface";
import { GYM } from "./gym.model";
import httpstatus from "http-status"
import { ObjectId } from "mongodb"
import httpStatus from "http-status"
import { Favorites } from "../favourites/favourites.model";
import QueryBuilder from "../../builder/QueryBuilder";
import { sendNotification } from "../notification/notification.utils";
import { startSession } from "mongoose";
import { IClaimReq } from "../claimRequests/claimRequests.interface";
import { ClaimReq } from "../claimRequests/claimRequests.model";

export const muniteNumber_to_time = (minute: number) => {
    const hour = Math.floor(minute / 60);
    const min = minute % 60;
    const am_pm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 === 0 ? 12 : hour % 12;
    const minStr = min.toString().padStart(2, '0');

    return `${hour12}:${minStr} ${am_pm}`;
}

const AddGymByAdmin = async (payload: IGym, userId: string) => {

    const matschedulesFormat = payload.mat_schedules.map(i => {
        return { day: i?.day, from: i?.from, from_view: muniteNumber_to_time(i?.from), to: i?.to, to_view: muniteNumber_to_time(i?.to) }
    })
    const classchedulesFormat = payload.class_schedules.map(i => {
        return { day: i?.day, from: i?.from, from_view: muniteNumber_to_time(i?.from), to: i?.to, to_view: muniteNumber_to_time(i?.to), name: i?.name || null }
    })

    const res = await GYM.create({ ...payload, isClaimed: false, user: userId, mat_schedules: matschedulesFormat, status : "approved", class_schedules: classchedulesFormat });
    return res;
}

const AddGymByUser = async (payload: IGym, userId: string, claimPayload : IClaimReq) => {

    const session = await startSession();

    try {
        session.startTransaction();

        const user = await User.findById(userId);

        if (!user) {
            throw new AppError(httpStatus.NOT_FOUND, "User not found")
        }

        const matschedulesFormat = payload.mat_schedules.map(i => {
            return { day: i?.day, from: i?.from, from_view: muniteNumber_to_time(i?.from), to: i?.to, to_view: muniteNumber_to_time(i?.to) }
        })
        const classchedulesFormat = payload.class_schedules.map(i => {
            return { day: i?.day, from: i?.from, from_view: muniteNumber_to_time(i?.from), to: i?.to, to_view: muniteNumber_to_time(i?.to), name: i?.name || null }
        })

        const gym = await GYM.create({ ...payload, isClaimed: true, user: userId, mat_schedules: matschedulesFormat, class_schedules: classchedulesFormat });

        const claimRequest = await ClaimReq.create({...claimPayload, user : user?._id, email : gym?.email, phone : gym?.phone, gym : gym?._id});

        const tokenToUse = user?.fcmToken;

        sendNotification(tokenToUse ? [tokenToUse] : [], {
            title: `New Gym under review`,
            message: `Your Gym will review by admin and they will approve it`,
            receiver: user?._id,
            receiverEmail: payload.email,
            receiverRole: user.role,
            sender: user._id,
        });

        await session.commitTransaction();
        return gym;

    } catch (error: any) {
        await session.abortTransaction();
        throw new AppError(httpStatus.BAD_GATEWAY, error.message);
    } finally {
        session.endSession();
    }
}

const MyGyms = async (userId: string) => {
    const res = await GYM.find({ user: userId, status : "approved" }).sort("-createdAt");
    return res;
}

const GymDetails = async (gymId: string, userId: string) => {

    const details = await GYM.aggregate([
        { $match: { _id: new ObjectId(gymId) } },
        {
            $lookup: {
                from: "favourites",
                let: { gymId: "$_id", userId: new ObjectId(userId) },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$gym", "$$gymId"] },
                                    { $eq: ["$user", "$$userId"] },
                                ]
                            }
                        }
                    },
                    { $limit: 1 } // we only need to know if it exists
                ],
                as: "favouriteStatus"
            }
        },
        {
            $addFields: {
                isSaved: { $gt: [{ $size: "$favouriteStatus" }, 0] }
            }
        },
        { $unset: "favouriteStatus" },
    ]);

    if (!details[0]) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            'Product not found',
        );
    }

    return details[0]
}

const DeleteGym = async (userId: string, gymId: string) => {
    const exist = await GYM.findOne({ _id: gymId });

    if (!exist) {
        throw new AppError(httpstatus.NOT_FOUND, "Gym not found")
    }

    if (exist.user.toString() !== userId) {
        throw new AppError(httpstatus.BAD_REQUEST, "You are not owner this gym")
    }

    await Favorites.deleteMany({ gym: gymId })
    const res = await GYM.deleteOne({ _id: gymId });
    await ClaimReq.deleteOne({ gym : gymId, user : userId });

    return res;
}

interface IIGym extends IGym {
    newImages: string[]
}

const updateGym = async (payload: IIGym, gymId: string) => {

    const { city, class_schedules, description, disciplines, email, facebook, instagram, location, mat_schedules, name, phone, state, street, website, zip_code, images, apartment } = payload;

    const matschedulesFormat = mat_schedules?.map(i => {
        return { day: i?.day, from: i?.from, from_view: muniteNumber_to_time(i?.from), to: i?.to, to_view: muniteNumber_to_time(i?.to) }
    })
    const classchedulesFormat = class_schedules?.map(i => {
        return { day: i?.day, from: i?.from, from_view: muniteNumber_to_time(i?.from), to: i?.to, to_view: muniteNumber_to_time(i?.to), name: i?.name }
    })

    const formattedLocation = location?.coordinates
        ? { type: 'Point', coordinates: location.coordinates }
        : undefined;

    const updateFields: Partial<IGym> = { city, class_schedules: classchedulesFormat, description, disciplines, email, facebook, instagram, location: formattedLocation, mat_schedules: matschedulesFormat, name, phone, state, street, website, zip_code, images, apartment };

    // Remove undefined or null fields to prevent overwriting existing values with null
    Object.keys(updateFields).forEach((key) => {
        if (updateFields[key as keyof IGym] === undefined || updateFields[key as keyof IGym] === '' || updateFields[key as keyof IGym] === null) {
            delete updateFields[key as keyof IGym];
        }
    });

    if (Object.keys(updateFields).length === 0) {
        throw new AppError(
            httpstatus.NOT_FOUND,
            'No valid field found',
        );
    }

    const updateQuery: any = { $set: updateFields };

    // If new images exist, append them

    updateQuery.images = images?.length ? images : undefined

    // console.log(updateFields)

    const result = await GYM.updateOne({ _id: gymId }, updateQuery)

    return result
}

const deleteGymImage = async (gymId: string, imageId: string) => {

    const exist = await GYM.findOne({ _id: gymId, "images._id": imageId }, { "images.$": 1 });

    if (!exist) {
        throw new AppError(httpstatus.NOT_FOUND, "Gym or Image not found")
    }

    const res = await GYM.updateOne(
        { _id: gymId },
        {
            $pull: {
                "images": { _id: imageId },
            },
        }
    );

    deleteFromS3(exist.images[0]?.key);

    return res;
}

const nearMeMats = async (query: Record<string, any>, userId: string) => {

    const day = query.day;
    const hour = query.hour
    const minute = query.minute

    const lat = query?.lat;
    const long = query?.long;

    const current = Number(hour) * 60 + Number(minute);

    const filters: any = {
        $and: [
            {"mat_schedules.day": day },
            {status : "approved"},
            {
                $or: [
                    {
                        $and: [
                            { "mat_schedules.from": { $lte: current } },
                            { "mat_schedules.to": { $gte: current } }
                        ]
                    },
                    { "mat_schedules.from": { $gt: current } }
                ]
            }
        ]
    };

    if (!lat || !long) {
        return []
    }

    const userLocation: { type: "Point"; coordinates: [number, number] } = {
        type: "Point",
        coordinates: [Number(long), Number(lat)], // [longitude, latitude]
    };

    const gyms = await GYM.aggregate([
        {
            $geoNear: {
                near: userLocation,
                distanceField: "distance",
                maxDistance: 50000,   // optional: 50km radius (in meters)
                spherical: true,
            }
        },
        {
            $match: filters
        },
        { $limit: 10 },
        { $sort: { distance: 1 } },
    ]);

    return gyms;
}

const allMats = async (query: Record<string, any>, userId: string) => {
    const distance = query?.distance;
    const disciplines = query?.disciplines ? query?.disciplines.split(",") : [];
    const search = query?.searchTerm || "";
    const lat = query?.lat;
    const long = query?.long;

    const filters: any = {
        $or: [
            { name: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
            { street: { $regex: search, $options: "i" } },
            { state: { $regex: search, $options: "i" } },
            { city: { $regex: search, $options: "i" } },
        ],
        status : "approved"
    };

    if (disciplines.length > 0) {
        filters.disciplines = { $in: disciplines };
    }

    const pipeline: any[] = [];

    // Add geoNear if distance, long, lat query is present
    if (distance && long && lat) {
        const cordinates = [Number(long), Number(lat)]

        const userLocation = {
            type: "Point",
            coordinates: cordinates, // [longitude, latitude]
        };

        pipeline.push({
            $geoNear: {
                near: userLocation,
                distanceField: "distance",
                maxDistance: Number(distance),
                spherical: true,
            },
        });
    }

    pipeline.push(
        { $match: filters },
        { $sort: distance ? { distance: 1 } : { createdAt: -1 } }
    );

    const products = await GYM.aggregate(pipeline);
    return products;
};


const allGyms = async (query: Record<string, any>) => {
    const gymModel = new QueryBuilder(GYM.find().populate("user"), query)
        .search(['name', 'description', "street", "state", "city", "phone", "email"])
        .paginate()
        .filter()
        .sort();
    const data: any = await gymModel.modelQuery;
    const meta = await gymModel.countTotal();
    return {
        data,
        meta,
    };
}

export const gymService = {
    AddGymByAdmin,
    AddGymByUser,
    MyGyms,
    DeleteGym,
    deleteGymImage,
    updateGym,
    nearMeMats,
    allMats,
    GymDetails,
    allGyms
}