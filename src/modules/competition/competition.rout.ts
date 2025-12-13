import { Router } from "express";
import auth from "../../middleware/auth";
import { USER_ROLE } from "../user/user.constants";
import { competitionAddValidator } from "../user/user.validator";
import req_validator from "../../middleware/req_validation";
import { competitionControler } from "./competition.controler";

const router = Router();

router.post(
    '/',
    auth(USER_ROLE.user),
    competitionAddValidator,
    req_validator(),
    competitionControler.AddRecentCompetition
);
router.delete(
    '/:id',
    auth(USER_ROLE.user),
    competitionControler.DeleteRecentCompetition
);
router.get(
    '/',
    auth(USER_ROLE.user),
    competitionControler.MyRecentCompetitions
);

export const competitionRouts = router;