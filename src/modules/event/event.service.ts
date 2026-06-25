import moment from "moment";
import QueryBuilder from "../../builder/QueryBuilder";
import AppError from "../../error/AppError";
import { deleteFromS3 } from "../../utils/s3";
import { USER_ROLE } from "../user/user.constants";
import { IEvent } from "./event.interface";
import { Event } from "./event.model"
import httpStatus from "http-status";
import { eventQueue } from "../../queues/event.queue";

const allEvents = async (query: Record<string, any>) => {
    const eventModel = new QueryBuilder(Event.find(), query)
        .search(['name', 'venue'])
        .arrayFilter("type", query.type)
        .paginate()
        .sort();
    const data: any = await eventModel.modelQuery;
    const meta = await eventModel.countTotal();
    return {
        data,
        meta,
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
        throw new AppError(httpStatus.NOT_FOUND, "Event does not exist!");
    }

    if (exist.user.toString() !== userId && role !== USER_ROLE.admin) {
        throw new AppError(httpStatus.BAD_REQUEST, "You’re not the owner of this event!");
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
        throw new AppError(httpStatus.NOT_FOUND, "Event does not exist!");
    }

    if (exist.user.toString() !== userId && role !== USER_ROLE.admin) {

        throw new AppError(httpStatus.BAD_REQUEST, "You’re not the owner of this event!");

    }

    const { city, date, event_website, gym, image, name, registration_fee, state, venue } = payload

    const updateFields: Partial<IEvent> = { city, date, event_website, gym, image, name, registration_fee, state, venue };

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
            'No valid field found',
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