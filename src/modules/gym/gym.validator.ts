import { check, query } from "express-validator";

// images: string[],
//     name: string,
//     description: string,
//     street: string,
//     state: string,
//     city: string,
//     zip_code: string,
//     phone: string,
//     email: string,
//     website: string,
//     facebook: string,
//     instagram: string,
//     mat_schedules: { day : string, from: string, to: string }[],
//     class_schedules: { day : string, from: string, to: string }[],
//     disciplines : string[],

//     isDeleted : boolean,
//     isClaimed : boolean,

//     user : ObjectId,

//     location : {type : string, coordinates : number[]}

export const gymAddValidator = [
    check('name').trim().not().isEmpty().withMessage('name is required'),
    check('description').trim().optional(),
    check('email').trim().not().isEmpty().withMessage('Email is required').isEmail().normalizeEmail({ all_lowercase: true }).withMessage('Invalid Email'),
    check('phone').optional().trim().isMobilePhone('any').withMessage('Invalid phone number'), //.isMobilePhone('any').withMessage('Invalid contact number')

    check('mat_schedules')
        .isArray()
        .withMessage('mat_schedules must be array'),

    check('mat_schedules.*.day')
        .notEmpty()
        .withMessage('day name is required')
        .isIn(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"])
        .withMessage('Invalid day'),

    check('mat_schedules.*.from')
        .notEmpty()
        .withMessage('From is required'),

    check('mat_schedules.*.to')
        .notEmpty()
        .withMessage('To is required'),


    check('class_schedules')
        .isArray()
        .withMessage('class_schedules must be array'),

    check('class_schedules.*.day')
        .notEmpty()
        .withMessage('day name is required')
        .isIn(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"])
        .withMessage('Invalid day'),

    check('class_schedules.*.from')
        .notEmpty()
        .withMessage('From is required'),

    check('class_schedules.*.to')
        .notEmpty()
        .withMessage('To is required'),

    // check('class_schedules.*.name')
    // .notEmpty()
    // .withMessage('Name is required'),

    check('disciplines')
        .isArray()
        .withMessage('disciplines must be array'),

    check('disciplines.*')
        .notEmpty()
        .isString()
        .withMessage('Each disciplines must be string'),

    check("location").exists().withMessage("location is required").isObject().withMessage("location must be an object"),

    // coordinates must be an array of exactly 2 items
    check("location.coordinates")
        .exists().withMessage("location.coordinates is required")
        .isArray({ min: 2, max: 2 }).withMessage("location.coordinates must be an array of 2 numbers [lng, lat]"),

    // validate each item in the coordinates array is a float
    check("location.coordinates.*")
        .isFloat().withMessage("each coordinate must be a number"),

    check('apartment').trim().not().isEmpty().withMessage('apartment is required'),
]

export const deleteGymImageValidator = [
    check('gymId').trim().not().isEmpty().withMessage('gymId is required').isMongoId().withMessage("gymId invalid"),
    check('imageId').trim().not().isEmpty().withMessage('imageId is required').isMongoId().withMessage("imageId invalid"),
]

export const gymUpdateValidator = [

    check('email').trim().optional().isEmail().normalizeEmail({ all_lowercase: true }).withMessage('Invalid Email'),
    check('phone').optional().trim().isMobilePhone('any').withMessage('Invalid phone number'), //.isMobilePhone('any').withMessage('Invalid contact number')

    check('mat_schedules')
        .optional()
        .isArray()
        .withMessage('mat_schedules must be array'),

    check('mat_schedules.*.day')
        .notEmpty()
        .withMessage('day name is required')
        .isIn(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"])
        .withMessage('Invalid day'),

    check('mat_schedules.*.from')
        .notEmpty()
        .withMessage('From is required')
        .isInt().withMessage("From should be minute format. eg: 2:30PM - 14X60+30 = 870"),

    check('mat_schedules.*.to')
        .notEmpty()
        .withMessage('To is required')
        .isInt().withMessage("To should be minute format. eg: 2:30PM - 14X60+30 = 870"),


    check('class_schedules')
        .optional()
        .isArray()
        .withMessage('class_schedules must be array'),

    check('class_schedules.*.day')
        .notEmpty()
        .withMessage('day name is required')
        .isIn(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"])
        .withMessage('Invalid day'),

    check('class_schedules.*.from')
        .notEmpty()
        .withMessage('From is required')
        .isInt().withMessage("From should be minute format. eg: 2:30PM - 14X60+30 = 870"),

    check('class_schedules.*.to')
        .notEmpty()
        .withMessage('To is required')
        .isInt().withMessage("To should be minute format (e.g., 2:30PM = 870)"),

    check('disciplines')
        .optional()
        .isArray()
        .withMessage('disciplines must be array'),

    check('disciplines.*')
        .notEmpty()
        .isString()
        .withMessage('Each disciplines must be string'),

    check("location").optional().isObject().withMessage("location must be an object"),

    // coordinates must be an array of exactly 2 items
    check("location.coordinates")
        .if(check("location").exists())
        .isArray({ min: 2, max: 2 }).withMessage("location.coordinates should be provide"),

    // validate each item in the coordinates array is a float
    check("location.coordinates.*")
        .isFloat().withMessage("each coordinate must be a number"),
]

export const nearGymValidator = [
    query("day").notEmpty()
        .withMessage('day name is required')
        .isIn(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"])
        .withMessage('Invalid day'),

    query("hour").notEmpty()
        .withMessage('hour time is required')
        .isInt({ min: 1, max: 24 })
        .withMessage('Invalid hour time'),

    query("minute").notEmpty()
        .withMessage('minute time is required')
        .isInt({ min: 0, max: 60 })
        .withMessage('Invalid minute time'),

    query("long").trim().not().isEmpty().withMessage('long is required').isFloat().withMessage("long invalid"),
    query("lat").trim().not().isEmpty().withMessage('lat is required').isFloat().withMessage("lat invalid"),
]

export const allMatsvalidator = [
    query("long").trim().optional().isFloat().withMessage("long invalid"),
    query("lat").trim().optional().isFloat().withMessage("lat invalid"),
    query("distance").trim().optional().isFloat().withMessage("distance invalid"),
]