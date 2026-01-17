
import { body } from "express-validator";

export const newEventAddValidator = [
    body("type").notEmpty()
        .withMessage('Type is required!'),
        // .isIn(["AGF", "IBJJF", "NAGA", "ADCC", "Local"])
        // .withMessage('Invalid type'),

    body("name").trim().notEmpty()
        .withMessage('Event name is required!'),

    body("venue").notEmpty()
        .withMessage('Event venue is required!'),

    body('date').trim().not().isEmpty().withMessage('Event date is required!').isISO8601().toDate().withMessage('Invalid date format'),

    // body("event_website").trim().notEmpty()
    //     .withMessage('event_website is required'),

    body("registration_fee").trim().notEmpty()
        .withMessage('Registration fee is required!')
        .isInt().withMessage("Registration fee should be number!"),

    body('gym').trim().optional().isMongoId().withMessage("Invalid gym"),

]

export const updateEventValidator = [
    // body("type").optional()
    //     .isIn(["AGF", "IBJJF", "NAGA", "ADCC", "Local"])
    //     .withMessage('Invalid type'),

    body('date').trim().optional().isISO8601().toDate().withMessage('Invalid date format'),

    body("registration_fee").trim().optional()
        .isInt().withMessage("registration_fee should be number"),

    body('gym').trim().optional().isMongoId().withMessage("Invalid gym."),

]