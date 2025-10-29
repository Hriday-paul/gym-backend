import { Router } from "express";
import auth from "../../middleware/auth";
import { USER_ROLE } from "./user.constants";
import { userController } from "./user.controller";
import { statusUpdateValidator } from "./user.validator";
import req_validator from "../../middleware/req_validation";
import { image_Upload } from "../../utils/s3";
import parseData from "../../middleware/parseData";

const router = Router();

router.get(
    '/',
    auth(USER_ROLE.admin),
    userController.all_users,
);

router.patch(
    '/update-my-profile',
    auth(USER_ROLE.admin, USER_ROLE.user),
    image_Upload.single('image'),
    parseData(),
    userController.updateProfile,
);

router.patch(
    '/status/:id',
    statusUpdateValidator,
    req_validator(),
    auth(USER_ROLE.admin),
    userController.update_user_status,
);

router.get(
    '/my-profile',
    auth(USER_ROLE.admin, USER_ROLE.user),
    userController.getMyProfile,
);

router.get(
    '/:id',
    auth(USER_ROLE.admin, USER_ROLE.user),
    userController.userDetails,
);

router.delete(
    '/delete-account',
    auth(USER_ROLE.user),
    userController.deletemyAccount,
);

router.delete(
    '/delete-account/:id',
    auth(USER_ROLE.admin),
    userController.deleteUser,
);

export const userRoutes = router;