import { Router } from 'express';
import { body } from 'express-validator';

import * as settingsController from '../controllers/settingsController';
import { requireAdmin } from '../middleware/authMiddleware';
import { hasAtLeastOneKey, validateRequest } from '../middleware/validationMiddleware';

export const adminSettingsRoutes = Router();

const updateValidators = [
  body()
    .custom((value: unknown) =>
      hasAtLeastOneKey(value, [
        'productReviewsEnabled',
        'clientReviewsEnabled',
        'autoApproveSubmissions',
      ]),
    )
    .withMessage('Provide at least one setting to update.'),
  body('productReviewsEnabled')
    .optional()
    .isBoolean()
    .withMessage('productReviewsEnabled must be true or false.')
    .toBoolean(),
  body('clientReviewsEnabled')
    .optional()
    .isBoolean()
    .withMessage('clientReviewsEnabled must be true or false.')
    .toBoolean(),
  body('autoApproveSubmissions')
    .optional()
    .isBoolean()
    .withMessage('autoApproveSubmissions must be true or false.')
    .toBoolean(),
];

/* GET / PATCH /api/admin/review-settings (contract §3.5). */
adminSettingsRoutes.use(requireAdmin);
adminSettingsRoutes.get('/', settingsController.getSettings);
adminSettingsRoutes.patch('/', updateValidators, validateRequest, settingsController.updateSettings);
