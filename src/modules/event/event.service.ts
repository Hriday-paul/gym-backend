import moment from "moment";
import AppError from "../../error/AppError";
import { deleteFromS3 } from "../../utils/s3";
import { USER_ROLE } from "../user/user.constants";
import { IEvent } from "./event.interface";
import { Event } from "./event.model"
import httpStatus from "http-status";
import { eventQueue } from "../../queues/event.queue";

const allEvents = async (query: Record<string, any>) => {

    const lat = query?.lat;
    const long = query?.long;
    const limit = query?.limit ? parseInt(query.limit) : 10;
    const page = query?.page ? parseInt(query.page) : 1;
    const type = query?.type;
    const searchTerm = query?.searchTerm;
    const distance = query?.distance;

    const pipeline: any[] = [];

    if (long && lat) {

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

        pipeline.unshift({
            $geoNear: geoNear
        });

    }


    // ── 2. $match (status + search + type filter) ────────────────────────────
    const matchStage: Record<string, any> = {};

    if (searchTerm) {
        matchStage.$or = [
            { name: { $regex: searchTerm, $options: "i" } },
            { venue: { $regex: searchTerm, $options: "i" } },
        ];
    }

    if (type) {
        const types = Array.isArray(type) ? type : String(type).split(",");
        matchStage.type = { $in: types };
    }

    pipeline.push({ $match: matchStage });

    // ── 3. $sort ─────────────────────────────────────────────────────────────
    pipeline.push({
        $sort: lat && long ? { distance: 1 } : { createdAt: -1 },
    });

    // ── 4. Paginated data + count in parallel ─────────────────────────────────
    const skip = (page - 1) * limit;

    const events = await Event.aggregate([
        ...pipeline,
        { $skip: skip },
        { $limit: limit },
    ]);

    const countResult = await Event.aggregate([
        ...pipeline,
        { $count: "total" },        // single-pass count after all filters
    ]);

    const total = countResult[0]?.total ?? 0;

    return {
        data: events,
        meta: {
            total,
            page,
            limit,
            totalPage: Math.ceil(total / limit),
        },
    };
}

const addEvent = async (payload: IEvent) => {
    const event = await Event.create(payload);

    if (event.date) {

        // schedule event delete 3 days later
        const thirdDayUTC = moment(event.date).add(3, "days");

        const delay = thirdDayUTC.diff(moment()); // milliseconds

        await eventQueue.add(
            "event-delete",
            { eventId: event._id },
            {
                delay: delay > 0 ? delay : 0,
                jobId: `${event?.id}`,
                removeOnComplete: true,
                removeOnFail: true,
                attempts: 3,
                backoff: {
                    type: "exponential",
                    delay: 5000, // 5s → 10s → 20s
                },
            }
        );
    }

    return event;
}

const myEvents = async (userId: string) => {
    const res = await Event.find({ user: userId }).sort("-createdAt");
    return res;
}


const deleteEvent = async (eventId: string, userId: string, role: string) => {
    const exist = await Event.findById(eventId);

    if (!exist) {
        throw new AppError(httpStatus.NOT_FOUND, "Event does not exist.");
    }

    if (exist.user.toString() !== userId && role !== USER_ROLE.admin) {
        throw new AppError(httpStatus.BAD_REQUEST, "You are not the owner of this event.");
    }

    const res = await Event.deleteOne({ _id: eventId });

    deleteFromS3(exist?.image?.key);

    //check queue for existing job and remove it
    const existingJob = await eventQueue.getJob(`${exist?._id}`);

    if (existingJob) {
        // remove schedule event delete
        await eventQueue.remove(`${exist?._id}`);
    }

    return res;
}

const updateEvent = async (payload: IEvent, eventId: string, userId: string, role: string) => {

    const exist = await Event.findById(eventId)

    if (!exist) {
        throw new AppError(httpStatus.NOT_FOUND, "Event does not exist.");
    }

    if (exist.user.toString() !== userId && role !== USER_ROLE.admin) {

        throw new AppError(httpStatus.BAD_REQUEST, "You are not the owner of this event.");

    }

    const { city, date, startDate, event_website, gym, image, name, registration_fee, state, venue, location, street, zip_code, apartment, type } = payload;

    const formattedLocation = location?.coordinates
        ? { type: 'Point', coordinates: location.coordinates }
        : undefined;

    const updateFields: Partial<IEvent> = { city, date, startDate, event_website, gym, image, name, registration_fee, state, venue, location: formattedLocation, street, zip_code, apartment, type };

    if (image) updateFields.image = image;

    // Remove undefined or null fields to prevent overwriting existing values with null
    Object.keys(updateFields).forEach((key) => {
        if (updateFields[key as keyof IEvent] === undefined || updateFields[key as keyof IEvent] === '' || updateFields[key as keyof IEvent] === null) {
            delete updateFields[key as keyof IEvent];
        }
    });

    if (Object.keys(updateFields).length === 0) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            'No valid fields were provided.',
        );
    }

    const result = await Event.updateOne({ _id: eventId }, updateFields);

    // check if the date & time has changed, if yes then reschedule the event delete job
    if (date) {

        //check queue for existing job and remove it
        const existingJob = await eventQueue.getJob(`${exist?._id}`);

        if (existingJob) {
            // remove old schedule event delete
            await eventQueue.remove(`${exist?._id}`);
        }

        // generate new schedule event delete
        const thirdDayUTC = moment(date).add(3, "days");
        const delay = thirdDayUTC.diff(moment()); // milliseconds
        await eventQueue.add(
            "event-delete",
            { eventId },
            {
                delay: delay > 0 ? delay : 0,
                jobId: `${eventId}`,
                removeOnComplete: true,
                removeOnFail: true,
                attempts: 3,
                backoff: {
                    type: "exponential",
                    delay: 5000, // 5s → 10s → 20s
                },
            }
        );

    }

    return result
}


export const eventService = {
    allEvents,
    addEvent,
    myEvents,
    deleteEvent,
    updateEvent
}