import { Queue } from "bullmq";
import { connectionInfo } from "../config/redis";

export const eventQueue = new Queue(
    "event-delete",
    { connection: connectionInfo }
);