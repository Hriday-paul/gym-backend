import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { reminderTemplateService } from "./reminder.service";
import httpStatus from "http-status";

const updateReminderTemplate = catchAsync(async (req, res) => {

    const result = await reminderTemplateService.updateReminderTemplate(req.body)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Reminder template updated',
        data: result,
    });
})

const getReminderTemplate = catchAsync(async (req, res) => {

    const result = await reminderTemplateService.getReminderTemplate()
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Reminder template retrived succesfully',
        data: result,
    });
})

export const reminderTemplateControler = {
    updateReminderTemplate,
    getReminderTemplate
}