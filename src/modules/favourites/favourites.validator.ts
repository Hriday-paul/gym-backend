import { check } from "express-validator";

export const addFavouriteValidator = [
  check('gym')
    .trim()
    .not()
    .isEmpty()
    .withMessage('Gym is required.')
    .isMongoId()
    .withMessage('Gym ID is invalid.'),
]