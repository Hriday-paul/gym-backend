import httpStatus from "http-status"
import catchAsync from "../../utils/catchAsync";
import { eventService } from "./event.service";
import sendResponse from "../../utils/sendResponse";
import { uploadToS3 } from "../../utils/s3";
import AppError from "../../error/AppError";
import { GYM } from "../gym/gym.model";

const allEvents = catchAsync(async (req, res) => {
    const result = await eventService.allEvents(req.query)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'All Events Retrived Successfully',
        data: result,
    });
})

const addEvent = catchAsync(async (req, res) => {

    //check gym owner
    const gym = await GYM.findById(req.body.gym);

    if (gym?.user.toString() !== req.user?._id) {
        throw new AppError(httpStatus.BAD_REQUEST, "You are not owner this selected gym")
    }

    let image;

    if (req.file) {
        image = await uploadToS3({
            file: req.file,
            fileName: `images/events/${Math.floor(100000 + Math.random() * 900000)}`,
        });
    } else {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            'Event image is required',
        );
    }

    req.body.image = image;
    req.body.user = req.user?._id;

    const result = await eventService.addEvent(req.body)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'New event added successfully',
        data: result,
    });
})

const myEvents = catchAsync(async (req, res) => {
    const result = await eventService.myEvents(req.user?._id)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'My Events Retrived Successfully',
        data: result,
    });
})
const deleteEvent = catchAsync(async (req, res) => {
    const result = await eventService.deleteEvent(req.params.id, req.user?._id)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Event Deleted Successfully',
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
    const result = await eventService.updateEvent(req.body, req.params.id, req.user?._id)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Event Updated Successfully',
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