import { model, Schema } from "mongoose";
import { IClsSchedule, IGym, ISchedule } from "./gym.interface";

const ScheduleSchema = new Schema<ISchedule>({
    day: { type: String, required: true, enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] },
    from: { type: Number, required: true },
    from_view: { type: String, required: true },
    to: { type: Number, required: true },
    to_view: { type: String, required: true },
});

const ClassScheduleSchema = new Schema<IClsSchedule>({
    day: { type: String, required: true, enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] },
    from: { type: Number, required: true },
    from_view: { type: String, required: true },
    to: { type: Number, required: true },
    to_view: { type: String, required: true },
    name : {type : String, default : null}
});

const GymSchema = new Schema<IGym>(
    {
        images: [{
            key: {
                type: String,
                required: true,
            },
            url: { type: String, required: true },
        }],
        name: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
        },
        street: {
            type: String,
            required: true,
        },
        state: {
            type: String,
            required: true,
        },
        city: {
            type: String,
            required: true,
        },
        zip_code: {
            type: String,
            required: true,
        },
        phone: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            trim: true,
        },
        website: {
            type: String,
            default: null,
        },
        facebook: {
            type: String,
            default: null,
        },
        instagram: {
            type: String,
            default: null,
        },
        mat_schedules: [ScheduleSchema],
        class_schedules: [ClassScheduleSchema],
        disciplines: {
            type: [String],
            default: [],
        },
        isClaimed: {
            type: Boolean,
            default: false,
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: "users",
            required: true,
        },
        location: {
            type: {
                type: String,
                enum: ['Point'],
                required: true,
                default: 'Point',
            },
            coordinates: {
                type: [Number], // [longitude, latitude]
                required: true,
            },
        },
    },
    { timestamps: true }
);

GymSchema.index({ location: '2dsphere' });
export const GYM = model<IGym>('gyms', GymSchema);