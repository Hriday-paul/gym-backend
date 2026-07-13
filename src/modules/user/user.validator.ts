import { check, param } from "express-validator";

export const statusUpdateValidator = [
    check('status')
        .trim()
        .not()
        .isEmpty()
        .withMessage('Status is required.')
        .isBoolean()
        .withMessage('Status must be either true or false.'),
]

// event_name: string,
//   event_date: Date,
//   division: "Gi" | "NoGi" | "Gi Absolute" | "NoGi Absolute",
//   state: string,
//   city: string,
//   result: "Gold" | "Silver" | "Bronze" | "DNP"

export const competitionAddValidator = [
    check('event_name')
        .trim()
        .not()
        .isEmpty()
        .withMessage('Event name is required.'),

    check('event_date')
        .trim()
        .not()
        .isEmpty()
        .withMessage('Event date is required.')
        .isISO8601()
        .toDate()
        .withMessage('Please provide a valid event date.'),

    check('division')
        .trim()
        .not()
        .isEmpty()
        .withMessage('Division is required.')
        .isIn(["Gi", "NoGi", "Gi Absolute", "NoGi Absolute"])
        .withMessage('Please select a valid division.'),

    check('result')
        .trim()
        .not()
        .isEmpty()
        .withMessage('Result is required.')
        .isIn(["Gold", "Silver", "Bronze", "DNP"])
        .withMessage('Please select a valid result.'),

    check('state')
        .trim()
        .not()
        .isEmpty()
        .withMessage('State is required.'),

    check('city')
        .trim()
        .not()
        .isEmpty()
        .withMessage('City is required.'),
]

export const updateprofileValidate = [
    check("location")
        .optional()
        .isObject()
        .withMessage("Location must be a valid object."),

    // coordinates must be an array of exactly 2 items
    check("location.coordinates")
        .if(check("location").exists())
        .isArray({ min: 2, max: 2 })
        .withMessage("Location coordinates must contain exactly two values: [longitude, latitude]."),

    // validate each item in the coordinates array is a float
    check("location.coordinates.*")
        .isFloat()
        .withMessage("Each coordinate must be a valid number."),
]