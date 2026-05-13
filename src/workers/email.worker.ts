import { Worker } from "bullmq"
import { connectionInfo } from "../config/redis";
import { sendEmail } from "../utils/mailSender";

new Worker("email", async job => {

    const { to, subject, html } = job.data;

    await sendEmail(
        to,
        subject,
        html
    );

}, { connection: connectionInfo })
    .on("failed", (job, err) => {
        console.log(`------email send failed ❌ to: ${job?.data?.to}------`, err.message);
    });