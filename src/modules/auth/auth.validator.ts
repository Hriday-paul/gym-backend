import { check } from 'express-validator';

export const createAccountValidator = [
    check('first_name')
        .trim()
        .not()
        .isEmpty()
        .withMessage('First name is required.')
        .isString()
        .isLength({ min: 2 })
        .withMessage('First name must be at least 2 characters long.'),

    check('email')
        .trim()
        .not()
        .isEmpty()
        .withMessage('Email address is required.')
        .isEmail()
        .normalizeEmail({ all_lowercase: true })
        .withMessage('Invalid email address.'),

    check('contact')
        .optional()
        .trim()
        .isMobilePhone('any')
        .withMessage('Invalid contact number.'),

    check('password')
        .trim()
        .not()
        .isEmpty()
        .withMessage('Password is required.')
        .isString(),
];

export const loginAccountValidator = [
    check('email')
        .trim()
        .not()
        .isEmpty()
        .withMessage('Email address is required.')
        .isEmail()
        .normalizeEmail({ all_lowercase: true })
        .withMessage('Invalid email address.'),

    check('password')
        .trim()
        .not()
        .isEmpty()
        .withMessage('Password is required.')
        .isString(),
];

export const social_loginAccountValidator = [
    check('email')
        .trim()
        .not()
        .isEmpty()
        .withMessage('Email address is required.')
        .isEmail()
        .normalizeEmail({ all_lowercase: true })
        .withMessage('Invalid email address.'),

    // check('image').trim().not().isEmpty().withMessage('image is required').isString(),

    check('first_name')
        .trim()
        .not()
        .isEmpty()
        .withMessage('First name is required.')
        .isString(),
];

export const refreshTokenValidator = [
    check('refreshToken')
        .trim()
        .not()
        .isEmpty()
        .withMessage('Refresh token is required.')
        .isString(),
];

export const forgotPasswordValidator = [
    check('email')
        .trim()
        .not()
        .isEmpty()
        .withMessage('Email address is required.')
        .isEmail()
        .normalizeEmail({ all_lowercase: true })
        .withMessage('Invalid email address.'),
];

export const resetPasswordValidator = [
    check('newPassword')
        .trim()
        .not()
        .isEmpty()
        .withMessage('New password is required.'),

    check('confirmPassword')
        .trim()
        .not()
        .isEmpty()
        .withMessage('Please confirm your password.'),
];

export const changePasswordValidator = [
    check('oldPassword')
        .trim()
        .not()
        .isEmpty()
        .withMessage('Current password is required.')
        .isString(),

    check('newPassword')
        .trim()
        .not()
        .isEmpty()
        .withMessage('New password is required.')
        .isString(),

    check('confirmPassword')
        .trim()
        .not()
        .isEmpty()
        .withMessage('Please confirm your password.')
        .isString(),
];