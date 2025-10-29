import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { settingService } from "./settings.service";
import httpStatus from "http-status"

// get singleSettingItem
const singleSettingItem = catchAsync(async (req, res) => {
    
    const result = await settingService.singleSettingItem(req.params.key)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'settings fetched successfully',
        data: result,
    });
})

const updateSettingItem = catchAsync(async (req: Request, res: Response) => {

    const result = await settingService.updateSettingItem(req.body);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'settings updated successfully',
        data: result,
    });
});

export const settingsControler = {
    singleSettingItem,
    updateSettingItem
}