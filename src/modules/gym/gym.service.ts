import AppError from "../../error/AppError";
import { deleteFromS3 } from "../../utils/s3";
import { User } from "../user/user.models";
import { IGym } from "./gym.interface";
import { GYM } from "./gym.model";
import httpstatus from "http-status"

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
        return { day: i?.day, from: i?.from, from_view: muniteNumber_to_time(i?.from), to: i?.to, to_view: muniteNumber_to_time(i?.to) }
    })

    const res = await GYM.create({ ...payload, isClaimed: false, user: userId, mat_schedules: matschedulesFormat, class_schedules: classchedulesFormat });
    return res;
}

const AddGymByUser = async (payload: IGym, userId: string) => {

    const matschedulesFormat = payload.mat_schedules.map(i => {
        return { day: i?.day, from: i?.from, from_view: muniteNumber_to_time(i?.from), to: i?.to, to_view: muniteNumber_to_time(i?.to) }
    })
    const classchedulesFormat = payload.class_schedules.map(i => {
        return { day: i?.day, from: i?.from, from_view: muniteNumber_to_time(i?.from), to: i?.to, to_view: muniteNumber_to_time(i?.to) }
    })

    const res = await GYM.create({ ...payload, isClaimed: true, user: userId, mat_schedules: matschedulesFormat, class_schedules: classchedulesFormat });
    return res;
}

const MyGyms = async (userId: string) => {
    const res = await GYM.find({ user: userId });
    return res;
}

const GymDetails = async (gymId: string) => {
    const res = await GYM.findById(gymId);
    return res;
}

const DeleteGym = async (userId: string, gymId: string) => {
    const exist = await GYM.findOne({ _id: gymId });

    if (!exist) {
        throw new AppError(httpstatus.NOT_FOUND, "Gym not found")
    }

    if (exist.user.toString() !== userId) {
        throw new AppError(httpstatus.BAD_REQUEST, "You are not owner this gym")
    }

    const res = await GYM.deleteOne({ _id: gymId });

    return res;
}

interface IIGym extends IGym {
    newImages: string[]
}

const updateGym = async (payload: IIGym, gymId: string) => {
    const { city, class_schedules, description, disciplines, email, facebook, instagram, location, mat_schedules, name, phone, state, street, website, zip_code, newImages = [] } = payload;

    const matschedulesFormat = mat_schedules.map(i => {
        return { day: i?.day, from: i?.from, from_view: muniteNumber_to_time(i?.from), to: i?.to, to_view: muniteNumber_to_time(i?.to) }
    })
    const classchedulesFormat = class_schedules.map(i => {
        return { day: i?.day, from: i?.from, from_view: muniteNumber_to_time(i?.from), to: i?.to, to_view: muniteNumber_to_time(i?.to) }
    })

    const formattedLocation = location?.coordinates
        ? { type: 'Point', coordinates: location.coordinates }
        : undefined;

    const updateFields: Partial<IGym> = { city, class_schedules: classchedulesFormat, description, disciplines, email, facebook, instagram, location : formattedLocation, mat_schedules: matschedulesFormat, name, phone, state, street, website, zip_code };

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
    if (newImages?.length) {
        updateQuery.$push = { images: { $each: newImages } };
    }

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

    const current = Number(hour) * 60 + Number(minute);

    const filters: any = {
        $and: [
            { "mat_schedules.day": day },
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

    const user = await User.findOne({ _id: userId });

    if (!user) {
        throw new AppError(
            httpstatus.NOT_FOUND,
            'User not found',
        );
    }

    if (!user?.location?.coordinates || user?.location?.coordinates.length < 2) {
        return []
    }

    const userLocation: { type: "Point"; coordinates: [number, number] } = {
        type: "Point",
        coordinates: user?.location?.coordinates, // [longitude, latitude]
    };

    const products = await GYM.aggregate([
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

    return products;
}

const allMats = async (query: Record<string, any>, userId: string) => {

    const distance = Number(query?.distance) || 2000
    const disciplines = query?.disciplines ? query?.disciplines.split(",") : []
    const search = query?.searchTerm || "";

    const filters: any = {
        $or: [
            { name: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
            { street: { $regex: search, $options: "i" } },
            { state: { $regex: search, $options: "i" } },
            { city: { $regex: search, $options: "i" } },
        ],
    };

    if (disciplines.length > 0) {
        filters.disciplines = { $in: disciplines };
    }

    const user = await User.findOne({ _id: userId });

    if (!user) {
        throw new AppError(
            httpstatus.NOT_FOUND,
            'User not found',
        );
    }

    if (!user?.location?.coordinates || user?.location?.coordinates.length < 2) {
        return []
    }

    const userLocation: { type: "Point"; coordinates: [number, number] } = {
        type: "Point",
        coordinates: user?.location?.coordinates || [], // [longitude, latitude]
    };

    const products = await GYM.aggregate([
        {
            $geoNear: {
                near: userLocation,
                distanceField: "distance",
                maxDistance: distance,
                spherical: true,
            }
        },
        {
            $match: filters
        },
        // { $limit: 10 },
        { $sort: { distance: 1 } },
    ]);

    return products;
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
    GymDetails
}