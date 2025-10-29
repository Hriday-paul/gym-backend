import { check } from 'express-validator';

export const createAccountValidator = [
    check('first_name').trim().not().isEmpty().withMessage('First name is required').isString().withMessage('First name should be string').isLength({ min: 1 }).withMessage('First name min length is 1'),
    check('last_name').trim().optional().isString().withMessage('Last name should be string'),
    check('email').trim().not().isEmpty().withMessage('Email is required').isEmail().normalizeEmail({ all_lowercase: true }).withMessage('Invalid Email'),
    check('contact').optional().trim().isMobilePhone('any').withMessage('Invalid phone number'), //
    check('address').optional().trim().isString(),
    check('bio').optional().trim().isString(),
    check('password').trim().not().isEmpty().withMessage('password is required').isString(),
    check('date_of_birth').optional().trim().isString().withMessage('invalid date of birth'),
]

export const loginAccountValidator = [
    check('email').trim().not().isEmpty().withMessage('Email is required').isEmail().normalizeEmail({ all_lowercase: true }).withMessage('Invalid Email'),
    check('password').trim().not().isEmpty().withMessage('password is required').isString(),
]

export const social_loginAccountValidator = [
    check('email').trim().not().isEmpty().withMessage('Email is required').isEmail().normalizeEmail({ all_lowercase: true }).withMessage('Invalid Email'),
    check('image').trim().not().isEmpty().withMessage('image is required').isString(),
    check('first_name').trim().not().isEmpty().withMessage('first_name is required').isString(),
]

export const refreshTokenValidator = [
    check('refreshToken').trim().not().isEmpty().withMessage('refreshToken is required').isString(),
]

export const forgotPasswordValidator = [
    check('email').trim().not().isEmpty().withMessage('Email is required').isEmail().normalizeEmail({ all_lowercase: true }).withMessage('Invalid Email'),
]

export const resetPasswordValidator = [
    check('newPassword').trim().not().isEmpty().withMessage('newPassword is required'),
    check('confirmPassword').trim().not().isEmpty().withMessage('confirmPassword is required'),
]

export const changePasswordValidator = [
    check('oldPassword').trim().not().isEmpty().withMessage('oldPassword is required').isString(),
    check('newPassword').trim().not().isEmpty().withMessage('newPassword is required').isString(),
    check('confirmPassword').trim().not().isEmpty().withMessage('confirmPassword is required').isString(),
]