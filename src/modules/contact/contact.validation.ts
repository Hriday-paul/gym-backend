import { check } from "express-validator";

export const createContactValidator = [
  check('name')
    .trim()
    .not()
    .isEmpty()
    .withMessage('Name is required.')
    .isString(),

  check('email')
    .trim()
    .not()
    .isEmpty()
    .withMessage('Email address is required.')
    .isEmail()
    .normalizeEmail({ all_lowercase: true })
    .withMessage('Invalid email address.'),

  check('description')
    .trim()
    .not()
    .isEmpty()
    .withMessage('Description is required.')
    .isString(),
]

export const replyContactValidator = [
  check('message')
    .trim()
    .not()
    .isEmpty()
    .withMessage('Message is required.')
    .isString(),
]