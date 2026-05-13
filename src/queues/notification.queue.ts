import { Queue } from "bullmq";
import { connectionInfo } from "../config/redis";

export const notificationQueue = new Queue(
    "notification",
    { connection: connectionInfo }
);