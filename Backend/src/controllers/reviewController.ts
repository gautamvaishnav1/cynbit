import { Request, Response } from 'express';

import { getOrCreateSettings } from './settingsController';
import { computeSummary } from '../utils/rating';
import { ApiError } from '../utils/ApiError';
import { isDBConnected } from '../config/db';
import { isProductId, isReviewStatus, isUuid, ProductId, RatingSummary, ReviewStatus } from '../types';
import { Review, ReviewDoc } from '../models/Review';

export interface PublicReview {
  id: string;
  productId: ProductId;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: string;
  status: ReviewStatus;
}

export interface AdminReview extends PublicReview {
  email: string;
}

export interface ReviewStatusUpdate {
  status: ReviewStatus;
}

/* Express 5 route params are typed string | string[]. */
function readParam(param: string | string[]): string {
  return Array.isArray(param) ? param[0] : param;
}

/** Unknown product ids answer 404 (contract §3.1). */
function findProductOr404(productIdParam: string | string[]): ProductId {
  const productId = readParam(productIdParam);
  if (!isProductId(productId)) {
    throw new ApiError(404, 'NOT_FOUND', 'The requested product does not exist.');
  }
  return productId;
}

async function findReviewOr404(idParam: string | string[]): Promise<ReviewDoc> {
  const id = readParam(idParam);
  if (!isUuid(id)) {
    throw new ApiError(404, 'NOT_FOUND', 'Review not found.');
  }
  const review = await Review.findById(id);
  if (!review) {
    throw new ApiError(404, 'NOT_FOUND', 'Review not found.');
  }
  return review;
}

function toPublicReview(doc: ReviewDoc): PublicReview {
  return {
    id: doc._id.toString(),
    productId: doc.productId,
    customerName: doc.customerName,
    rating: doc.rating,
    comment: doc.comment,
    createdAt: doc.createdAt.toISOString(),
    status: doc.status,
  };
}

function toAdminReview(doc: ReviewDoc): AdminReview {
  return { ...toPublicReview(doc), email: doc.email };
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
   Public product review endpoints (contract §3.1).
------------------------------------------------------------------- */

/** GET /api/products/:productId/reviews — approved only, newest first. */
export async function getReviews(req: Request, res: Response): Promise<void> {
  requireDB();
  const productId = findProductOr404(req.params.productId);
  const reviews = await Review.find({ productId, status: 'approved' }).sort({
    createdAt: -1,
  });
  res.status(200).json(reviews.map(toPublicReview));
}

/** GET /api/products/:productId/reviews/summary — zeroed when empty. */
export async function getSummary(req: Request, res: Response): Promise<void> {
  requireDB();
  const productId = findProductOr404(req.params.productId);
  const docs = await Review.find({ productId, status: 'approved' }).select('rating');
  const summary = computeSummary(docs.map((doc) => doc.rating));
  const response: RatingSummary = { productId, ...summary };
  res.status(200).json(response);
}

/**
 * POST /api/products/:productId/reviews — status is decided here,
 * never taken from the request body.
 */
export async function submitReview(req: Request, res: Response): Promise<void> {
  requireDB();
  const productId = findProductOr404(req.params.productId);
  const input = req.body as { customerName: string; email: string; rating: number; comment: string };

  const settings = await getOrCreateSettings();
  if (!settings.productReviewsEnabled) {
    throw new ApiError(403, 'FORBIDDEN', 'Product reviews are currently disabled.');
  }

  const review = await Review.create({
    productId,
    customerName: input.customerName,
    email: input.email,
    rating: input.rating,
    comment: input.comment,
    status: settings.autoApproveSubmissions ? 'approved' : 'pending',
  });

  /* Contract §2.1: the POST response is the full object (email included). */
  res.status(201).json(toAdminReview(review));
}

/* ------------------------------------------------------------------
   Admin product review endpoints (contract §3.2).
------------------------------------------------------------------- */

/** GET /api/admin/reviews — all statuses, optional ?status= & ?productId=. */
export async function listAllReviews(req: Request, res: Response): Promise<void> {
  requireDB();
  const filter: Record<string, string> = {};
  if (typeof req.query.status === 'string' && isReviewStatus(req.query.status)) {
    filter.status = req.query.status;
  }
  if (typeof req.query.productId === 'string' && isProductId(req.query.productId)) {
    filter.productId = req.query.productId;
  }

  const reviews = await Review.find(filter).sort({ createdAt: -1 });
  res.status(200).json(reviews.map(toAdminReview));
}

/** PATCH /api/admin/reviews/:id/status */
export async function setReviewStatus(req: Request, res: Response): Promise<void> {
  requireDB();
  const review = await findReviewOr404(req.params.id);
  const { status } = req.body as ReviewStatusUpdate;

  review.status = status;
  await review.save();

  res.status(200).json(toAdminReview(review));
}

/** PATCH /api/admin/reviews/:id — edit rating and/or comment. */
export async function updateReview(req: Request, res: Response): Promise<void> {
  requireDB();
  const patch = req.body as { rating?: number; comment?: string };
  const review = await findReviewOr404(req.params.id);

  if (patch.rating !== undefined) review.rating = patch.rating;
  if (patch.comment !== undefined) review.comment = patch.comment;
  await review.save();

  res.status(200).json(toAdminReview(review));
}

/** DELETE /api/admin/reviews/:id — hard delete. */
export async function deleteReview(req: Request, res: Response): Promise<void> {
  requireDB();
  const id = readParam(req.params.id);
  await findReviewOr404(id); // verify exists (throws 404 if not)
  await Review.deleteOne({ _id: id });
  res.status(204).end();
}
