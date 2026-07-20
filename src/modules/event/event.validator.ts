import { body, check } from "express-validator";

export const newEventAddValidator = [
    check("type").optional(),
    // .isIn(["AGF", "IBJJF", "NAGA", "ADCC", "Local"])
    // .withMessage('Invalid type'),

    check("name").trim().notEmpty()
        .withMessage('Event name is required.'),

    check("street").trim().notEmpty()
        .withMessage('Street address is required.'),

    check("venue").optional(),

    check('date').trim().optional().isISO8601().toDate().withMessage('Invalid date format.'),
    check('startDate').trim().optional().isISO8601().toDate().withMessage('Invalid date format.'),

    // body("event_website").trim().notEmpty()
    //     .withMessage('event_website is required'),

    check("registration_fee").trim().notEmpty()
        .withMessage('Registration fee is required.')
        .isInt().withMessage("Registration fee must be a number."),

    check("location.coordinates")
        .exists().withMessage("Location coordinates are required.")
        .isArray({ min: 2, max: 2 }).withMessage("Location coordinates must be an array containing 2 numbers [longitude, latitude]."),

    // validate each item in the coordinates array is a float
    check("location.coordinates.*")
        .isFloat().withMessage("Each coordinate must be a number."),

]

export const updateEventValidator = [
    // body("type").optional()
    //     .isIn(["AGF", "IBJJF", "NAGA", "ADCC", "Local"])
    //     .withMessage('Invalid type'),

    body('date').trim().optional().isISO8601().toDate().withMessage('Invalid date format.'),

    body("registration_fee").trim().optional()
        .isInt().withMessage("Registration fee must be a number."),

]