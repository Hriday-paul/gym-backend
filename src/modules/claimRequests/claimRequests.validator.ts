import { body } from "express-validator";

// user : ObjectId
//     gym : ObjectId
//     email : string,
//     phone : string
//     utility_bill : { key: string; url: string },
//     business_license : { key: string; url: string },
//     tax_document : { key: string; url: string },

export const addClaimReqValidator = [
    body('email').trim().not().isEmpty().withMessage('Email is required').isEmail().normalizeEmail({ all_lowercase: true }).withMessage('Invalid Email'),

    body('phone').optional().trim().isMobilePhone('any').withMessage('Invalid phone number'), //.isMobilePhone('any').withMessage('Invalid contact number')

    body('gym').trim().not().isEmpty().withMessage('gym is required').isMongoId().withMessage("gym id invalid")
]