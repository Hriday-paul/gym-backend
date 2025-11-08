import { Request, RequestHandler, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { userService } from "./user.service";
import { IUser } from "./user.interface";
import sendResponse from "../../utils/sendResponse";
import httpStatus from 'http-status'
import { User } from "./user.models";
import AppError from "../../error/AppError";
import config from "../../config";
import { uploadToS3 } from "../../utils/s3";

//get all users
const all_users = catchAsync(async (req: Request, res: Response) => {
    const query = req.query
    const result = await userService.allUsers(query, req.user?._id)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Users retrive successfully',
        data: result,
    });
})
const getUnfriends = catchAsync(async (req: Request, res: Response) => {
    const query = req.query
    const result = await userService.getUnfriends(query, req.user?._id)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Unfriend users retrive successfully',
        data: result,
    });
})

const updateProfile = catchAsync(async (req: Request<{}, {}, IUser>, res: Response) => {
    let image;

    if (req.file) {
        image = await uploadToS3({
            file: req.file,
            fileName: `images/user/${Math.floor(100000 + Math.random() * 900000)}`,
        });
    }

    const result = await userService.updateProfile(req.body, req.user._id, image?.url || '')

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'profile updated successfully',
        data: result,
    });

})

//get my profile
const getMyProfile = catchAsync(async (req: Request, res: Response) => {
    const result = await userService.getUserById(req?.user?._id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'profile fetched successfully',
        data: result,
    });
});

//get my profile
const geUserDetails = catchAsync(async (req: Request, res: Response) => {
    const result = await userService.getUserById(req?.params.id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'User details fetched successfully',
        data: result,
    });
});

// status update user
const update_user_status: RequestHandler<{ id: string }, {}, { status: boolean }> = catchAsync(async (req, res) => {
    const result = await userService.status_update_user(req.body, req.params.id)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'status updated successfully',
        data: result,
    });
})

//add recent competition
const AddRecentCompetition: RequestHandler<{ id: string }, {}, { status: boolean }> = catchAsync(async (req, res) => {
    const result = await userService.AddRecentCompetition(req.body, req.user._id)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Modified recent competition',
        data: result,
    });
})

// delete my accont
const deletemyAccount = catchAsync(async (req, res) => {

    const result = await userService.deletemyAccount(req.user._id);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Your account deleted successfully',
        data: result,
    });
})


export const userController = {
    updateProfile,
    getMyProfile,
    update_user_status,
    all_users,
    AddRecentCompetition,
    deletemyAccount,
    geUserDetails,
    getUnfriends
}