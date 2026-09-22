import { Queue } from "bullmq";
import { connectionInfo } from "../config/redis";

export const notificationQueue = new Queue(
    "notification",
    {
        connection: connectionInfo,
        defaultJobOptions: {
            attempts: 3,
            backoff: { type: "exponential", delay: 2000 },
            removeOnComplete: true,
            removeOnFail: 100
        }
    }
);