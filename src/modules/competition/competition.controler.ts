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
        message: 'Recent competition added',
        data: result,
    });
})
const MyRecentCompetitions = catchAsync(async (req, res) => {
    const result = await competitionService.MyRecentCompetitions(req.user._id)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Recent competition retrived success',
        data: result,
    });
})
const DeleteRecentCompetition = catchAsync(async (req, res) => {
    const result = await competitionService.DeleteRecentCompetition(req.params.id, req.user._id)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Recent competition deleted success',
        data: result,
    });
})

export const competitionControler = {
    AddRecentCompetition,
    MyRecentCompetitions,
    DeleteRecentCompetition
}