import { ObjectId } from "mongoose";

export interface IClaimReq{
    user : ObjectId
    gym : ObjectId
    email : string,
    phone : string
    utility_bill : { key: string; url: string },
    business_license : { key: string; url: string },
    tax_document : { key: string; url: string },
    status : "approved" | "rejected" | "pending"
}