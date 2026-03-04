import AppError from "../../error/AppError";
import { deleteFromS3 } from "../../utils/s3";
import { User } from "../user/user.models";
import { IGym, ISchedule } from "./gym.interface";
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
import { USER_ROLE } from "../user/user.constants";
import { matReminderQueue } from "../../queues/matReminder.queue";
import { MatReminderTemplate } from "../reminder_template/reminder.model";

const DayOrder = {
    Sunday: 1,
    Monday: 2,
    Tuesday: 3,
    Wednesday: 4,
    Thursday: 5,
    Friday: 6,
    Saturday: 7,
}

type Day =
    | "Sunday"
    | "Monday"
    | "Tuesday"
    | "Wednesday"
    | "Thursday"
    | "Friday"
    | "Saturday";


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
        const day = i?.day as Day;
        return { day, dayOrder: DayOrder[day], from: i?.from, from_view: muniteNumber_to_time(i?.from), to: i?.to, to_view: muniteNumber_to_time(i?.to) }
    })
    const classchedulesFormat = payload.class_schedules.map(i => {
        const day = i?.day as Day;
        return { day, dayOrder: DayOrder[day], from: i?.from, from_view: muniteNumber_to_time(i?.from), to: i?.to, to_view: muniteNumber_to_time(i?.to), name: i?.name || null }
    })

    const gym = await GYM.create({ ...payload, isClaimed: false, user: userId, mat_schedules: matschedulesFormat, status: "approved", class_schedules: classchedulesFormat });

    // schedule mat reminder
    await scheduleMatReminderForGym(gym);

    return gym;
}

const AddGymByUser = async (payload: IGym, userId: string, claimPayload: IClaimReq) => {

    const session = await startSession();

    try {
        session.startTransaction();

        const user = await User.findById(userId);

        if (!user) {
            throw new AppError(httpStatus.NOT_FOUND, "User not found")
        }

        const matschedulesFormat = payload.mat_schedules.map(i => {
            const day = i?.day as Day;
            return { day, dayOrder: DayOrder[day], from: i?.from, from_view: muniteNumber_to_time(i?.from), to: i?.to, to_view: muniteNumber_to_time(i?.to) }
        })
        const classchedulesFormat = payload.class_schedules.map(i => {
            const day = i?.day as Day;
            return { day, dayOrder: DayOrder[day], from: i?.from, from_view: muniteNumber_to_time(i?.from), to: i?.to, to_view: muniteNumber_to_time(i?.to), name: i?.name || null }
        })

        const gym = await GYM.create({ ...payload, isClaimed: true, user: userId, mat_schedules: matschedulesFormat, class_schedules: classchedulesFormat }, { session });

        const claimRequest = await ClaimReq.create(
            [{
                ...claimPayload,
                user: user._id,
                email: gym[0].email,
                phone: gym[0].phone,
                gym: gym[0]._id
            }],
            { session }
        );

        await session.commitTransaction();

        const tokenToUse = user?.fcmToken;
        sendNotification(tokenToUse ? [tokenToUse] : [], {
            title: "New gym under review",
            message: "Your gym is under review by the admin. It will be approved once the review is complete.",
            receiver: user?._id,
            receiverEmail: payload.email,
            receiverRole: user.role,
            sender: user._id,
        });

        // schedule mat reminder
        await scheduleMatReminderForGym(gym[0]);

        return gym[0];

    } catch (error: any) {
        await session.abortTransaction();
        throw new AppError(httpStatus.BAD_GATEWAY, error.message);
    } finally {
        session.endSession();
    }
}

const MyGyms = async (userId: string) => {
    const res = await GYM.find({ user: userId, status: "approved" }).sort("-createdAt");
    return res;
}

const GymDetails = async (gymId: string, userId: string) => {

    const details: IGym[] = await GYM.aggregate([
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
            'Gym not found',
        );
    }

    const gym = details[0];

    const dayOrder = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
    ];

    gym?.class_schedules.sort(
        (a, b) => dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day)
    );
    gym?.mat_schedules.sort(
        (a, b) => dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day)
    );

    return gym
}

