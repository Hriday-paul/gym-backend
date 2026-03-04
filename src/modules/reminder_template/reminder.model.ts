import { model, Schema } from "mongoose";
import { IMatReminderTemplate } from "./reminder.interface";

const ReminderSchema = new Schema<IMatReminderTemplate>(
    {
        name: {
            type: String,
            required: true,
            default: "template"
        },
        title: {
            type: String,
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        hour: {
            type: Number,
            required: true,
        },
    },
    { timestamps: true }
);

export const MatReminderTemplate = model<IMatReminderTemplate>('matReminderTemplate', ReminderSchema);