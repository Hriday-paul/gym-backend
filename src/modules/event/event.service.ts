import QueryBuilder from "../../builder/QueryBuilder";
import AppError from "../../error/AppError";
import { deleteFromS3 } from "../../utils/s3";
import { IEvent } from "./event.interface";
import { Event } from "./event.model"
import httpStatus from "http-status";

const allEvents = async (query: Record<string, any>) => {
    const eventModel = new QueryBuilder(Event.find(), query)
        .search(['name', 'venue'])
        .filter()
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
    const res = await Event.create(payload);
    return res;
}

const myEvents = async (userId: string) => {
    const res = await Event.find({ user: userId });
    return res;
}


const deleteEvent = async (eventId: string, userId: string) => {
    const exist = await Event.findById(eventId);

    if (!exist) {
        throw new AppError(httpStatus.NOT_FOUND, "Event not found");
    }

    if (exist.user.toString() !== userId) {
        throw new AppError(httpStatus.BAD_REQUEST, "You are not owner this event");
    }

    const res = await Event.deleteOne({ _id: eventId });

    await deleteFromS3(exist?.image?.key);

    return res;
}

const updateEvent = async (payload: IEvent, eventId: string, userId : string) => {

    const exist = await Event.findById(eventId);

    if (!exist) {
        throw new AppError(httpStatus.NOT_FOUND, "Event not found");
    }

    if (exist.user.toString() !== userId) {
        throw new AppError(httpStatus.BAD_REQUEST, "You are not owner this event");
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

    const result = await Event.updateOne({ _id: eventId }, updateFields)

    return result
}


export const eventService = {
    allEvents,
    addEvent,
    myEvents,
    deleteEvent,
    updateEvent
}