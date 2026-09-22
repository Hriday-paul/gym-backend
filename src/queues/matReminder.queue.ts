import { Queue } from "bullmq";
import { connectionInfo } from "../config/redis";

export const matReminderQueue = new Queue(
    "mat-reminder",
    {
        connection: connectionInfo,
        defaultJobOptions: {
            attempts: 3,
            backoff: { type: "exponential", delay: 5000 },
            removeOnComplete: true,
            removeOnFail: false
        }
    }
);