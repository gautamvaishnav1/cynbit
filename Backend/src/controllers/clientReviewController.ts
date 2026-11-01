import { Request, Response } from 'express';

import { getOrCreateSettings } from './settingsController';
import { computeSummary } from '../utils/rating';
import { ApiError } from '../utils/ApiError';
import { isUuid } from '../types';
import { ClientReview, ClientReviewRecord } from '../models/ClientReview';
import {
  ClientRatingSummary,
  ClientReview as ClientReviewView,
  ClientReviewInput,
  ReviewStatusUpdate,
} from '../types';

async function findClientReviewOr404(idParam: string | string[]): Promise<ClientReviewRecord> {
  const id = Array.isArray(idParam) ? idParam[0] : idParam;
  if (!isUuid(id)) {
    throw new ApiError(404, 'NOT_FOUND', 'Client review not found.');
  }
  const review = await ClientReview.findById(id);
  if (!review) {
    throw new ApiError(404, 'NOT_FOUND', 'Client review not found.');
  }
  return review;
}

function toIsoString(value: Date | string): string {
  return typeof value === 'string' ? value : value.toISOString();
}

function toClientReview(doc: ClientReviewRecord): ClientReviewView {
  return {
    id: doc._id,
    clientName: doc.clientName,
    clientTitle: doc.clientTitle,
    rating: doc.rating,
    comment: doc.comment,
    ...(doc.source ? { source: doc.source } : {}),
    createdAt: toIsoString(doc.createdAt),
    status: doc.status,
  };
}

/** Epoch ms for a date that may have round-tripped through JSON (string). */
function toTime(value: Date | string): number {
  return typeof value === 'string' ? Date.parse(value) : value.getTime();
}

/* ------------------------------------------------------------------
   Public client review endpoints (contract §3.3).
------------------------------------------------------------------- */

/** GET /api/client-reviews — approved only, newest first. */
export async function getClientReviews(_req: Request, res: Response): Promise<void> {
  const reviews = await ClientReview.find({ status: 'approved' });
  reviews.sort((a, b) => toTime(b.createdAt) - toTime(a.createdAt));
  res.status(200).json(reviews.map(toClientReview));
}

/** GET /api/client-reviews/summary — zeroed when empty. */
export async function getClientSummary(_req: Request, res: Response): Promise<void> {
  const docs = await ClientReview.find({ status: 'approved' });
  const summary: ClientRatingSummary = computeSummary(docs.map((doc) => doc.rating));
  res.status(200).json(summary);
}

/* ------------------------------------------------------------------
   Admin client review endpoints (contract §3.4).
------------------------------------------------------------------- */

/** GET /api/admin/client-reviews — all statuses, newest first. */
export async function listAllClientReviews(_req: Request, res: Response): Promise<void> {
  const reviews = await ClientReview.find();
  reviews.sort((a, b) => toTime(b.createdAt) - toTime(a.createdAt));
  res.status(200).json(reviews.map(toClientReview));
}

/** POST /api/admin/client-reviews — status follows autoApproveSubmissions. */
export async function createClientReview(req: Request, res: Response): Promise<void> {
  const input = req.body as ClientReviewInput;
  const settings = await getOrCreateSettings();

  const review = await ClientReview.create({
    clientName: input.clientName,
    clientTitle: input.clientTitle,
    rating: input.rating,
    comment: input.comment,
    ...(input.source ? { source: input.source } : {}),
    status: settings.autoApproveSubmissions ? 'approved' : 'pending',
    createdAt: new Date(),
  });

  res.status(201).json(toClientReview(review));
}

/** PATCH /api/admin/client-reviews/:id — partial edit of any subset of fields. */
export async function updateClientReview(req: Request, res: Response): Promise<void> {
  const patch = req.body as Partial<ClientReviewInput>;
  const review = await findClientReviewOr404(req.params.id);

  if (patch.clientName !== undefined) review.clientName = patch.clientName;
  if (patch.clientTitle !== undefined) review.clientTitle = patch.clientTitle;
  if (patch.rating !== undefined) review.rating = patch.rating;
  if (patch.comment !== undefined) review.comment = patch.comment;
  if (patch.source !== undefined) {
    if (patch.source) review.source = patch.source;
    else delete review.source;
  }
  await ClientReview.save(review);

  res.status(200).json(toClientReview(review));
}

/** PATCH /api/admin/client-reviews/:id/status */
export async function setClientReviewStatus(req: Request, res: Response): Promise<void> {
  const review = await findClientReviewOr404(req.params.id);
  const { status } = req.body as ReviewStatusUpdate;

  review.status = status;
  await ClientReview.save(review);

  res.status(200).json(toClientReview(review));
}

/** DELETE /api/admin/client-reviews/:id — hard delete. */
export async function deleteClientReview(req: Request, res: Response): Promise<void> {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  await ClientReview.findById(id); // verify exists (throws 404 if not)
  await ClientReview.deleteOne(id);
  res.status(204).end();
}
