import httpStatus from "http-status"
import catchAsync from "../../utils/catchAsync";
import { friendService } from "./friends.service";
import sendResponse from "../../utils/sendResponse";

const MyFriends = catchAsync(async (req, res) => {
    const result = await friendService.MyFriends(req.query, req.user._id)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'My Friends Retrived Successfully',
        data: result,
    });
})
const FolowFriend = catchAsync(async (req, res) => {
    const result = await friendService.FolowFriend(req.user._id, req.body)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'User folowed successfully',
        data: result,
    });
})
const UnFolowFriend = catchAsync(async (req, res) => {
    const result = await friendService.UnFolowFriend(req.params.id, req.user._id)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Unfolowed successfully',
        data: result,
    });
})

export const friendControler = {
    MyFriends,
    FolowFriend,
    UnFolowFriend
}