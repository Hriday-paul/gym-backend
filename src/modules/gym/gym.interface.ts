import { ObjectId } from "mongoose";

export interface ISchedule { day: string, from: number, from_view : string, to: number, to_view : string }
export interface IClsSchedule { name : string, day: string, from: number, from_view : string, to: number, to_view : string }

export interface IGym {
    images: { key: string; url: string }[],
    name: string,
    description: string,
    street: string,
    state: string,
    city: string,
    zip_code: string,
    phone: string,
    email: string,
    website: string,
    facebook: string,
    instagram: string,
    mat_schedules: ISchedule[],
    class_schedules: IClsSchedule[],
    disciplines: string[],

    isClaimed: boolean,

    user: ObjectId,

    location: { type: string, coordinates: number[] },

    status : "approved" | "rejected" | "pending"
}