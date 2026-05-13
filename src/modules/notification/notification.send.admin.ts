/* eslint-disable @typescript-eslint/no-explicit-any */
import { ObjectId as mongoId } from "mongodb"
import { User } from "../user/user.models";
import { notificationQueue } from "../../queues/notification.queue";
import { notificationJobs } from "../../workers/notification.worker";

export interface IAdminSendNotificationPayload {
  sender: mongoId;
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

  const tokenToUse = (admin?.fcmToken && admin?.notification) ? [admin?.fcmToken] : []

  await notificationQueue.add(
    notificationJobs.singleNotification,
    {
      tokens: tokenToUse,
      title: payload.title,
      message: payload.message,
      receiverId: admin?._id,
      receiverEmail: admin?.email,
      senderId: admin?._id
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

};
