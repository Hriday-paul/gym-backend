import httpStatus from "http-status"
import catchAsync from "../../utils/catchAsync";
import { eventService } from "./event.service";
import sendResponse from "../../utils/sendResponse";
import { uploadToS3 } from "../../utils/s3";
import AppError from "../../error/AppError";

const allEvents = catchAsync(async (req, res) => {
    const result = await eventService.allEvents(req.query)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Events retrieved successfully.',
        data: result,
    });
})

const addEvent = catchAsync(async (req, res) => {

    let image;

    if (req.file) {
        image = await uploadToS3({
            file: req.file,
            fileName: `images/events/${Math.floor(100000 + Math.random() * 900000)}`,
        });
    } else {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            'Event image is required.',
        );
    }

    req.body.image = image;
    req.body.user = req.user?._id;

    const result = await eventService.addEvent(req.body)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Event added successfully.',
        data: result,
    });
})

const myEvents = catchAsync(async (req, res) => {
    const result = await eventService.myEvents(req.user?._id)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Events retrieved successfully.',
        data: result,
    });
})
const deleteEvent = catchAsync(async (req, res) => {
    const result = await eventService.deleteEvent(req.params.id, req.user?._id, req?.user?.role)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Event deleted successfully.',
        data: result,
    });
})
const updateEvent = catchAsync(async (req, res) => {

    if (req.file) {
        const image = await uploadToS3({
            file: req.file,
            fileName: `images/events/${Math.floor(100000 + Math.random() * 900000)}`,
        });
        req.body.image = image
    }
    const result = await eventService.updateEvent(req.body, req.params.id, req.user?._id, req?.user?.role)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Event updated successfully.',
        data: result,
    });
})

export const eventControler = {
    allEvents,
    addEvent,
    myEvents,
    deleteEvent,
    updateEvent
}