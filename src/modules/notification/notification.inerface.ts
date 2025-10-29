/* eslint-disable @typescript-eslint/no-explicit-any */

import { ObjectId } from "mongoose";
import {ObjectId as mongoId} from "mongodb"


export interface INotification {
  sender: ObjectId;
  receiver: ObjectId;
  receiverEmail: string;
  receiverRole: "user" | "admin";
  product ?: mongoId
  message: string;
  fcmToken?: string;
  type?: "text" | "accept" | "reject" | "cancelled" | "payment" | "product";
  title?: string;
  isRead?: boolean;
  link?: string;
}