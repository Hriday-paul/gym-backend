
import { check, param } from "express-validator";

export const updateSettingsValidator = [
  check('key').trim().not().isEmpty().withMessage('key is required').isString().isIn(['terms', 'privacy', "about"]).withMessage('key should be [privacy, terms, about]'),
  check('value').trim().not().isEmpty().withMessage('value is required').isString(),
]

export const SettingsValidator = [
  param('key').trim().not().isEmpty().withMessage('key is required').isString().isIn(['terms', 'privacy', "about"]).withMessage('key should be [privacy, terms, about]'),
]