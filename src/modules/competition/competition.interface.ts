import { ObjectId } from "mongoose";

export interface ICompetitionResult {
  event_name: string,
  event_date: Date,
  division: "Gi" | "NoGi" | "Gi Absolute" | "NoGi Absolute",
  state: string,
  city: string,
  result: "Gold" | "Silver" | "Bronze" | "DNP"
   user: ObjectId,
}