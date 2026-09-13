import { Queue } from "bullmq";
import { connectionInfo } from "../config/redis";

export const emailQueue = new Queue(
    "email",
    {
        connection: connectionInfo,
        defaultJobOptions: {
            attempts: 3,
            backoff: { type: "exponential", delay: 2000 }, // 2s, 4s, 8s
            removeOnComplete: true,
            removeOnFail: true,
        }
    }
);