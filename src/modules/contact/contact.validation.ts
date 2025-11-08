import { check } from "express-validator";

export const createContactValidator = [
  check('name').trim().not().isEmpty().withMessage('name is required').isString(),
  check('email').trim().not().isEmpty().withMessage('Email is required').isEmail().normalizeEmail({ all_lowercase: true }).withMessage('Invalid Email'),
  check('description').trim().not().isEmpty().withMessage('description is required').isString(),
]

export const replyContactValidator = [
  check('message').trim().not().isEmpty().withMessage('message is required').isString(),
]

