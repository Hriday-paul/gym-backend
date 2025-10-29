/* eslint-disable @typescript-eslint/no-explicit-any */
import { ObjectId } from "mongoose";
import { sendNotification } from "./notification.utils";
import { User } from "../user/user.models";

export interface IAdminSendNotificationPayload {
  sender: ObjectId;
  type?: "text" | "accept" | "reject" | "cancelled" | "payment" | "product";
  title: string;
  message: string;
  link?: string;
}

export const sendAdminNotifications = async (
  payload: IAdminSendNotificationPayload
) => {

  const admin = await User.findOne({
    role: "admin",
    isDeleted: false,
  }).select("fcmToken email _id");

  if (!admin) {
    return;
  }

  const fcmToken = admin?.fcmToken ? [admin?.fcmToken] : []

  sendNotification(fcmToken, {
    sender: payload.sender,
    receiver: admin?._id as any,
    receiverEmail: admin?.email,
    receiverRole: "admin",
    title: payload.title,
    message: payload.message,
    type: payload.type as any,
    link: payload.link,
  });

};
