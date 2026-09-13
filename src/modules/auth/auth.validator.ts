import { body, check } from 'express-validator';

export const createAccountValidator = [
    body('first_name')
        .trim()
        .not()
        .isEmpty()
        .withMessage('First name is required.')
        .isString()
        .isLength({ min: 2 })
        .withMessage('First name must be at least 2 characters long.'),

    body('email')
        .trim()
        .not()
        .isEmpty()
        .withMessage('Email address is required.')
        .isEmail()
        .normalizeEmail({ all_lowercase: true })
        .withMessage('Invalid email address.'),

    body('contact')
        .optional()
        .trim()
        .isMobilePhone('any')
        .withMessage('Invalid contact number.'),

    body('password')
        .trim()
        .not()
        .isEmpty()
        .withMessage('Password is required.')
        .isString(),
];

export const loginAccountValidator = [
    body('email')
        .trim()
        .not()
        .isEmpty()
        .withMessage('Email address is required.')
        .isEmail()
        .normalizeEmail({ all_lowercase: true })
        .withMessage('Invalid email address.'),

    body('password')
        .trim()
        .not()
        .isEmpty()
        .withMessage('Password is required.')
        .isString(),
];

export const social_loginAccountValidator = [
    body('email')
        .trim()
        .not()
        .isEmpty()
        .withMessage('Email address is required.')
        .isEmail()
        .normalizeEmail({ all_lowercase: true })
        .withMessage('Invalid email address.'),

    // check('image').trim().not().isEmpty().withMessage('image is required').isString(),

    body('first_name')
        .trim()
        .not()
        .isEmpty()
        .withMessage('First name is required.')
        .isString(),
];

export const refreshTokenValidator = [
    body('refreshToken')
        .trim()
        .not()
        .isEmpty()
        .withMessage('Refresh token is required.')
        .isString(),
];

export const forgotPasswordValidator = [
    body('email')
        .trim()
        .not()
        .isEmpty()
        .withMessage('Email address is required.')
        .isEmail()
        .normalizeEmail({ all_lowercase: true })
        .withMessage('Invalid email address.'),
];

export const resetPasswordValidator = [
    body('newPassword')
        .trim()
        .not()
        .isEmpty()
        .withMessage('New password is required.'),

    body('confirmPassword')
        .trim()
        .not()
        .isEmpty()
        .withMessage('Please confirm your password.'),
];

export const changePasswordValidator = [
    body('oldPassword')
        .trim()
        .not()
        .isEmpty()
        .withMessage('Current password is required.')
        .isString(),

    body('newPassword')
        .trim()
        .not()
        .isEmpty()
        .withMessage('New password is required.')
        .isString(),

    body('confirmPassword')
        .trim()
        .not()
        .isEmpty()
        .withMessage('Please confirm your password.')
        .isString(),
];