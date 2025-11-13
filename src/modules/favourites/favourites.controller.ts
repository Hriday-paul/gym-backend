import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { favouriteService } from "./favourites.service";
import httpStatus from "http-status"

const deleteFavourite = catchAsync(async (req, res) => {

    const result = await favouriteService.deletefavourite(req?.params?.id, req?.user?._id);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Gym removed successfully from save',
        data: result,
    });
})

const addFavourite = catchAsync(async (req, res) => {

    const result = await favouriteService.addFavourite(req?.body?.gym, req?.user?._id);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Gym saved successfully',
        data: result,
    });
})

const myAllFavourites = catchAsync(async (req, res) => {

    const result = await favouriteService.getAllMyFavourites(req?.user?._id);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'My all saved gyms retrived successfully',
        data: result,
    });
});

export const favouriteController = {
    myAllFavourites,
    addFavourite,
    deleteFavourite
}