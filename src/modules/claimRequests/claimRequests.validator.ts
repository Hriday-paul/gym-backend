import { body } from "express-validator";

export const addClaimReqValidator = [
    body('email')
        .trim()
        .not()
        .isEmpty()
        .withMessage('Email address is required.')
        .isEmail()
        .normalizeEmail({ all_lowercase: true })
        .withMessage('A valid email address is required.'),

    body('phone')
        .optional()
        .trim()
        .isMobilePhone('any')
        .withMessage('Invalid phone number.'), //.isMobilePhone('any').withMessage('Invalid contact number')

    body('gym')
        .trim()
        .not()
        .isEmpty()
        .withMessage('Gym ID is required.')
        .isMongoId()
        .withMessage('Invalid gym ID.')
]