import { ObjectId, Types } from 'mongoose';

export interface IUser {
  _id: ObjectId;
  status: number; // 1 or 0
  first_name: string;
  last_name: string;
  email: string;
  contact: string;
  password: string;
  image: string;
  isverified: boolean
  role: "user" | "admin";
  verification: {
    otp: string | number;
    expiresAt: Date;
    status: boolean;
  };
  isDeleted: boolean,
  address: string,
  date_of_birth: string,
  bio: string,
  location : {type : string, coordinates : number[]}

  isOnline: boolean;
  fcmToken?: string;
  notification : boolean,
  isSocialLogin : boolean
}

