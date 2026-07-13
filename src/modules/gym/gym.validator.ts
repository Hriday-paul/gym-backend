import { check, query } from "express-validator";

export const gymAddValidator = [
    check('name')
        .trim()
        .not()
        .isEmpty()
        .withMessage('Gym name is required.'),

    check('description')
        .trim()
        .optional(),

    check('email')
        .trim()
        .optional()
        .isEmail()
        .normalizeEmail({ all_lowercase: true })
        .withMessage('Please enter a valid email address.'),

    check('phone')
        .optional()
        .trim()
        .isMobilePhone('any')
        .withMessage('Please enter a valid phone number.'),

    check('mat_schedules')
        .isArray()
        .withMessage('Mat schedules must be provided as an array.'),

    check('mat_schedules.*.day')
        .notEmpty()
        .withMessage('Please select a day for the mat schedule.')
        .isIn(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"])
        .withMessage('Please select a valid day.'),

    check('mat_schedules.*.from')
        .notEmpty()
        .withMessage('Please provide a start time for the mat schedule.'),

    check('mat_schedules.*.to')
        .notEmpty()
        .withMessage('Please provide an end time for the mat schedule.'),

    check('class_schedules')
        .isArray()
        .withMessage('Class schedules must be provided as an array.'),

    check('class_schedules.*.day')
        .notEmpty()
        .withMessage('Please select a day for the class schedule.')
        .isIn(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"])
        .withMessage('Please select a valid day.'),

    check('class_schedules.*.from')
        .notEmpty()
        .withMessage('Please provide a start time for the class schedule.'),

    check('class_schedules.*.to')
        .notEmpty()
        .withMessage('Please provide an end time for the class schedule.'),

    // check('class_schedules.*.name')
    // .notEmpty()
    // .withMessage('Name is required'),

    check('disciplines')
        .isArray()
        .withMessage('Disciplines must be provided as an array.'),

    check('disciplines.*')
        .notEmpty()
        .isString()
        .withMessage('Each discipline must be a valid text value.'),

    check("location")
        .exists()
        .withMessage("Location information is required.")
        .isObject()
        .withMessage("Location must be a valid object."),

    check("location.coordinates")
        .exists()
        .withMessage("Location coordinates are required.")
        .isArray({ min: 2, max: 2 })
        .withMessage("Location coordinates must contain exactly two values: [longitude, latitude]."),

    check("location.coordinates.*")
        .isFloat()
        .withMessage("Each coordinate must be a valid number."),

    check('apartment').optional(),
]

export const deleteGymImageValidator = [
    check('gymId')
        .trim()
        .not()
        .isEmpty()
        .withMessage('Gym ID is required.')
        .isMongoId()
        .withMessage('Please provide a valid Gym ID.'),

    check('imageId')
        .trim()
        .not()
        .isEmpty()
        .withMessage('Image ID is required.')
        .isMongoId()
        .withMessage('Please provide a valid Image ID.'),
]

export const gymUpdateValidator = [

    check('email')
        .trim()
        .optional()
        .isEmail()
        .normalizeEmail({ all_lowercase: true })
        .withMessage('Please enter a valid email address.'),

    check('phone')
        .optional()
        .trim()
        .isMobilePhone('any')
        .withMessage('Please enter a valid phone number.'),

    check('mat_schedules')
        .optional()
        .isArray()
        .withMessage('Mat schedules must be provided as an array.'),

    check('mat_schedules.*.day')
        .notEmpty()
        .withMessage('Please select a day for the mat schedule.')
        .isIn(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"])
        .withMessage('Please select a valid day.'),

    check('mat_schedules.*.from')
        .notEmpty()
        .withMessage('Please provide a start time for the mat schedule.')
        .isInt()
        .withMessage('Please provide the time in minute format (e.g., 2:30 PM = 870).'),

    check('mat_schedules.*.to')
        .notEmpty()
        .withMessage('Please provide an end time for the mat schedule.')
        .isInt()
        .withMessage('Please provide the time in minute format (e.g., 2:30 PM = 870).'),

    check('class_schedules')
        .optional()
        .isArray()
        .withMessage('Class schedules must be provided as an array.'),

    check('class_schedules.*.day')
        .notEmpty()
        .withMessage('Please select a day for the class schedule.')
        .isIn(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"])
        .withMessage('Please select a valid day.'),

    check('class_schedules.*.from')
        .notEmpty()
        .withMessage('Please provide a start time for the class schedule.')
        .isInt()
        .withMessage('Please provide the time in minute format (e.g., 2:30 PM = 870).'),

    check('class_schedules.*.to')
        .notEmpty()
        .withMessage('Please provide an end time for the class schedule.')
        .isInt()
        .withMessage('Please provide the time in minute format (e.g., 2:30 PM = 870).'),

    check('disciplines')
        .optional()
        .isArray()
        .withMessage('Disciplines must be provided as an array.'),

    check('disciplines.*')
        .notEmpty()
        .isString()
        .withMessage('Each discipline must be a valid text value.'),

    check("location")
        .optional()
        .isObject()
        .withMessage("Location must be a valid object."),

    check("location.coordinates")
        .if(check("location").exists())
        .isArray({ min: 2, max: 2 })
        .withMessage("Location coordinates must contain exactly two values: [longitude, latitude]."),

    check("location.coordinates.*")
        .isFloat()
        .withMessage("Each coordinate must be a valid number."),
]

export const nearGymValidator = [
    query("day")
        .notEmpty()
        .withMessage('Please select a day.')
        .isIn(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"])
        .withMessage('Please provide a valid day.'),

    query("hour")
        .notEmpty()
        .withMessage('Current hour is required.')
        .isInt({ min: 1, max: 24 })
        .withMessage('Please provide a valid hour.'),

    query("minute")
        .notEmpty()
        .withMessage('Current minute is required.')
        .isInt({ min: 0, max: 60 })
        .withMessage('Please provide a valid minute.'),

    query("long")
        .trim()
        .not()
        .isEmpty()
        .withMessage('Longitude is required.')
        .isFloat()
        .withMessage('Please provide a valid longitude.'),

    query("lat")
        .trim()
        .not()
        .isEmpty()
        .withMessage('Latitude is required.')
        .isFloat()
        .withMessage('Please provide a valid latitude.'),
]

export const allMatsvalidator = [
    query("long")
        .trim()
        .optional()
        .isFloat()
        .withMessage('Please provide a valid longitude.'),

    query("lat")
        .trim()
        .optional()
        .isFloat()
        .withMessage('Please provide a valid latitude.'),

    query("distance")
        .trim()
        .optional()
        .isFloat()
        .withMessage('Please provide a valid distance.'),
]