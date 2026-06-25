
import { body } from "express-validator";

export const newEventAddValidator = [
    body("type").optional(),
        // .isIn(["AGF", "IBJJF", "NAGA", "ADCC", "Local"])
        // .withMessage('Invalid type'),

    body("name").trim().notEmpty()
        .withMessage('Event name is required!'),

    body("venue").optional(),

    body('date').trim().optional().isISO8601().toDate().withMessage('Invalid date format'),

    // body("event_website").trim().notEmpty()
    //     .withMessage('event_website is required'),

    body("registration_fee").trim().notEmpty()
        .withMessage('Registration fee is required!')
        .isInt().withMessage("Registration fee should be number!"),

]

export const updateEventValidator = [
    // body("type").optional()
    //     .isIn(["AGF", "IBJJF", "NAGA", "ADCC", "Local"])
    //     .withMessage('Invalid type'),

    body('date').trim().optional().isISO8601().toDate().withMessage('Invalid date format'),

    body("registration_fee").trim().optional()
        .isInt().withMessage("registration_fee should be number"),

]