import { Worker } from "bullmq";
import { sendNotification } from "../modules/notification/notification.utils";
import { sendAdminNotifications } from "../modules/notification/notification.send.admin";
import { connectionInfo } from "../config/redis";
import Notification from "../modules/notification/notification.model";

export const notificationJobs = {
    singleNotification: "singleNotification",
    adminNotification: "adminNotification"
}

export const notificationWorker = new Worker(
    "notification",
    async (job) => {

        if (job.name == notificationJobs.adminNotification) {
            const { title, message, senderId } = job.data;
            await sendAdminNotifications({
                title,
                message,
                sender: senderId,
            });
        }
        else if (job.name == notificationJobs.singleNotification) {
            const { tokens, title, message, receiverId, receiverEmail, senderId } = job.data;

            await sendNotification(tokens, {
                title,
                message,
                receiver: receiverId,
                receiverEmail: receiverEmail,
                receiverRole: "user",
                sender: senderId,
            });
        }
    },
    { connection: connectionInfo }
);

notificationWorker.on('failed', async (job, err) => {

    if (!job) return;

    if (job.attemptsMade >= 3) {
        console.log(`------notification failed after ${3} attempts ❌------`, err.message);

        const { title, message, receiverId, receiverEmail, senderId } = job.data;

        try {

            if (receiverId) {
                await Notification.create({
                    sender: senderId,
                    receiver: receiverId,
                    receiverEmail: receiverEmail,
                    receiverRole: "user",
                    title: title,
                    message: message
                })
            } else {
                console.log("Admin Notification create failed");
            }


        } catch (err) {
            console.log("Notification create failed");
        }

    }

    console.error(`Notification job ${job?.id} failed:`, job, err);
});