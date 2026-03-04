import { Worker } from "bullmq";
import { connectionInfo } from "../config/redis";
import { Event } from "../modules/event/event.model"

new Worker(
    "event-delete",
    async (job) => {
        try {
            const { eventId } = job.data;
            await Event.deleteOne({ _id: eventId });
        } catch (err) {
            console.log("event delete failed")
        }
    },
    { connection: connectionInfo }
);