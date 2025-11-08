import { check } from "express-validator";

export const AddFolowValidator = [
    check('friend_id').trim().not().isEmpty().withMessage('friend_id is required').isMongoId().withMessage("friend_id invalid"),
]