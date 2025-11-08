import { NextFunction, Response, Request, Router } from "express";
import auth from "../../middleware/auth";
import { USER_ROLE } from "../user/user.constants";
import req_validator from "../../middleware/req_validation";
import { eventControler } from "./event.controler";
import { newEventAddValidator, updateEventValidator } from "./event.validator";
import { image_Upload } from "../../utils/s3";
import parseData from "../../middleware/parseData";

const router = Router();

router.get("/", eventControler.allEvents)

router.post("/",
    auth(USER_ROLE.user, USER_ROLE.admin),
    image_Upload.single('image'),
    parseData(),
    newEventAddValidator,
    req_validator(),
    eventControler.addEvent);

router.patch("/:id",
    auth(USER_ROLE.user, USER_ROLE.admin),
    image_Upload.single('image'),
    parseData(),
    updateEventValidator,
    req_validator(),
    eventControler.updateEvent);

router.get("/my-events", auth(USER_ROLE.user, USER_ROLE.admin), eventControler.myEvents);
router.delete("/:id", auth(USER_ROLE.user, USER_ROLE.admin), eventControler.deleteEvent);

export const eventRouts = router;