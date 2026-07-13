import { check } from "express-validator";

export const AddFolowValidator = [
    check('friend_id')
        .trim()
        .not()
        .isEmpty()
        .withMessage('Friend is required.')
        .isMongoId()
        .withMessage('Invalid user ID.'),
]