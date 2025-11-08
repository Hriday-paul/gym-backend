import { ObjectId } from "mongoose";

export interface IEvent {
    type : string,
    name : string,
    venue : string,
    state : string,
    city : string,
    date : Date,
    duration ?: string,
    registration_fee : number,
    event_website : string,
    image: { key: string; url: string },

    user : ObjectId
    gym : ObjectId
}