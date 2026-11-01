import { Request, Response } from 'express';

import { ReviewSettings, ReviewSettingsDoc } from '../models/ReviewSettings';
import { ReviewSectionSettings } from '../types';
import { isDBConnected } from '../config/db';
import { ApiError } from '../utils/ApiError';

/**
 * Returns the singleton settings row, creating the defaults on first use
 * (contract §3.5: "create defaults on first read if missing").
 */
export async function getOrCreateSettings(): Promise<ReviewSettingsDoc> {
  const existing = await ReviewSettings.findOne({ _id: 'main' });
  if (existing) return existing;
  return ReviewSettings.create({
    _id: 'main',
    productReviewsEnabled: true,
    clientReviewsEnabled: true,
    autoApproveSubmissions: false,
  });
}

function toSettings(doc: ReviewSettingsDoc): ReviewSectionSettings {
  return {
    productReviewsEnabled: doc.productReviewsEnabled,
    clientReviewsEnabled: doc.clientReviewsEnabled,
    autoApproveSubmissions: doc.autoApproveSubmissions,
  };
}

/** 503 when MongoDB is not reachable. */
function requireDB(): void {
  if (!isDBConnected) {
    throw new ApiError(
      503,
      'INTERNAL',
      'Database is temporarily unavailable. Please try again later.',
    );
  }
}

/** GET /api/admin/review-settings */
export async function getSettings(_req: Request, res: Response): Promise<void> {
  requireDB();
  const settings = await getOrCreateSettings();
  res.status(200).json(toSettings(settings));
}

/** PATCH /api/admin/review-settings — accepts any subset of the three flags. */
export async function updateSettings(req: Request, res: Response): Promise<void> {
  requireDB();
  const patch = req.body as Partial<ReviewSectionSettings>;
  const settings = await getOrCreateSettings();

  if (typeof patch.productReviewsEnabled === 'boolean') {
    settings.productReviewsEnabled = patch.productReviewsEnabled;
  }
  if (typeof patch.clientReviewsEnabled === 'boolean') {
    settings.clientReviewsEnabled = patch.clientReviewsEnabled;
  }
  if (typeof patch.autoApproveSubmissions === 'boolean') {
    settings.autoApproveSubmissions = patch.autoApproveSubmissions;
  }
  await settings.save();

  res.status(200).json(toSettings(settings));
}
