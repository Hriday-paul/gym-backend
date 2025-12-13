import mongoose, { Schema, model, Model, Types } from 'mongoose';
import { ICompetitionResult, IUser } from './user.interface';

export interface UserModel extends Model<IUser> { }

const HeightSchema = new Schema<{ amount: number, category: string }>({
  category: { type: String, default: null },
  amount: { type: Number, default: 0 }
});

const CompetitionSchema = new Schema<ICompetitionResult>({
  event_name: { type: String, required: true },
  event_date: { type: Date, required: true },
  division: { type: String, required: true, enum: ["Gi", "NoGi", "Gi Absolute", "NoGi Absolute"] },
  city: { type: String, required: true },
  state: { type: String, required: true },
  result: { type: String, required: true, enum: ["Gold", "Silver", "Bronze", "DNP"] }
});

// Mongoose schema definition
const userSchema: Schema<IUser> = new Schema(
  {
    first_name: {
      type: String,
      required: true
    },
    last_name: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    contact: {
      type: String,
      required: false,
    },
    password: {
      type: String,
      required: true
    },
    image: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      required: true,
      enum: ["user", "admin"],
      default: 'user'
    },
    isverified: {
      type: Boolean,
      default: false
    },
    status: {
      type: Number,
      default: 1,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    verification: {
      otp: {
        type: Schema.Types.Mixed,
        default: 0,
      },
      expiresAt: {
        type: Date,
      },
      status: {
        type: Boolean,
        default: false,
      },
    },
    isSocialLogin: {
      type: Boolean,
      default: false
    },
    notification: {
      type: Boolean,
      required: true,
      default: true
    },

    belt_rank: {
      type: String,
      enum: ["Purple", "Blue", "Brown", "Black"],
      default: null
    },

    home_gym: {
      type: String,
      default: null
    },

    height: {
      type: HeightSchema,
      default: {
        amount: 0,
        category: null
      }
    },

    weight: {
      type: String,
      default: "0"
    },

    disciplines: {
      type: [String]
    },
    favourite_quote: {
      type: String,
      default: null
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

     fcmToken: {
      type: String,
      required: false,
    },

  },
  {
    timestamps: true,
    _id: true
  },
);


userSchema.index({ location: '2dsphere' });
// User model creation
export const User = model<IUser, UserModel>('users', userSchema);
