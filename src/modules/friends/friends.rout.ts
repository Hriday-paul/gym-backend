import { Router } from "express";
import auth from "../../middleware/auth";
import { USER_ROLE } from "../user/user.constants";
import { friendControler } from "./friends.controler";
import { AddFolowValidator } from "./friends.validator";
import req_validator from "../../middleware/req_validation";

const router = Router();

router.get("/", auth(USER_ROLE.user), friendControler.MyFriends)
router.post("/", AddFolowValidator, req_validator(), auth(USER_ROLE.user), friendControler.FolowFriend)
router.post("/unfolow/:id", auth(USER_ROLE.user), friendControler.UnFolowFriend)

export const friendRouts = router;