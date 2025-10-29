import { Router } from "express";
import { authController } from "./auth.controller";
import { changePasswordValidator, createAccountValidator, forgotPasswordValidator, loginAccountValidator, refreshTokenValidator, resetPasswordValidator, social_loginAccountValidator } from "./auth.validator";
import req_validator from "../../middleware/req_validation";
import { otpResendValidator, otpVerifyValidator } from "../otp/otp.validation";
import { otpControllers } from "../otp/otp.controller";
import auth from "../../middleware/auth";
import { USER_ROLE } from "../user/user.constants";

const router = Router();

router.post('/create',
    createAccountValidator,
    req_validator(),
    authController.createUser
)

router.post('/login',
    loginAccountValidator,
    req_validator(),
    authController.loginUser
)

router.post('/social-login',
    social_loginAccountValidator,
    req_validator(),
    authController.socialLogin
)

router.post('/admin/login',
    loginAccountValidator,
    req_validator(),
    authController.adminLogin
)

router.patch(
    '/change-password',
    changePasswordValidator,
    req_validator(),
    auth(USER_ROLE.admin, USER_ROLE.user),
    authController.changePassword,
);

router.post('/refresh',
    refreshTokenValidator,
    req_validator(),
    authController.refreshToken
)

router.post(
    '/verify-otp',
    otpVerifyValidator,
    req_validator(),
    otpControllers.verifyOtp,
);

router.post(
    '/resend-otp',
    otpResendValidator,
    req_validator(),
    otpControllers.resendOtp,
);

router.post('/forgot-password', forgotPasswordValidator, req_validator(), authController.forgotPassword);
router.patch('/reset-password', resetPasswordValidator, req_validator(), authController.resetPassword);

export const authRouts = router