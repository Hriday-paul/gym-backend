/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from "express";
import httpStatus from "http-status";
import AppError from "../../error/AppError";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import Notification from "./notification.model";
import { notificationServices } from "./notification.service";

const getAllNotification = catchAsync(async (req: Request, res: Response) => {
  const query = { ...req.query };
  query["receiver"] = req.user._id;
  const result = await notificationServices.getNotificationFromDb(query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Notifications retrieved successfully",
    data: result,
  });
});

const makeRead = catchAsync(async (req: Request, res: Response) => {

  const id = req.params.id;

  const isNotification = await Notification.findOne({
    _id: id,
    receiver: req.user._id,
  });

  if (!isNotification) throw new AppError(httpStatus.NOT_FOUND, "Notification is not exist!");


  if (isNotification?.receiver?.toString() != req.user._id.toString()) {
    throw new AppError(httpStatus.FORBIDDEN, "You are not owner to this notification");
  }

  const result = await notificationServices.makeMeRead(id, req.user._id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Notifications read successfully",
    data: result,
  });

})

const makeReadAll = catchAsync(async (req: Request, res: Response) => {

  const result = await notificationServices.makeReadAll(req.user._id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "All Notifications read successfully",
    data: result,
  });

})

export const notificationController = {
  getAllNotification,
  makeRead,
  makeReadAll
};
