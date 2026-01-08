import { check } from "express-validator";

export const AddFolowValidator = [
    check('friend_id').trim().not().isEmpty().withMessage('friend is required').isMongoId().withMessage("friend invalid"),
]