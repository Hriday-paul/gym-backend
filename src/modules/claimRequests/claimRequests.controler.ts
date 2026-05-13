import { Request, Response } from "express";
import AppError from "../../error/AppError";
import catchAsync from "../../utils/catchAsync";
import { uploadToS3 } from "../../utils/s3";
import sendResponse from "../../utils/sendResponse";
import { claimReqService } from "./claimRequests.service";
import httpStatus from "http-status"
import path from "path"
import { notificationQueue } from "../../queues/notification.queue";
import { notificationJobs } from "../../workers/notification.worker";

export const AddclaimReq = catchAsync(async (req, res) => {

    const files = req.files as Record<string, Express.Multer.File[]> | undefined;

    if (!files)
        throw new AppError(httpStatus.BAD_REQUEST, "Files used for verification are missing from your request!");

    // required fields
    const requiredDocs = ["utility_bill", "business_license", "tax_document"];

    // collect missing fields
    const missing = requiredDocs.filter((f) => !files[f]);
    if (missing.length > 0)
        throw new AppError(httpStatus.BAD_REQUEST, `Missing files: ${missing.join(", ")}`);


    //check claim ailability
    await claimReqService.CheckclaimReq(req.body.gym, req.user._id);

    // Upload all files in parallel
    const uploads = await Promise.all(
        requiredDocs.map(async (field) => {
            const file = files[field][0];

            const ext =
                file?.originalname
                    ? path.extname(file.originalname)
                    : "";

            const newFileName = `${Math.floor(100000 + Math.random() * 900000)}${Date.now()}${ext}`;

            const uploaded = await uploadToS3({
                file,
                fileName: `images/files/${newFileName}`,
            });
            return { field, url: uploaded };
        })
    );

    // attach uploaded file URLs to body
    uploads.forEach(({ field, url }) => {
        req.body[field] = url;
    });

    // assign user ID
    req.body.user = req.user?._id;

    // save to DB
    const result = await claimReqService.AddclaimReq(req.body);

    //send notification to admin
    await notificationQueue.add(
        notificationJobs.adminNotification,
        {
            title : "Gym claim request",
            message : "A user has requested to claim a gym. Please review the request.",
            senderId : req.user?._id
        },
        {
            removeOnComplete: true,
            attempts: 3,
            backoff: {
                type: "exponential",
                delay: 2000, // 2s → 4s → 8s
            },
        }
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Your gym claim has been requested!",
        data: result,
    });
});

const ApproveClaimReq = catchAsync(async (req: Request, res: Response) => {
    const result = await claimReqService.ApproveClaimReq(req.params.id);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Gym claim approved successfully',
        data: result,
    });
});

const RejectClaimReq = catchAsync(async (req: Request, res: Response) => {
    const result = await claimReqService.RejectClaimReq(req.params.id);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Gym claim rejected successfully',
        data: result,
    });
});

const claimStats = catchAsync(async (req: Request, res: Response) => {
    const result = await claimReqService.claimStats();
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Claim stats retrived successfully',
        data: result,
    });
});
const allClaims = catchAsync(async (req: Request, res: Response) => {
    const result = await claimReqService.allClaims(req.query);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'All Claim reqs retrived successfully',
        data: result,
    });
});

export const claimReqControler = {
    AddclaimReq,
    ApproveClaimReq,
    claimStats,
    allClaims,
    RejectClaimReq
}