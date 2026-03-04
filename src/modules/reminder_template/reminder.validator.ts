import { check } from "express-validator";

export const updateReminderTempValidator = [
    check('title').trim().not().isEmpty().withMessage('title is required').isString(),
    check('message').trim().not().isEmpty().withMessage('message is required').isString(),
    // check('hour').trim().not().isEmpty().withMessage('hour is required').isFloat().withMessage("Hour should be numeric").toInt(),
]