
import { Router } from "express";
import auth from "../../middleware/auth";
import { USER_ROLE } from "../user/user.constants";
import { dashboardControler } from "./dashboard.controler";

const router = Router();

router.get('/userChart', auth(USER_ROLE.admin, USER_ROLE.staff),  dashboardControler.userChart);

router.get('/earningChart', auth(USER_ROLE.admin, USER_ROLE.staff),  dashboardControler.earningChart);

router.get('/stats', auth(USER_ROLE.admin, USER_ROLE.staff), dashboardControler.countData);

export const dashboardRouts = router