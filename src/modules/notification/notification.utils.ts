import admin from "firebase-admin";
import httpStatus from "http-status";
import AppError from "../../error/AppError";
import { INotification } from "./notification.inerface";
import Notification from "./notification.model";

// Initialize Firebase Admin SDK only if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert("./firebase.json"),
  });
}

export const sendNotification = async (
  fcmToken: string[],
  payload: INotification
): Promise<unknown> => {

  if (fcmToken.length > 0) {
    const response = await admin.messaging().sendEachForMulticast({
      tokens: fcmToken,
      notification: {
        title: payload.title,
        body: payload.message,
      },
      android: {
        notification: {
          icon: "https://server.thejiujitsuapp.com/logo.png",
          imageUrl: "https://server.thejiujitsuapp.com/logo.png",
          clickAction: 'notification'
        }
      },
      apns: {
        headers: {
          "apns-push-type": "alert",
        },
        fcmOptions: {
          imageUrl: 'https://server.thejiujitsuapp.com/logo.png'
        },
        payload: {
          aps: {
            badge: 1,
            sound: "default",
          },
        },
      },
      webpush: {
        headers: {
          image: 'https://server.thejiujitsuapp.com/logo.png'
        }
      },
    });

    if (response?.failureCount > 0) {
      response.responses.forEach((res, index) => {
        if (!res.success) {
          console.error(`FCM error for token at index ${index}: ${JSON.stringify(res.error)}`
          );
        }
      })
    }

    // only throw if ALL tokens failed
    if (response?.successCount === 0) {
      throw new AppError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "Push notification failed"
      );
    }

  }

  // creating a notification data to db after push notification send
  await Notification.create({
    sender: payload?.sender,
    receiver: payload?.receiver,
    receiverEmail: payload?.receiverEmail,
    receiverRole: payload?.receiverRole,
    title: payload.title,
    link: payload?.link || null,
    message: payload?.message,
    type: payload?.type,
  })

  // Log any individual token failures

  return {};
};

export const sendMultipleNotification = async (
  fcmToken: string[],
  payload: INotification[],
  { title, message }: { title: string, message: string }
): Promise<unknown> => {

  if (fcmToken.length <= 0) {
    return;
  }

  const response = await admin.messaging().sendEachForMulticast({
    tokens: fcmToken,
    notification: {
      title: title,
      body: message,
    },
    android: {
      notification: {
        icon: "https://server.thejiujitsuapp.com/logo.png",
        imageUrl: "https://server.thejiujitsuapp.com/logo.png",
        clickAction: 'notification'
      }
    },
    apns: {
      headers: {
        "apns-push-type": "alert",
      },
      fcmOptions: {
        imageUrl: 'https://server.thejiujitsuapp.com/logo.png'
      },
      payload: {
        aps: {
          badge: 1,
          sound: "default",
        },
      },
    },
    webpush: {
      headers: {
        image: 'https://server.thejiujitsuapp.com/logo.png'
      }
    },
  });

  // Log any individual token failures
  if (response?.failureCount > 0) {
    response.responses.forEach((res, index) => {
      if (!res.success) {
        console.error(`FCM error for token at index ${index}: ${JSON.stringify(res.error)}`
        );
      }
    });
  }

  if (response?.successCount === 0) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Push notification failed for all tokens"
    );
  }

  // save notification to db
  if (payload?.length > 0) {
    await Notification.insertMany(payload);
  }

  return response;

};