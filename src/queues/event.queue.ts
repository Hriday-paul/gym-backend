import { Queue } from "bullmq";
import { connectionInfo } from "../config/redis";

export const eventQueue = new Queue(
    "event-delete",
    {
        connection: connectionInfo,
        defaultJobOptions: {
            attempts: 3,
            backoff: { type: "exponential", delay: 2000 },
            removeOnComplete: true,
            removeOnFail: false
        }
    }
);