const DeleteGym = async (
    userId: string,
    gymId: string,
    role: string
) => {

    const session = await startSession();

    try {
        session.startTransaction();

        const exist = await GYM.findOne({ _id: gymId }).session(session);

        if (!exist) {
            throw new AppError(httpstatus.NOT_FOUND, "Gym not found!");
        }

        if (
            exist.user.toString() !== userId &&
            role !== USER_ROLE.admin
        ) {
            throw new AppError(
                httpstatus.BAD_REQUEST,
                "You are not owner this gym"
            );
        }

        // ✅ delete favourites
        await Favorites.deleteMany(
            { gym: gymId },
            { session }
        );

        // ✅ delete claim request
        await ClaimReq.deleteOne(
            { gym: gymId, user: userId },
            { session }
        );

        // ✅ delete gym
        const res = await GYM.deleteOne(
            { _id: gymId },
            { session }
        );

        await session.commitTransaction();

        // ✅ OUTSIDE transaction
        await matReminderQueue.remove(`${gymId}`);

        return res;

    } catch (error: any) {
        await session.abortTransaction();
        throw new AppError(
            httpstatus.BAD_GATEWAY,
            error.message
        );
    } finally {
        session.endSession();
    }
};

interface IIGym extends IGym {
    newImages: string[]
}

const updateGym = async (payload: IIGym, gymId: string) => {

    const { city, class_schedules, description, disciplines, email, facebook, instagram, location, mat_schedules, name, phone, state, street, website, zip_code, images, apartment } = payload;

    const matschedulesFormat = mat_schedules?.map(i => {
        const day = i?.day as Day;
        return { day, dayOrder: DayOrder[day], from: i?.from, from_view: muniteNumber_to_time(i?.from), to: i?.to, to_view: muniteNumber_to_time(i?.to) }
    })
    const classchedulesFormat = class_schedules?.map(i => {
        const day = i?.day as Day;
        return { day, dayOrder: DayOrder[day], from: i?.from, from_view: muniteNumber_to_time(i?.from), to: i?.to, to_view: muniteNumber_to_time(i?.to), name: i?.name }
    })

    const formattedLocation = location?.coordinates
        ? { type: 'Point', coordinates: location.coordinates }
        : undefined;

    const updateFields: Partial<IGym> = { city, class_schedules: classchedulesFormat, description, disciplines, email, facebook, instagram, location: formattedLocation, mat_schedules: matschedulesFormat, name, phone, state, street, website, zip_code, apartment };

    // Remove undefined or null fields to prevent overwriting existing values with null
    Object.keys(updateFields).forEach((key) => {
        if (updateFields[key as keyof IGym] === undefined || updateFields[key as keyof IGym] === '' || updateFields[key as keyof IGym] === null) {
            delete updateFields[key as keyof IGym];
        }
    });

    if (Object.keys(updateFields).length === 0 && images?.length == 0) {
        throw new AppError(
            httpstatus.NOT_FOUND,
            'No valid field found',
        );
    }

    const updateQuery: any = {
        $set: updateFields,
    };

    if (images?.length) {
        updateQuery.$push = {
            images: { $each: images },
        };
    }

    const result = await GYM.findByIdAndUpdate({ _id: gymId }, updateQuery, { new: true });

    if (!result) return;

    // rebuild reminder notification
    await scheduleMatReminderForGym(result)

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
    const distance = query?.distance;

    const SIX_HOURS = 6 * 60;

    if (!lat || !long) {
        return []
    }

    const userLocation: { type: "Point"; coordinates: [number, number] } = {
        type: "Point",
        coordinates: [Number(long), Number(lat)], // [longitude, latitude]
    };

    const geoNear: any = {
        near: userLocation,
        distanceField: "distance",
        spherical: true,
        distanceMultiplier: 0.000621371192 // for get mile
    };

    if (distance) {
        geoNear.maxDistance = Number(distance) / 0.000621371192;
    }

    const mats = await GYM.aggregate([
        {
            $geoNear: geoNear
        },
        // {
        //     $geoNear: {
        //         near: userLocation,
        //         distanceField: "distance",
        //         maxDistance: 50000, // 50km
        //         spherical: true,
        //         distanceMultiplier: 0.000621371192, // miles
        //     },
        // },
        {
            $match: {
                status: "approved",
            },
        },
        {
            $unwind: "$mat_schedules",
        },
        {
            $match: {
                "mat_schedules.day": day,
                $or: [
                    // currently open
                    {
                        "mat_schedules.from": { $lte: current },
                        "mat_schedules.to": { $gte: current },
                    },
                    // starts within next 6 hours
                    {
                        "mat_schedules.from": {
                            $gt: current,
                            $lte: current + SIX_HOURS,
                        },
                    },
                ],
            },
        },
        {
            $project: {
                _id: 1,
                name: 1,
                distance: 1,
                location: 1,
                images: 1,

                // ONLY MAT INFO
                day: "$mat_schedules.day",
                from: "$mat_schedules.from",
                to: "$mat_schedules.to",
                from_view: "$mat_schedules.from_view",
                to_view: "$mat_schedules.to_view",
            },
        },
        { $sort: { distance: 1, from: 1 } },
        { $limit: 10 },
    ]);

    // update location to user
    await User.updateOne(
        { _id: userId },
        { location: { type: "Point", coordinates: [long, lat] } }
    );

    return mats;
}

