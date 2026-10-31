import { Router } from 'express';
import { body, query } from 'express-validator';

import * as reviewController from '../controllers/reviewController';
import { requireAdmin } from '../middleware/authMiddleware';
import { createRateLimiter } from '../middleware/rateLimitMiddleware';
import { hasAtLeastOneKey, validateRequest } from '../middleware/validationMiddleware';
import { EMAIL_PATTERN, PRODUCT_IDS, REVIEW_STATUSES } from '../types';

export const publicReviewRoutes = Router();
export const adminReviewRoutes = Router();

/* Abuse protection for public submissions (contract §3.1). */
const reviewSubmitLimiter = createRateLimiter('review-submission', {
  windowMs: 60 * 60 * 1000,
  maxRequests: 10,
});

const submissionValidators = [
  body('customerName')
    .isString()
    .withMessage('Please enter your name.')
    .trim()
    .notEmpty()
    .withMessage('Please enter your name.')
    .isLength({ max: 80 })
    .withMessage('Name must be 80 characters or fewer.'),
  body('email')
    .isString()
    .withMessage('Please enter your email address.')
    .trim()
    .toLowerCase()
    .matches(EMAIL_PATTERN)
    .withMessage('Please enter a valid email address.'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Please select a star rating between 1 and 5.')
    .toInt(),
  body('comment')
    .isString()
    .withMessage('Please enter your review.')
    .trim()
    .isLength({ min: 10, max: 600 })
    .withMessage('Your review must be between 10 and 600 characters.'),
];

const listValidators = [
  query('status')
    .optional()
    .isIn(REVIEW_STATUSES)
    .withMessage('Status must be pending, approved or rejected.'),
  query('productId')
    .optional()
    .isIn(PRODUCT_IDS)
    .withMessage('Unknown product id.'),
];

const statusValidators = [
  body('status')
    .isIn(REVIEW_STATUSES)
    .withMessage('Status must be pending, approved or rejected.'),
];

const editValidators = [
  body()
    .custom((value: unknown) => hasAtLeastOneKey(value, ['rating', 'comment']))
    .withMessage('Provide a rating or a comment to update.'),
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be a whole number between 1 and 5.')
    .toInt(),
  body('comment')
    .optional()
    .isString()
    .withMessage('Review must be text.')
    .trim()
    .isLength({ min: 10, max: 600 })
    .withMessage('Your review must be between 10 and 600 characters.'),
];

/* Public (contract §3.1). */
publicReviewRoutes.get('/:productId/reviews', reviewController.getReviews);
publicReviewRoutes.get('/:productId/reviews/summary', reviewController.getSummary);
publicReviewRoutes.post(
  '/:productId/reviews',
  reviewSubmitLimiter,
  submissionValidators,
  validateRequest,
  reviewController.submitReview,
);

/* Admin (contract §3.2) — everything below requires a valid admin JWT. */
adminReviewRoutes.use(requireAdmin);
adminReviewRoutes.get('/', listValidators, validateRequest, reviewController.listAllReviews);
adminReviewRoutes.patch(
  '/:id/status',
  statusValidators,
  validateRequest,
  reviewController.setReviewStatus,
);
adminReviewRoutes.patch('/:id', editValidators, validateRequest, reviewController.updateReview);
adminReviewRoutes.delete('/:id', reviewController.deleteReview);
