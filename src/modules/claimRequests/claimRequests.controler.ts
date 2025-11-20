import { Request, Response } from "express";
import AppError from "../../error/AppError";
import catchAsync from "../../utils/catchAsync";
import { uploadToS3 } from "../../utils/s3";
import sendResponse from "../../utils/sendResponse";
import { claimReqService } from "./claimRequests.service";
import httpStatus from "http-status"
import { sendAdminNotifications } from "../notification/notification.send.admin";

export const AddclaimReq = catchAsync(async (req, res) => {

    const files = req.files as Record<string, Express.Multer.File[]> | undefined;

    if (!files)
        throw new AppError(httpStatus.BAD_REQUEST, "Files are missing from request");

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
            const uploaded = await uploadToS3({
                file,
                fileName: `images/files/${Math.floor(100000 + Math.random() * 900000)}`,
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
    sendAdminNotifications({
        title: "User requested a gym for claim",
        message: "A user has requested to add a new gym for their claim. Please review the request.",
        sender: req.user?._id as any,
    })

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Claim requested successfully",
        data: result,
    });
});

const ApproveClaimReq = catchAsync(async (req: Request, res: Response) => {
    const result = await claimReqService.ApproveClaimReq(req.params.id);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Claim approved successfully',
        data: result,
    });
});

const RejectClaimReq = catchAsync(async (req: Request, res: Response) => {
    const result = await claimReqService.RejectClaimReq(req.params.id);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Claim rejected successfully',
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