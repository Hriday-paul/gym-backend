import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { contactService } from './contact.service';
import sendResponse from '../../utils/sendResponse';
import { sendAdminNotifications } from '../notification/notification.send.admin';

const createcontact = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  req.body.userId = userId;

  // console.log('======', req.body);
  const result = await contactService.createContact(req.body);

  //send notification to admin
  sendAdminNotifications({
    title: "New Support Message",
    message: "A user has sent a new support message. Please review and respond.",
    sender: req.user?._id as any,
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Message sent successfully',
    data: result,
  });
});

const replyContact = catchAsync(async (req: Request, res: Response) => {
  const result = await contactService.replyContact(req.params.id, req.body.message);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Reply message sent successfully',
    data: result,
  });
});

const getAllcontact = catchAsync(async (req: Request, res: Response) => {
  const result = await contactService.getAllcontact(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Contacts retrieved successfully',
    data: result,
  });
});

const deletecontact = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await contactService.deletecontact(id);
  if (!result) {
    sendResponse(res, {
      statusCode: 404,
      success: false,
      message: 'Contact not found to delete',
      data: {},
    });
  } else {
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Contact deleted successfully',
      data: result,
    });
  }
});

export const contactController = {
  createcontact,
  getAllcontact,
  deletecontact,
  replyContact
};
