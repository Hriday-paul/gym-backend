import { Schema, model, Model } from 'mongoose';
import { IUser } from './user.interface';


export interface UserModel extends Model<IUser> { }

// Mongoose schema definition
const userSchema: Schema<IUser> = new Schema(
  {
    first_name: {
      type: String,
      required: true
    },
    last_name: {
      type: String,
      required: false
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
    address: {
      type: String,
      required: false,
    },
    date_of_birth: {
      type: String,
      required: false,
    },
    bio: {
      type: String,
      required: false,
    },
    password: {
      type: String,
      required: true
    },
    image: {
      type: String,
      default: '',
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
    isOnline: {
      type: Boolean,
      default: false,
    },
    fcmToken: {
      type: String,
      required: false,
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
  {
    timestamps: true,
    _id: true
  },
);



// User model creation
export const User = model<IUser, UserModel>('users', userSchema);
