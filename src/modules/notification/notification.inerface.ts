
import {ObjectId as mongoId} from "mongodb"


export interface INotification {
  sender: mongoId;
  receiver: mongoId;
  receiverEmail: string;
  receiverRole: "user" | "admin";
  message: string;
  fcmToken?: string;
  type?: "text" | "accept" | "reject" | "cancelled" | "payment" | "product";
  title?: string;
  isRead?: boolean;
  link?: string;
}