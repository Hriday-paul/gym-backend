import mongoose, { model, Model, Schema } from 'mongoose';
import { Icontact } from './contact.interface';

export interface contactModel extends Model<Icontact> { }

const ContactSchema: Schema<Icontact> = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: false },
    email: { type: String, required: true },
    contact: { type: String, required: true },
    description: { type: String, required: true },
    isReplied: { type: Boolean, required: true, default: false },
    reply_message: { type: String, default: null },
    replied_At : {type : Date, default : null}
  },
  { timestamps: true },
);

export const Contact = model<Icontact, contactModel>('contacts', ContactSchema);
