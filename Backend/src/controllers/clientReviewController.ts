import { Request, Response } from 'express';

import { getOrCreateSettings } from './settingsController';
import { computeSummary } from '../utils/rating';
import { ApiError } from '../utils/ApiError';
import { isDBConnected } from '../config/db';
import { isUuid } from '../types';
import { ClientReview, ClientReviewDoc } from '../models/ClientReview';
import {
  ClientRatingSummary,
  ClientReview as ClientReviewView,
  ClientReviewInput,
  ReviewStatusUpdate,
} from '../types';

async function findClientReviewOr404(idParam: string | string[]): Promise<ClientReviewDoc> {
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

function toClientReview(doc: ClientReviewDoc): ClientReviewView {
  return {
    id: doc._id.toString(),
    clientName: doc.clientName,
    clientTitle: doc.clientTitle,
    rating: doc.rating,
    comment: doc.comment,
    ...(doc.source ? { source: doc.source } : {}),
    createdAt: doc.createdAt.toISOString(),
    status: doc.status,
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

/* ------------------------------------------------------------------
   Public client review endpoints (contract §3.3).
------------------------------------------------------------------- */

/** GET /api/client-reviews — approved only, newest first. */
export async function getClientReviews(_req: Request, res: Response): Promise<void> {
  requireDB();
  const reviews = await ClientReview.find({ status: 'approved' }).sort({
    createdAt: -1,
  });
  res.status(200).json(reviews.map(toClientReview));
}

/** GET /api/client-reviews/summary — zeroed when empty. */
export async function getClientSummary(_req: Request, res: Response): Promise<void> {
  requireDB();
  const docs = await ClientReview.find({ status: 'approved' }).select('rating');
  const summary: ClientRatingSummary = computeSummary(docs.map((doc) => doc.rating));
  res.status(200).json(summary);
}

/* ------------------------------------------------------------------
   Admin client review endpoints (contract §3.4).
------------------------------------------------------------------- */

/** GET /api/admin/client-reviews — all statuses, newest first. */
export async function listAllClientReviews(_req: Request, res: Response): Promise<void> {
  requireDB();
  const reviews = await ClientReview.find().sort({ createdAt: -1 });
  res.status(200).json(reviews.map(toClientReview));
}

/** POST /api/admin/client-reviews — status follows autoApproveSubmissions. */
export async function createClientReview(req: Request, res: Response): Promise<void> {
  requireDB();
  const input = req.body as ClientReviewInput;
  const settings = await getOrCreateSettings();

  const review = await ClientReview.create({
    clientName: input.clientName,
    clientTitle: input.clientTitle,
    rating: input.rating,
    comment: input.comment,
    ...(input.source ? { source: input.source } : {}),
    status: settings.autoApproveSubmissions ? 'approved' : 'pending',
  });

  res.status(201).json(toClientReview(review));
}

/** PATCH /api/admin/client-reviews/:id — partial edit of any subset of fields. */
export async function updateClientReview(req: Request, res: Response): Promise<void> {
  requireDB();
  const patch = req.body as Partial<ClientReviewInput>;
  const review = await findClientReviewOr404(req.params.id);

  if (patch.clientName !== undefined) review.clientName = patch.clientName;
  if (patch.clientTitle !== undefined) review.clientTitle = patch.clientTitle;
  if (patch.rating !== undefined) review.rating = patch.rating;
  if (patch.comment !== undefined) review.comment = patch.comment;
  if (patch.source !== undefined) {
    if (patch.source) review.source = patch.source;
    else review.source = undefined;
  }
  await review.save();

  res.status(200).json(toClientReview(review));
}

/** PATCH /api/admin/client-reviews/:id/status */
export async function setClientReviewStatus(req: Request, res: Response): Promise<void> {
  requireDB();
  const review = await findClientReviewOr404(req.params.id);
  const { status } = req.body as ReviewStatusUpdate;

  review.status = status;
  await review.save();

  res.status(200).json(toClientReview(review));
}

/** DELETE /api/admin/client-reviews/:id — hard delete. */
export async function deleteClientReview(req: Request, res: Response): Promise<void> {
  requireDB();
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  await findClientReviewOr404(id); // verify exists (throws 404 if not)
  await ClientReview.deleteOne({ _id: id });
  res.status(204).end();
}
