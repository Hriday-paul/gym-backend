import httpStatus from 'http-status';
import AppError from '../../error/AppError';
import QueryBuilder from '../../builder/QueryBuilder';
import { Icontact } from './contact.interface';

import path from 'path';
import { sendEmail } from '../../utils/mailSender';
import fs from 'fs';
import { Contact } from './contact.models';
import config from '../../config';

const createContact = async (payload: Icontact) => {

  const emailPath = path.join(
    __dirname,
    '../../../public/view/supportEmail.html',
  );
  // If 'isApproved' is set to true, send an email
  await sendEmail(
    config.nodemailer_host_email!,
    'Got a support message from Marketplace app.',
    fs
      .readFileSync(emailPath, 'utf8')
      .replace('{{name}}', payload?.firstName + " " + payload?.lastName)
      .replace('{{email}}', payload?.email)
      .replace('{{contact}}', payload?.contact)
      .replace('{{details}}', payload?.description)
  );

  const contacts = await Contact.create(payload);

  if (!contacts) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Failed to create contact',
    );
  }
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
    'Support Reply from Forager',
    fs
      .readFileSync(emailPath, 'utf8')
      .replace('{{customer_name}}', contact?.firstName + " " + contact?.lastName)
      .replace('{{details}}', message)
  );

  const contacts = await Contact.updateOne({ _id: id }, { isReplied: true, reply_message: message, replied_At: new Date() });

  return contacts;
};

const getAllcontact = async (query: Record<string, any>) => {
  const contactModel = new QueryBuilder(Contact.find(), query)
    .search(['firstName', 'lastName', 'email', 'contact'])
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
