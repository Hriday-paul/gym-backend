import catchAsync from "../../utils/catchAsync";
import { gymService } from "./gym.service";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status"
import AppError from "../../error/AppError";
import { uploadManyToS3 } from "../../utils/s3";
import { sendAdminNotifications } from "../notification/notification.send.admin";

//add gym by admin
const AddGymByAdmin = catchAsync(async (req, res) => {
    const files = req.files as Express.Multer.File[];

    if (files) {
        const imgsArray: { file: any; path: string; key?: string }[] = [];

        files?.map(image => {
            imgsArray.push({
                file: image,
                path: `images/gym/images`,
            });
        });

        const urls = await uploadManyToS3(imgsArray);
        req.body.images = urls;

        if (urls?.length <= 0) {
            throw new AppError(
                httpStatus.BAD_REQUEST,
                'Minimum 1 image is required',
            );
        }
    }

    const result = await gymService.AddGymByAdmin(req.body, req.user._id);

    //send notification to admin
    sendAdminNotifications({
        title: "New Gym Added by you to your application",
        message: "A new gym has been successfully added to your application.",
        sender: req.user?._id as any,
    });

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'New Gym Added Successfully',
        data: result,
    });
})

//add gym by user
const AddGymByUser = catchAsync(async (req, res) => {
    const files = req.files as Express.Multer.File[];

    if (files) {
        const imgsArray: { file: any; path: string; key?: string }[] = [];

        files?.map(image => {
            imgsArray.push({
                file: image,
                path: `images/gym/images`,
            });
        });

        const urls = await uploadManyToS3(imgsArray);
        req.body.images = urls;

        if (urls?.length <= 0) {
            throw new AppError(
                httpStatus.BAD_REQUEST,
                'Minimum 1 image is required',
            );
        }
    }

    const result = await gymService.AddGymByUser(req.body, req.user._id)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'New Gym Added Successfully',
        data: result,
    });
})


const MyGyms = catchAsync(async (req, res) => {
    const result = await gymService.MyGyms(req.user._id)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'My Gyms Retrived Successfully',
        data: result,
    });
})

const GymDetails = catchAsync(async (req, res) => {
    const result = await gymService.GymDetails(req.params.id, req.user?._id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Gym Details Retrived Successfully',
        data: result,
    });
})

const DeleteGym = catchAsync(async (req, res) => {

    const result = await gymService.DeleteGym(req.user._id, req.params.id)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Gym Deleted Successfully',
        data: result,
    });
})

const deleteGymImage = catchAsync(async (req, res) => {

    const result = await gymService.deleteGymImage(req.body.gymId, req.body.imageId)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Gym Image Deleted Successfully',
        data: result,
    });
})

const updateGym = catchAsync(async (req, res) => {

    //check you are a owner
    // const exist = await GYM.findById(req.params.id)

    // if (exist?.user.toString() !== req.user?._id) {
    //     throw new AppError(httpStatus.BAD_REQUEST, "You are not owner this gym")
    // }

    const files = req.files as Express.Multer.File[];

    if (files) {
        const imgsArray: { file: any; path: string; key?: string }[] = [];

        files?.map(image => {
            imgsArray.push({
                file: image,
                path: `images/gym/images`,
            });
        });

        const urls = await uploadManyToS3(imgsArray);
        req.body.images = urls;
    }

    const result = await gymService.updateGym(req.body, req.params.id);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Gym Updated Successfully',
        data: result,
    });
})

const nearMeMats = catchAsync(async (req, res) => {

    const result = await gymService.nearMeMats(req.query, req.user?._id)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Near me open mats retrived successfully',
        data: result,
    });
})

const allMats = catchAsync(async (req, res) => {

    const result = await gymService.allMats(req.query, req.user?._id)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'All mats retrived successfully',
        data: result,
    });
})

const allGyms = catchAsync(async (req, res) => {

    const result = await gymService.allGyms(req.query)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'All gyms retrived successfully',
        data: result,
    });
})

export const gymControler = {
    AddGymByAdmin,
    AddGymByUser,
    MyGyms,
    DeleteGym,
    deleteGymImage,
    updateGym,
    nearMeMats,
    allMats,
    GymDetails,
    allGyms
}