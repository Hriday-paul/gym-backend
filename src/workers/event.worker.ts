import { Worker } from "bullmq";
import { connectionInfo } from "../config/redis";
import { Event } from "../modules/event/event.model";
import { notificationQueue } from "../queues/notification.queue";
import { notificationJobs } from "./notification.worker";

new Worker(
    "event-delete",
    async (job) => {
        const { eventId } = job.data;
        await Event.deleteOne({ _id: eventId });
    },
    { connection: connectionInfo }
)
    .on("failed", async (job, err) => {
        console.log(`------event delete failed ❌ eventId: ${job?.data?.eventId}------`, err.message);
        try {

            await notificationQueue.add(
                notificationJobs.adminNotification,
                {
                    title: "Event Deletion Failed",
                    message: "Failed to delete the event. Please try deleting it manually.",
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

        } catch {
            console.log(`------event delete failed notification send failed--------`);
        }
    });