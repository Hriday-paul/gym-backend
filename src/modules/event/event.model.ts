import { model, Schema } from 'mongoose';
import { IEvent } from './event.interface';

const EventSchema: Schema<IEvent> = new Schema(
    {
        type: { type: String, required: true },
        name: { type: String, required: true },
        venue: { type: String, required: true },
        state: { type: String },
        city: { type: String },
        date: { type: Date, required: true },
        duration: { type: String },
        registration_fee: { type: Number, default: 0 },
        event_website: { type: String },
        user: { type: Schema.Types.ObjectId, ref: "users", required: true },
        gym: { type: Schema.Types.ObjectId, ref: "gyms" },
        image: {
            type: {
                key: {
                    type: String,
                    required: true,
                },
                url: { type: String, required: true },
            },
            required: true
        },
    },
    { timestamps: true },
);

export const Event = model<IEvent>('events', EventSchema);
