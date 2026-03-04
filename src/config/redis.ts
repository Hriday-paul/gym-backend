import { Redis } from "ioredis";
import config from ".";

export const connectionInfo = {
    host: config.redis.host,
    port: Number(config.redis.port),
    password: config.redis.password,
    maxRetriesPerRequest: null, // REQUIRED for BullMQ
    retryStrategy(times: number) {
        return Math.min(times * 50, 2000);
    }
}

export const connection = new Redis(connectionInfo);

connection.on("error", (err) => {
    console.error("Redis error:", err);
});