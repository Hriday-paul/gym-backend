import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { competitionService } from "./competition.service";
import httpStatus from "http-status"

//add recent competition
const AddRecentCompetition = catchAsync(async (req, res) => {
    const result = await competitionService.AddRecentCompetition(req.body, req.user._id)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'A new competition has been added to your profile successfully.',
        data: result,
    });
})
const MyRecentCompetitions = catchAsync(async (req, res) => {
    const result = await competitionService.MyRecentCompetitions(req.user._id)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Recent competitions retrieved successfully.',
        data: result,
    });
})
const DeleteRecentCompetition = catchAsync(async (req, res) => {
    const result = await competitionService.DeleteRecentCompetition(req.params.id, req.user._id)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Competition deleted from your profile successfully.',
        data: result,
    });
})

export const competitionControler = {
    AddRecentCompetition,
    MyRecentCompetitions,
    DeleteRecentCompetition
}