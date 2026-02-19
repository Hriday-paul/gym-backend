import moment from "moment";
import QueryBuilder from "../../builder/QueryBuilder";
import agenda from "../../config/agenda";
import AppError from "../../error/AppError";
import { deleteFromS3 } from "../../utils/s3";
import { USER_ROLE } from "../user/user.constants";
import { IEvent } from "./event.interface";
import { Event } from "./event.model"
import httpStatus from "http-status";

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

// -----------------------------event delete schedule------------------
agenda.define("eventClose", async (job: any) => {
    try {
        const { eventId } = job.attrs.data;
        await Event.deleteOne({ _id: eventId });
    } catch (err) { }
});

const addEvent = async (payload: IEvent) => {
    const event = await Event.create(payload);

    const thirdDayUTC = moment(event?.date).add(3, "days").toDate();

    // schedule event delete 3 days later
    await agenda.schedule(thirdDayUTC, "eventClose", {
        eventId: event?._id,
    });

    return event;
}

const myEvents = async (userId: string) => {
    const res = await Event.find({ user: userId }).sort("-createdAt");
    return res;
}


const deleteEvent = async (eventId: string, userId: string, role: string) => {
    const exist = await Event.findById(eventId);

    if (!exist) {
        throw new AppError(httpStatus.NOT_FOUND, "Event not found");
    }

    if (exist.user.toString() !== userId && role !== USER_ROLE.admin) {
        throw new AppError(httpStatus.BAD_REQUEST, "You’re not the owner of this event!");
    }

    const res = await Event.deleteOne({ _id: eventId });

    await deleteFromS3(exist?.image?.key);

    // remove schedule event delete
    await agenda.cancel({ "data.eventId": eventId });

    return res;
}

const updateEvent = async (payload: IEvent, eventId: string, userId: string, role: string) => {

    const exist = await Event.findById(eventId)

    if (!exist) {
        throw new AppError(httpStatus.NOT_FOUND, "Event not found");
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

    if (date) {
        // remove schedule event delete
        await agenda.cancel({ "data.eventId": eventId });

        // generate new event
        const thirdDayUTC = moment(payload.date).add(3, "days").utc().format();

        await agenda.schedule(thirdDayUTC, "event close", {
            eventId: eventId,
        });

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