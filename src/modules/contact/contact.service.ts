import httpStatus from 'http-status';
import AppError from '../../error/AppError';
import QueryBuilder from '../../builder/QueryBuilder';
import { Icontact } from './contact.interface';
import path from 'path';
import { sendEmail } from '../../utils/mailSender';
import fs from 'fs';
import { Contact } from './contact.models';
import config from '../../config';
import { notificationQueue } from '../../queues/notification.queue';
import { notificationJobs } from '../../workers/notification.worker';
import { emailQueue } from '../../queues/email.queue';

const createContact = async (payload: Icontact, userId: string) => {

  const emailPath = path.join(
    process.cwd(),
    'public',
    'view',
    'supportEmail.html'
  );

  await emailQueue.add(
    "email",
    {
      to: config.nodemailer_host_email,
      subject: "Got a support message from Jiu Jitsu App.",
      html: fs
        .readFileSync(emailPath, 'utf8')
        .replace('{{name}}', payload?.name)
        .replace('{{email}}', payload?.email)
        .replace('{{details}}', payload?.description)
    },
    {
      delay: 0,
      removeOnComplete: true,
      removeOnFail: true,
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 2000, // 2s → 4s → 6s
      },
    }
  );

  const contacts = await Contact.create(payload);


  if (!contacts) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Failed to create contact',
    );
  }

  //send notification to admin
  await notificationQueue.add(
    notificationJobs.adminNotification,
    {
      title: "New Support Message",
      message: "A user has sent a new support message. Please review and respond.",
      senderId: userId
    },
    {
      removeOnComplete: true,
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 2000, // 2s → 4s → 8s
      },
    }
  );

  return contacts;
};

const replyContact = async (id: string, message: string) => {

  const contact = await Contact.findById(id);

  if (!contact) {
    throw new AppError(httpStatus.NOT_FOUND, 'Contact Not Found!');
  }

  if (contact?.isReplied) {
    throw new AppError(httpStatus.FORBIDDEN, 'You already replied to this message. Please, continue with email');
  }

  const emailPath = path.join(
    __dirname,
    '../../../public/view/reply_email.html',
  );
  // If 'isApproved' is set to true, send an email
  await sendEmail(
    contact?.email,
    'Support Reply from Jiu Jitsu App',
    fs
      .readFileSync(emailPath, 'utf8')
      .replace('{{customer_name}}', contact?.name)
      .replace('{{details}}', message)
  );

  const contacts = await Contact.updateOne({ _id: id }, { isReplied: true, reply_message: message, replied_At: new Date() });

  return contacts;
};

const getAllcontact = async (query: Record<string, any>) => {
  const contactModel = new QueryBuilder(Contact.find(), query)
    .search(['name', 'email'])
    .filter()
    .paginate()
    .sort();

  const data: any = await contactModel.modelQuery;
  const meta = await contactModel.countTotal();

  return {
    data,
    meta,
  };
};


const deletecontact = async (id: string) => {
  const deletedContact = await Contact.findByIdAndDelete(id);
  if (!deletedContact) {
    throw new AppError(httpStatus.NOT_FOUND, 'Contact not found to delete');
  }
  return deletedContact;
};

export const contactService = {
  createContact,
  getAllcontact,
  deletecontact,
  replyContact
};
