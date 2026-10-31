import { Router } from 'express';
import { body } from 'express-validator';

import * as adminController from '../controllers/adminController';
import { createRateLimiter } from '../middleware/rateLimitMiddleware';
import { validateRequest } from '../middleware/validationMiddleware';
import { EMAIL_PATTERN } from '../types';

export const adminAuthRoutes = Router();

/* Brute-force protection for the sign-in endpoint (contract §3.6). */
const loginLimiter = createRateLimiter('admin-login', {
  windowMs: 15 * 60 * 1000,
  maxRequests: 8,
});

const loginValidators = [
  body('email')
    .isString()
    .withMessage('Please enter your email address.')
    .trim()
    .toLowerCase()
    .matches(EMAIL_PATTERN)
    .withMessage('Please enter a valid email address.'),
  body('password')
    .isString()
    .withMessage('Please enter your password.')
    .notEmpty()
    .withMessage('Please enter your password.'),
];

/* POST /api/admin/auth/login (contract §3.6). */
adminAuthRoutes.post(
  '/login',
  loginLimiter,
  loginValidators,
  validateRequest,
  adminController.login,
);
