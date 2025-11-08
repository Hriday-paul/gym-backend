import { model, Schema } from 'mongoose';
import { IClaimReq } from './claimRequests.interface';

const ClaimSchema: Schema<IClaimReq> = new Schema(
    {

        email: { type: String, required: true },
        phone: { type: String, required: true },
        gym: { type: Schema.Types.ObjectId, ref: "gyms", required: true },
        user: { type: Schema.Types.ObjectId, ref: "users", required: true },
        status: { enum: ["approved", "rejected", "pending"], type: String, default: "pending" },
        business_license: {
            type: {
                key: {
                    type: String,
                    required: true,
                },
                url: { type: String, required: true },
            },
            required: true
        },
        utility_bill: {
            type: {
                key: {
                    type: String,
                    required: true,
                },
                url: { type: String, required: true },
            },
            required: true
        },
        tax_document: {
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

export const ClaimReq = model<IClaimReq>('claimReqs', ClaimSchema);
