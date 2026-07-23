import { Worker } from "bullmq"
import { GYM } from "../modules/gym/gym.model";
import { User } from "../modules/user/user.models";
import { MatReminderTemplate } from "../modules/reminder_template/reminder.model";
import { IUser } from "../modules/user/user.interface";
import { INotification } from "../modules/notification/notification.inerface";
import { sendMultipleNotification } from "../modules/notification/notification.utils";
import { gymService } from "../modules/gym/gym.service";
import { connectionInfo } from "../config/redis";
import { notificationQueue } from "../queues/notification.queue";
import { notificationJobs } from "./notification.worker";

new Worker("mat-reminder", async job => {

    const { gymId, matId } = job.data;

    const gym = await GYM.findById(gymId);

    if (!gym || !gym?.location?.coordinates) return;

    // finding users nearest this gym
    const nearUsersAtGym: IUser[] = await User.aggregate([
        {
            $geoNear: {
                near: {
                    type: "Point",
                    coordinates: gym?.location?.coordinates as [number, number],
                },
                distanceField: "distance",
                maxDistance: 30 * 1609.34, // 30 mile
                spherical: true,
                distanceMultiplier: 0.000621371192, // for get mile
            }
        },
        {
            $match: {
                isDeleted: false,
                status: 1,

            },
        },
    ]);

    console.log(gym, nearUsersAtGym, "gym and users");

    const mat = gym.mat_schedules.find(mat => mat?._id?.toString() == matId);

    if (!mat) return;

    // finding message template
    const msgTemplate = await MatReminderTemplate.findOne({ name: "template" });
    if (!msgTemplate) return;

    // fomat the message send to user
    const formatMessage = (msgTemplate: string) => {
        const realTemplate = msgTemplate
            // .replace("{{UserFirstName}}", patientfullname)
            // .replace("{{UserFullName}}", patient?.patient?.f_name!)
            .replace("{{GymName}}", gym?.name)
            .replace("{{GymAddress}}", gym?.street || "N/A")
            .replace("{{GymState}}", gym?.state || "N/A")
            .replace("{{GymCity}}", gym?.city || "N/A")
            .replace("{{GymZipCode}}", gym?.zip_code || "N/A")
            .replace("{{MatDay}}", mat?.day || "N/A")
            // .replace("{{MatStartDate}}", mat?.)
            .replace("{{MatStartTime}}", mat?.from_view || "N/A")
            .replace("{{MatEndTime}}", mat?.to_view || "N/A")

        return realTemplate;
    }

    let fcmTokens: string[] = [];
    let notifications: INotification[] = [];

    for (let user of nearUsersAtGym) {
        if (user?.fcmToken && user?.fcmToken !== null) {
            fcmTokens.push(user?.fcmToken);
        }
        notifications.push({
            title: formatMessage(msgTemplate?.title),
            message: formatMessage(msgTemplate?.message),
            receiver: user?._id,
            receiverEmail: user?.email,
            receiverRole: user?.role,
            sender: user?._id,
        });
    }

    // send notification
    await sendMultipleNotification(
        fcmTokens,
        notifications,
        { title: formatMessage(msgTemplate?.title), message: formatMessage(msgTemplate?.message) }
    );

    //schedule NEXT WEEK automatically
    await gymService.scheduleMatReminder(
        gymId,
        mat,
        120, // 2 hour,
        true
    );

}, { connection: connectionInfo })
    .on("failed", async (job, err) => {

        if (!job) return;

        if (job.attemptsMade >= 3) {
            console.log(`------mat reminder failed after ${3} attempts ❌------`, err.message);

            const { gymId, matId } = job.data;

            try {
                const gym = await GYM.findById(gymId);
                if (!gym || !gym?.location?.coordinates) return;
                const mat = gym.mat_schedules.find(mat => mat?._id?.toString() == matId);

                if (!mat) return;
                await gymService.scheduleMatReminder(
                    gymId,
                    mat,
                    120, // 2 hour,
                    true
                );

            } catch (err: any) {

                await notificationQueue.add(
                    notificationJobs.adminNotification,
                    {
                        title: "Gym Mat Reminder Generation Failed",
                        message: "Failed to generate the next day's gym mat reminder. Please update the gym details and try again.",
                    },
                    {
                        removeOnComplete: true,
                        attempts: 3,
                        backoff: {
                            type: "exponential",
                            delay: 2000, // 2s → 4s → 8s
                        },
                    }
                );

                console.log("reminder generate failed for next week");
            }

        }

    })