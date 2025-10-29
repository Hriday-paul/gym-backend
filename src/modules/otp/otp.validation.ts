import { check, header } from "express-validator";

export const otpVerifyValidator = [
    header('token').trim().not().isEmpty().withMessage('token is not found in header').isString(),
    check('otp').trim().not().isEmpty().withMessage('otp token is required').isString()
]

export const otpResendValidator = [
    check('email').trim().not().isEmpty().withMessage('Email is required').isEmail().normalizeEmail({ all_lowercase: true }).withMessage('Invalid Email'),
]