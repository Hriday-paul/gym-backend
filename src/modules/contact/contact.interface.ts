import mongoose, { ObjectId } from 'mongoose';

export interface Icontact {
  name: string;
  email: string;
  description: string;
  isReplied : boolean;
  reply_message : null | string,
  replied_At : Date
}
