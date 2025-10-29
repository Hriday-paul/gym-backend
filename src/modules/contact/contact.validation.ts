import { check } from "express-validator";

export const createContactValidator = [
  check('firstName').trim().not().isEmpty().withMessage('firstName is required').isString(),
  check('lastName').trim().optional(),
  check('contact').optional().trim().isMobilePhone('any').withMessage('Invalid phone number'),
  check('email').trim().not().isEmpty().withMessage('Email is required').isEmail().normalizeEmail({ all_lowercase: true }).withMessage('Invalid Email'),
  check('description').trim().not().isEmpty().withMessage('description is required').isString(),
]

export const replyContactValidator = [
  check('message').trim().not().isEmpty().withMessage('message is required').isString(),
]

