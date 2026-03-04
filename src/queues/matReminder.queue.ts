import { Queue } from "bullmq";
import { connectionInfo } from "../config/redis";

export const matReminderQueue = new Queue(
    "mat-reminder",
    { connection: connectionInfo }
);