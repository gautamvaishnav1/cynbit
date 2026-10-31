import type { ProductId, RatingSummary, Review, ReviewInput, ReviewStatus } from '../types';
import { seedReviews } from '../data/reviews';
import { computeRatingSummary } from '../utils/rating';
import { getSettingsSnapshot } from './settingsService';

/* ==================================================================
   PROTOTYPE REVIEW SERVICE — NO BACKEND, NO DATABASE.

   Everything in this file is deliberately isolated behind a small async
   interface so the future REST layer can replace it without any component
   changes:

     getReviews(productId)       <-  GET    /api/products/:id/reviews
     getRatingSummary(productId) <-  GET    /api/products/:id/reviews/summary
     submitReview(input)         <-  POST   /api/products/:id/reviews
     listAllReviews()            <-  GET    /api/admin/reviews
     setReviewStatus(id, status) <-  PATCH  /api/admin/reviews/:id/status
     updateReview(id, patch)     <-  PATCH  /api/admin/reviews/:id
     deleteReview(id)            <-  DELETE /api/admin/reviews/:id

   State lives in memory for the lifetime of the browser tab and is mirrored
   to localStorage (so admin moderation survives a refresh). Nothing is ever
   transmitted anywhere.
   ================================================================== */

/** Simulated network latency so loading states are observable. */
const LATENCY_MS = 420;
const STORAGE_KEY = 'cynbit.prototype.reviews.v2';

export const MIN_REVIEW_LENGTH = 10;
export const MAX_REVIEW_LENGTH = 600;

function readStore(): Review[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [...seedReviews];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [...seedReviews];
    return parsed as Review[];
  } catch {
    return [...seedReviews];
  }
}

function writeStore(reviews: Review[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
  } catch {
    /* Storage may be unavailable (private mode) — in-memory copy still works. */
  }
}

let store: Review[] = readStore();
const listeners = new Set<() => void>();

function notify(): void {
  listeners.forEach((listener) => listener());
}

/** Subscribe to local data mutations (used by the ReviewsProvider). */
export function subscribeReviews(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function createId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `rev_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Server-side-equivalent validation. Returned as user-facing messages. */
export function validateReviewInput(input: ReviewInput): string[] {
  const errors: string[] = [];

  if (!input.customerName.trim()) {
    errors.push('Please enter your name.');
  } else if (input.customerName.trim().length > 80) {
    errors.push('Name must be 80 characters or fewer.');
  }

  if (!input.email.trim()) {
    errors.push('Please enter your email address.');
  } else if (!EMAIL_PATTERN.test(input.email.trim())) {
    errors.push('Please enter a valid email address.');
  }

  if (!Number.isInteger(input.rating) || input.rating < 1 || input.rating > 5) {
    errors.push('Please select a star rating between 1 and 5.');
  }

  const comment = input.comment.trim();
  if (comment.length < MIN_REVIEW_LENGTH) {
    errors.push(`Your review must be at least ${MIN_REVIEW_LENGTH} characters.`);
  } else if (comment.length > MAX_REVIEW_LENGTH) {
    errors.push(`Your review must be ${MAX_REVIEW_LENGTH} characters or fewer.`);
  }

  return errors;
}

/** Approved reviews for a product, newest first. */
export async function getReviews(productId: ProductId): Promise<Review[]> {
  await delay(LATENCY_MS);
  return store
    .filter((review) => review.productId === productId && review.status === 'approved')
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

/** Aggregated rating roll-up. Always returns zeroed data when empty. */
export async function getRatingSummary(productId: ProductId): Promise<RatingSummary> {
  await delay(LATENCY_MS);
  return computeRatingSummary(productId, store);
}

/**
 * Persist a review.
 *
 * MODERATION: the initial status mirrors the admin panel's auto-approve
 * setting (a real backend always decides this server-side): submissions are
 * created `pending` and only appear publicly once an admin approves them,
 * unless auto-approve is switched on for quick demos.
 */
export async function submitReview(input: ReviewInput): Promise<Review> {
  await delay(LATENCY_MS * 1.5);

  const errors = validateReviewInput(input);
  if (errors.length > 0) {
    throw new Error(errors.join(' '));
  }

  const { autoApproveSubmissions } = getSettingsSnapshot();
  const review: Review = {
    id: createId(),
    productId: input.productId,
    customerName: input.customerName.trim(),
    email: input.email.trim(),
    rating: input.rating,
    comment: input.comment.trim(),
    createdAt: new Date().toISOString(),
    status: autoApproveSubmissions ? 'approved' : 'pending',
  };

  store = [review, ...store];
  writeStore(store);
  notify();

  return review;
}

/* ------------------------------------------------------------------
   Admin API — backs the prototype admin panel (/admin).
   In a production app these calls would be authenticated and server-side
   enforced; here they simply mutate the local store.
------------------------------------------------------------------- */

/** Every review (all statuses) for the admin panel, newest first. */
export async function listAllReviews(): Promise<Review[]> {
  await delay(LATENCY_MS);
  return [...store].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

/** Approve / reject / restore to pending. */
export async function setReviewStatus(id: string, status: ReviewStatus): Promise<Review> {
  await delay(LATENCY_MS / 2);

  const existing = store.find((review) => review.id === id);
  if (!existing) throw new Error('That review no longer exists.');

  const updated: Review = { ...existing, status };
  store = store.map((review) => (review.id === id ? updated : review));
  writeStore(store);
  notify();

  return updated;
}

/** Edit a review's rating and/or written body (admin corrections). */
export async function updateReview(
  id: string,
  patch: Partial<Pick<ReviewInput, 'rating' | 'comment'>>,
): Promise<Review> {
  await delay(LATENCY_MS);

  const existing = store.find((review) => review.id === id);
  if (!existing) throw new Error('That review no longer exists.');

  const rating = patch.rating ?? existing.rating;
  const comment = (patch.comment ?? existing.comment).trim();

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error('Rating must be a whole number between 1 and 5.');
  }
  if (comment.length < MIN_REVIEW_LENGTH || comment.length > MAX_REVIEW_LENGTH) {
    throw new Error(
      `Review body must be between ${MIN_REVIEW_LENGTH} and ${MAX_REVIEW_LENGTH} characters.`,
    );
  }

  const updated: Review = { ...existing, rating, comment };
  store = store.map((review) => (review.id === id ? updated : review));
  writeStore(store);
  notify();

  return updated;
}

/** Permanently remove a review. */
export async function deleteReview(id: string): Promise<void> {
  await delay(LATENCY_MS / 2);

  if (!store.some((review) => review.id === id)) {
    throw new Error('That review no longer exists.');
  }

  store = store.filter((review) => review.id !== id);
  writeStore(store);
  notify();
}

/** Test/dev helper — clears every locally submitted review. */
export function resetReviews(): void {
  store = [...seedReviews];
  writeStore(store);
  notify();
}

export const reviewService = {
  getReviews,
  getRatingSummary,
  submitReview,
  listAllReviews,
  setReviewStatus,
  updateReview,
  deleteReview,
  subscribeReviews,
  validateReviewInput,
  resetReviews,
  MIN_REVIEW_LENGTH,
  MAX_REVIEW_LENGTH,
};

export default reviewService;
