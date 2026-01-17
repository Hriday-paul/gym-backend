import { check } from 'express-validator';

export const createAccountValidator = [
    check('first_name').trim().not().isEmpty().withMessage('First Name is required!').isString().isLength({ min: 2 }).withMessage('First name must be at least 2 letters long.'),
    check('email').trim().not().isEmpty().withMessage('Email address required!').isEmail().normalizeEmail({ all_lowercase: true }).withMessage('Invalid email address!'),
    check('contact').optional().trim().isMobilePhone('any').withMessage('Invalid contact number'), //.isMobilePhone('any').withMessage('Invalid contact number')

    check('password').trim().not().isEmpty().withMessage('password is required').isString(),
]

export const loginAccountValidator = [
    check('email').trim().not().isEmpty().withMessage('Email address required!').isEmail().normalizeEmail({ all_lowercase: true }).withMessage('Invalid email address!'),
    check('password').trim().not().isEmpty().withMessage('password is required').isString(),
]

export const social_loginAccountValidator = [
    check('email').trim().not().isEmpty().withMessage('Email address required!').isEmail().normalizeEmail({ all_lowercase: true }).withMessage('Invalid email address!'),
    // check('image').trim().not().isEmpty().withMessage('image is required').isString(),
    check('first_name').trim().not().isEmpty().withMessage('first_name is required').isString(),
]

export const refreshTokenValidator = [
    check('refreshToken').trim().not().isEmpty().withMessage('refreshToken is required').isString(),
]

export const forgotPasswordValidator = [
    check('email').trim().not().isEmpty().withMessage('Email address required!').isEmail().normalizeEmail({ all_lowercase: true }).withMessage('Invalid email address!'),
]

export const resetPasswordValidator = [
    check('newPassword').trim().not().isEmpty().withMessage('New password required!'),
    check('confirmPassword').trim().not().isEmpty().withMessage('Please confirm password!'),
]

export const changePasswordValidator = [
    check('oldPassword').trim().not().isEmpty().withMessage('Old password is required!').isString(),
    check('newPassword').trim().not().isEmpty().withMessage('New password required!').isString(),
    check('confirmPassword').trim().not().isEmpty().withMessage('Please confirm password!').isString(),
]