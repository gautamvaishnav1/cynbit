import { Router } from 'express';
import { body } from 'express-validator';

import * as formController from '../controllers/formController';
import { validateRequest } from '../middleware/validationMiddleware';
import { EMAIL_PATTERN, PRODUCT_IDS } from '../types';

/* All three public website forms (contract §2.5), mounted under /api. */
export const formRoutes = Router();

const demoRequestValidators = [
  body('productId')
    .isIn(PRODUCT_IDS)
    .withMessage('Choose one of the Cynbit products.'),
  body('fullName')
    .isString()
    .withMessage('Please enter your full name.')
    .trim()
    .notEmpty()
    .withMessage('Please enter your full name.'),
  body('workEmail')
    .isString()
    .withMessage('Please enter your work email.')
    .trim()
    .toLowerCase()
    .matches(EMAIL_PATTERN)
    .withMessage('Enter a valid email address.'),
  body('companyName')
    .optional({ values: 'falsy' })
    .isString()
    .withMessage('Company name must be text.')
    .trim(),
  body('message')
    .isString()
    .withMessage('Tell us briefly what you need.')
    .trim()
    .isLength({ min: 15 })
    .withMessage('Please add a little more detail (15 characters or more).'),
];

const contactInquiryValidators = [
  body('fullName')
    .isString()
    .withMessage('Please enter your full name.')
    .trim()
    .notEmpty()
    .withMessage('Please enter your full name.'),
  body('email')
    .isString()
    .withMessage('Please enter your email address.')
    .trim()
    .toLowerCase()
    .matches(EMAIL_PATTERN)
    .withMessage('Please enter a valid email address.'),
  body('company')
    .optional({ values: 'falsy' })
    .isString()
    .withMessage('Company must be text.')
    .trim(),
  body('industry')
    .optional({ values: 'falsy' })
    .isString()
    .withMessage('Industry must be text.')
    .trim(),
  body('message')
    .isString()
    .withMessage('Tell us briefly what you need.')
    .trim()
    .isLength({ min: 15 })
    .withMessage('Please add a little more detail (15 characters or more).'),
];

const newsletterValidators = [
  body('email')
    .isString()
    .withMessage('Please enter your email address.')
    .trim()
    .toLowerCase()
    .matches(EMAIL_PATTERN)
    .withMessage('Please enter a valid email address.'),
];

formRoutes.post('/demo-requests', demoRequestValidators, validateRequest, formController.createDemoRequest);
formRoutes.post(
  '/contact-inquiries',
  contactInquiryValidators,
  validateRequest,
  formController.createContactInquiry,
);
formRoutes.post(
  '/newsletter/subscriptions',
  newsletterValidators,
  validateRequest,
  formController.subscribeNewsletter,
);
