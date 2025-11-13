import { check } from "express-validator";

export const addFavouriteValidator = [
  check('gym').trim().not().isEmpty().withMessage('gym is required').isMongoId().withMessage("gym id is invalid"),
]