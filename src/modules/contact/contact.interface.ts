import mongoose, { ObjectId } from 'mongoose';

export interface Icontact {
  firstName: string;
  lastName: string;
  email: string;
  contact : string;
  description: string;
  isReplied : boolean;
  reply_message : null | string,
  replied_At : Date
}
