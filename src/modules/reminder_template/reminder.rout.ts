import { Router } from "express";
import auth from "../../middleware/auth";
import { USER_ROLE } from "../user/user.constants";
import { reminderTemplateControler } from "./reminder.controler";
import { updateReminderTempValidator } from "./reminder.validator";
import req_validator from "../../middleware/req_validation";

const router = Router();

router.get("/", auth(USER_ROLE.admin, USER_ROLE.staff), reminderTemplateControler.getReminderTemplate);

router.patch("/",
    updateReminderTempValidator,
    req_validator(),
    auth(USER_ROLE.admin, USER_ROLE.staff),
    reminderTemplateControler.updateReminderTemplate);

export const reminderTempRouts = router;