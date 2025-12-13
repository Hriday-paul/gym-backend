import mongoose, { Schema, model, Model, Types } from 'mongoose';
import { ICompetitionResult } from './competition.interface';

const CompetitionSchema : Schema<ICompetitionResult> = new Schema({
  event_name: { type: String, required: true },
  event_date: { type: Date, required: true },
  division: { type: String, required: true, enum: ["Gi", "NoGi", "Gi Absolute", "NoGi Absolute"] },
  city: { type: String, required: true },
  state: { type: String, required: true },
  result: { type: String, required: true, enum: ["Gold", "Silver", "Bronze", "DNP"] },
  user: {
            type: Schema.Types.ObjectId,
            ref: "users",
            required: true,
        },
}, {timestamps : true});

export const Competition = model<ICompetitionResult>('competitions', CompetitionSchema);