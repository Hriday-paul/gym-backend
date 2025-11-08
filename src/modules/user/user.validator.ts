import { check, param } from "express-validator";

export const statusUpdateValidator = [
    check('status').trim().not().isEmpty().withMessage('status is required').isBoolean().withMessage("status must be boolean"),
]

// event_name: string,
//   event_date: Date,
//   division: "Gi" | "NoGi" | "Gi Absolute" | "NoGi Absolute",
//   state: string,
//   city: string,
//   result: "Gold" | "Silver" | "Bronze" | "DNP"

export const competitionAddValidator = [
    check('event_name').trim().not().isEmpty().withMessage('event_name is required'),
    check('event_date').trim().not().isEmpty().withMessage('event_date is required').isISO8601().toDate().withMessage('Invalid date format'),
    check('division').trim().not().isEmpty().withMessage('division is required').isIn(["Gi", "NoGi", "Gi Absolute", "NoGi Absolute"]).withMessage("division type invalid"),
    check('result').trim().not().isEmpty().withMessage('result is required').isIn(["Gold", "Silver", "Bronze", "DNP"]).withMessage("result type invalid"),
    check('state').trim().not().isEmpty().withMessage('state is required'),
    check('city').trim().not().isEmpty().withMessage('city is required'),
]

export const updateprofileValidate = [
    check("location").optional().isObject().withMessage("location must be an object"),

    // coordinates must be an array of exactly 2 items
    check("location.coordinates")
        .if(check("location").exists())
        .isArray({ min: 2, max: 2 }).withMessage("location.coordinates should be provide"),

    // validate each item in the coordinates array is a float
    check("location.coordinates.*")
        .isFloat().withMessage("each coordinate must be a number"),
]
