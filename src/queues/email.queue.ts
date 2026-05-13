import { Queue } from "bullmq";
import { connectionInfo } from "../config/redis";

export const emailQueue = new Queue(
    "email",
    { connection: connectionInfo }
);