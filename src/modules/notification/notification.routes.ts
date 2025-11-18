import { Router } from "express";
import { notificationController } from "./notification.controller";
import auth from "../../middleware/auth";
import { USER_ROLE } from "../user/user.constants";

const router = Router();

router.get(
  "/",
  auth(USER_ROLE.user, USER_ROLE.admin),
  notificationController.getAllNotification
);

router.put(
  "/make-read/:id",
  auth(USER_ROLE.admin, USER_ROLE.user),
  notificationController.makeRead
);
router.get(
  "/unread-count",
  auth(USER_ROLE.admin, USER_ROLE.user),
  notificationController.notificationUnReadCount
);

router.put(
  "/make-read-all",
  auth(USER_ROLE.admin, USER_ROLE.user),
  notificationController.makeReadAll
);

router.delete(
  "/all",
  auth(USER_ROLE.user, USER_ROLE.admin),
  notificationController.dltAllNotification
);
router.delete(
  "/:id",
  auth(USER_ROLE.user, USER_ROLE.admin),
  notificationController.deleteNotification
);

export const notificationRoute = router;
