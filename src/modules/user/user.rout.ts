import { Router } from "express";
import auth from "../../middleware/auth";
import { USER_ROLE } from "./user.constants";
import parseData from "../../middleware/parseData";
import { userController } from "./user.controller";
import { competitionAddValidator, statusUpdateValidator, updateprofileValidate, } from "./user.validator";
import req_validator from "../../middleware/req_validation";
import { image_Upload } from "../../utils/s3";

const router = Router();


router.get(
    '/',
    auth(USER_ROLE.admin, USER_ROLE.user),
    userController.all_users,
);

router.patch(
    '/update-my-profile',
    auth(USER_ROLE.admin, USER_ROLE.user),
    image_Upload.single('image'),
    parseData(),
    updateprofileValidate,
    req_validator(),
    userController.updateProfile,
);

router.patch(
    '/status/:id',
    statusUpdateValidator,
    req_validator(),
    auth(USER_ROLE.admin),
    userController.update_user_status,
);

router.post(
    '/competition',
    competitionAddValidator,
    req_validator(),
    auth(USER_ROLE.user),
    userController.AddRecentCompetition,
);

router.get(
    '/my-profile',
    auth(USER_ROLE.admin, USER_ROLE.user),
    userController.getMyProfile,
);
router.get(
    '/unfriends',
    auth(USER_ROLE.user),
    userController.getUnfriends,
);

router.get(
    '/:id',
    auth(USER_ROLE.user),
    userController.geUserDetails,
);

router.delete(
    '/delete-account',
    auth(USER_ROLE.user),
    userController.deletemyAccount,
);

export const userRoutes = router;