
import { body } from "express-validator";

export const newEventAddValidator = [
    body("type").notEmpty()
        .withMessage('type is required'),
        // .isIn(["AGF", "IBJJF", "NAGA", "ADCC", "Local"])
        // .withMessage('Invalid type'),

    body("name").trim().notEmpty()
        .withMessage('event name is required'),

    body("venue").notEmpty()
        .withMessage('event venue is required'),

    body('date').trim().not().isEmpty().withMessage('date is required').isISO8601().toDate().withMessage('Invalid date format'),

    body("event_website").trim().notEmpty()
        .withMessage('event_website is required'),

    body("registration_fee").trim().notEmpty()
        .withMessage('registration_fee is required')
        .isInt().withMessage("registration_fee should be number"),

    body('gym').trim().not().isEmpty().withMessage('gym is required').isMongoId().withMessage("gym invalid"),

]

export const updateEventValidator = [
    // body("type").optional()
    //     .isIn(["AGF", "IBJJF", "NAGA", "ADCC", "Local"])
    //     .withMessage('Invalid type'),

    body('date').trim().optional().isISO8601().toDate().withMessage('Invalid date format'),

    body("registration_fee").trim().optional()
        .isInt().withMessage("registration_fee should be number"),

    body('gym').trim().optional().isMongoId().withMessage("gym invalid"),

]