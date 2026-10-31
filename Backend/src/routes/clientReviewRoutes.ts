import { Router } from 'express';
import { body } from 'express-validator';

import * as clientReviewController from '../controllers/clientReviewController';
import { requireAdmin } from '../middleware/authMiddleware';
import { hasAtLeastOneKey, validateRequest } from '../middleware/validationMiddleware';
import { REVIEW_STATUSES } from '../types';

export const publicClientReviewRoutes = Router();
export const adminClientReviewRoutes = Router();

const createValidators = [
  body('clientName')
    .isString()
    .withMessage('Please enter the client name.')
    .trim()
    .notEmpty()
    .withMessage('Please enter the client name.')
    .isLength({ max: 80 })
    .withMessage('Client name must be 80 characters or fewer.'),
  body('clientTitle')
    .isString()
    .withMessage('Please enter the client role or company.')
    .trim()
    .notEmpty()
    .withMessage('Please enter the client role or company.')
    .isLength({ max: 120 })
    .withMessage('Role / company must be 120 characters or fewer.'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Please select a star rating between 1 and 5.')
    .toInt(),
  body('comment')
    .isString()
    .withMessage('Please enter the review.')
    .trim()
    .isLength({ min: 20, max: 600 })
    .withMessage('The review must be between 20 and 600 characters.'),
  body('source')
    .optional({ values: 'falsy' })
    .isString()
    .withMessage('Source must be text.')
    .trim()
    .isLength({ max: 60 })
    .withMessage('Source must be 60 characters or fewer.'),
];

const editValidators = [
  body()
    .custom((value: unknown) =>
      hasAtLeastOneKey(value, ['clientName', 'clientTitle', 'rating', 'comment', 'source']),
    )
    .withMessage('Provide at least one field to update.'),
  body('clientName')
    .optional()
    .isString()
    .withMessage('Client name must be text.')
    .trim()
    .notEmpty()
    .withMessage('Please enter the client name.')
    .isLength({ max: 80 })
    .withMessage('Client name must be 80 characters or fewer.'),
  body('clientTitle')
    .optional()
    .isString()
    .withMessage('Role / company must be text.')
    .trim()
    .notEmpty()
    .withMessage('Please enter the client role or company.')
    .isLength({ max: 120 })
    .withMessage('Role / company must be 120 characters or fewer.'),
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
    .isLength({ min: 20, max: 600 })
    .withMessage('The review must be between 20 and 600 characters.'),
  body('source')
    .optional({ values: 'falsy' })
    .isString()
    .withMessage('Source must be text.')
    .trim()
    .isLength({ max: 60 })
    .withMessage('Source must be 60 characters or fewer.'),
];

const statusValidators = [
  body('status')
    .isIn(REVIEW_STATUSES)
    .withMessage('Status must be pending, approved or rejected.'),
];

/* Public (contract §3.3). */
publicClientReviewRoutes.get('/', clientReviewController.getClientReviews);
publicClientReviewRoutes.get('/summary', clientReviewController.getClientSummary);

/* Admin (contract §3.4). */
adminClientReviewRoutes.use(requireAdmin);
adminClientReviewRoutes.get('/', clientReviewController.listAllClientReviews);
adminClientReviewRoutes.post(
  '/',
  createValidators,
  validateRequest,
  clientReviewController.createClientReview,
);
adminClientReviewRoutes.patch(
  '/:id',
  editValidators,
  validateRequest,
  clientReviewController.updateClientReview,
);
adminClientReviewRoutes.patch(
  '/:id/status',
  statusValidators,
  validateRequest,
  clientReviewController.setClientReviewStatus,
);
adminClientReviewRoutes.delete('/:id', clientReviewController.deleteClientReview);