const allGymsForApp = async (query: Record<string, any>, userId: string) => {
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
        status: "approved"
    };

    if (disciplines.length > 0) {
        filters.disciplines = { $in: disciplines };
    }

    const pipeline: any[] = [];

    // Add geoNear if distance, long, lat query is present
    if (long && lat) {
        const cordinates = [Number(long), Number(lat)]

        const userLocation = {
            type: "Point",
            coordinates: cordinates, // [longitude, latitude]
        };

        const geoNear: any = {
            near: userLocation,
            distanceField: "distance",
            spherical: true,
            distanceMultiplier: 0.000621371192 // for get mile
        };

        if (distance) {
            geoNear.maxDistance = Number(distance) / 0.000621371192;
        }

        pipeline.unshift({
            $geoNear: geoNear
        });
    }

    pipeline.push(
        { $match: filters },
        { $sort: distance ? { distance: 1 } : { createdAt: -1 } }
    );

    // 4️⃣ Sort nested mat_schedules by dayOrder → from
    pipeline.push({
        $addFields: {
            mat_schedules: {
                $sortArray: {
                    input: "$mat_schedules",
                    sortBy: { dayOrder: 1, from: 1 },
                },
            },
        },
    });

    const gyms = await GYM.aggregate(pipeline);
    return gyms;
};

//------------for admin---------------
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

const scheduleMatReminderForGym = async (gym: IGym) => {

    // remove old queue for this gym
    await matReminderQueue.remove(
        `${gym?._id}`
    );

    for (let mat of gym?.mat_schedules) {
        await scheduleMatReminder(
            gym?._id,
            mat,
            120 // generate reminder before 2 hour
        );
    }


}

const scheduleMatReminder = async (
    gymId: string,
    mat: ISchedule,
    reminderMinutes: number,
    forceNextWeek = false
) => {

    const matStart = getNextMatDateTime(mat.dayOrder, mat.from, forceNextWeek);

    const reminderTime = new Date(matStart.getTime() - reminderMinutes * 60000);

    const delay = reminderTime.getTime() - Date.now();

    if (delay <= 0) return;

    await matReminderQueue.add(
        "mat-reminder",
        { gymId, matId: mat._id },
        {
            delay,
            jobId: `${gymId}`,
            removeOnComplete: true,
        }
    );
};

const getNextMatDateTime = (dayOrder: number, from: number, forceNextWeek = false) => {

    const getTodayDayOrder = (): number => {
        const jsDay = new Date().getDay(); // 0–6
        return jsDay + 1; // convert to 1–7
    };

    const now = new Date();

    const todayOrder = getTodayDayOrder();

    let diff = dayOrder - todayOrder;

    // move to next week if passed
    if (diff < 0) diff += 7;

    const matDate = new Date(now);
    matDate.setDate(now.getDate() + diff);

    const hour = Math.floor(from / 60);
    const minute = from % 60;

    matDate.setHours(hour, minute, 0, 0);

    // ✅ handle same-day past time
    if (matDate <= now || forceNextWeek) {
        matDate.setDate(matDate.getDate() + 7);
    }

    return matDate;
};

export const gymService = {
    AddGymByAdmin,
    AddGymByUser,
    MyGyms,
    DeleteGym,
    deleteGymImage,
    updateGym,
    nearMeMats,
    allGymsForApp,
    GymDetails,
    allGyms,

    scheduleMatReminder
}