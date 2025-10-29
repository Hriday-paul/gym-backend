import { model, Schema } from "mongoose";
import { INotification } from "./notification.inerface";

const NotificationSchema = new Schema<INotification>(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: "users",
      default: "",
    },

    receiver: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },

    receiverEmail: {
      type: String,
      default: "",
    },

    receiverRole: {
      type: String,
      enum: ["user", "admin"],
      required: true,
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: "products",
      default : null
    },

    type: {
      type: String,
      default: "text",

    },

    title: {
      type: String,
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    isRead: {
      type: Boolean,
      default: false,
    },

    link: {
      type: String,
      default: null,
    },

    fcmToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Notification = model<INotification>("Notification", NotificationSchema);
export default Notification;
