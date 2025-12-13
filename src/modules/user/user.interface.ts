import { Types } from 'mongoose';

export interface ICompetitionResult {
  event_name: string,
  event_date: Date,
  division: "Gi" | "NoGi" | "Gi Absolute" | "NoGi Absolute",
  state: string,
  city: string,
  result: "Gold" | "Silver" | "Bronze" | "DNP"
}

export interface IUser {
  _id: Types.ObjectId;
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
  belt_rank: "Purple" | "Blue" | "Brown" | "Black"
  height: {
    amount: number,
    category: string | null
  },
  weight: string,
  disciplines: string[],
  favourite_quote: string
  home_gym: string
  notification: boolean,
  isSocialLogin: boolean
  isDeleted: boolean,

  location : {type : string, coordinates : [number, number]},

  fcmToken : string
}

