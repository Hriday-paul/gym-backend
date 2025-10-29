/* eslint-disable @typescript-eslint/no-explicit-any */
import QueryBuilder from "../../builder/QueryBuilder";
import { INotification } from "./notification.inerface";
import Notification from "./notification.model";

const getNotificationFromDb = async (query: Record<string, any>) => {

  const notificationModel = new QueryBuilder(Notification.find().populate('product'), query).sort().filter();
      const data: any = await notificationModel.modelQuery;
      const meta = await notificationModel.countTotal();
      return {
          data,
          meta,
      };
};

const updateNotification = async (
  id: string,
  payload: Partial<INotification>
) => {
  const result = await Notification.findByIdAndUpdate(id, payload, {
    new: true,
  });
  return result;
};

const makeMeRead = async (id: string, user: string) => {
  const result = await Notification.findOneAndUpdate(
    { _id: id, receiver: user },
    { isRead: true },
    {
      new: true,
    }
  );
  return result;
};

const makeReadAll = async (user: string) => {
  const result = await Notification.updateMany(
    { receiver: user },
    { isRead: true },
    {
      new: true,
    }
  );
  return result;
};

export const notificationServices = {
  getNotificationFromDb,
  updateNotification,
  makeMeRead,
  makeReadAll
};
