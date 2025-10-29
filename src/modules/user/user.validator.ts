import { check, param } from "express-validator";

export const statusUpdateValidator = [
    check('status').trim().escape().not().isEmpty().withMessage('status is required').isBoolean().withMessage("status must be boolean"),
]