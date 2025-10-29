import { model, Model, Schema } from 'mongoose';
import { ISettings } from './settings.interface';

export interface settingsModel extends Model<ISettings> { }

const SettingsSchema: Schema<ISettings> = new Schema(
    {
        key: {
            type: String,
            required: true,
            enum: ["terms", "privacy", "about"],
        },
        value: { type: String, required: true },
    },
    { timestamps: true },
);

export const Setting = model<ISettings, settingsModel>('settings', SettingsSchema);