import type { ProductId, RatingSummary, Review, ReviewInput, ReviewStatus } from '../types';
import { seedReviews } from '../data/reviews';
import { computeRatingSummary } from '../utils/rating';
import { API_ENABLED, request } from './apiClient';

/* ==================================================================
   REVIEW SERVICE — REST-backed (JSON.md contract).

   When VITE_API_BASE_URL is configured every call goes to the real
   backend:

     getReviews(productId)       <-  GET    /api/products/:id/reviews
     getRatingSummary(productId) <-  GET    /api/products/:id/reviews/summary
     submitReview(input)         <-  POST   /api/products/:id/reviews
     listAllReviews()            <-  GET    /api/admin/reviews
     setReviewStatus(id, status) <-  PATCH  /api/admin/reviews/:id/status
     updateReview(id, patch)     <-  PATCH  /api/admin/reviews/:id
     deleteReview(id)            <-  DELETE /api/admin/reviews/:id

   Without the env var (demo/offline mode) it falls back to a local
   localStorage mirror so the prototype still runs.
   ================================================================== */

const STORAGE_KEY = 'cynbit.prototype.reviews.v2';

export const MIN_REVIEW_LENGTH = 10;
export const MAX_REVIEW_LENGTH = 600;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/* ------------------------------------------------------------------
   Local (offline/demo) fallback store — identical behaviour to the
   REST API so the UI never needs to know which mode it is in.
------------------------------------------------------------------- */

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

/** Simulated latency only in offline demo mode. */
const LATENCY_MS = API_ENABLED ? 0 : 260;

/* ------------------------------------------------------------------
   Shared client-side validation (mirrors server rules; the server
   remains the source of truth for accept/reject).
------------------------------------------------------------------- */

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

/* ------------------------------------------------------------------
   Public API
------------------------------------------------------------------- */

/** Approved reviews for a product, newest first. */
export async function getReviews(productId: ProductId): Promise<Review[]> {
  if (API_ENABLED) {
    return request<Review[]>(`/api/products/${encodeURIComponent(productId)}/reviews`);
  }
  await delay(LATENCY_MS);
  return store
    .filter((review) => review.productId === productId && review.status === 'approved')
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

/** Aggregated rating roll-up. Always returns zeroed data when empty. */
export async function getRatingSummary(productId: ProductId): Promise<RatingSummary> {
  if (API_ENABLED) {
    return request<RatingSummary>(
      `/api/products/${encodeURIComponent(productId)}/reviews/summary`,
    );
  }
  await delay(LATENCY_MS);
  return computeRatingSummary(productId, store);
}

/**
 * Persist a review. The backend decides the initial status
 * (moderation default: `pending`), never the client.
 */
export async function submitReview(input: ReviewInput): Promise<Review> {
  const errors = validateReviewInput(input);
  if (errors.length > 0) throw new Error(errors.join(' '));

  if (API_ENABLED) {
    const { productId, ...body } = input;
    const created = await request<Review>(
      `/api/products/${encodeURIComponent(productId)}/reviews`,
      { method: 'POST', body },
    );
    notify();
    return created;
  }

  await delay(LATENCY_MS * 1.5);

  const review: Review = {
    id: createId(),
    productId: input.productId,
    customerName: input.customerName.trim(),
    email: input.email.trim(),
    rating: input.rating,
    comment: input.comment.trim(),
    createdAt: new Date().toISOString(),
    status: 'pending',
  };

  store = [review, ...store];
  writeStore(store);
  notify();

  return review;
}

function createId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `rev_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/* ------------------------------------------------------------------
   Admin API — requires the signed-in admin token (when API is on).
------------------------------------------------------------------- */

/** Every review (all statuses) for the admin panel, newest first. */
export async function listAllReviews(): Promise<Review[]> {
  if (API_ENABLED) {
    return request<Review[]>('/api/admin/reviews', { admin: true });
  }
  await delay(LATENCY_MS);
  return [...store].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

/** Approve / reject / restore to pending. */
export async function setReviewStatus(id: string, status: ReviewStatus): Promise<Review> {
  if (API_ENABLED) {
    const updated = await request<Review>(
      `/api/admin/reviews/${encodeURIComponent(id)}/status`,
      { method: 'PATCH', body: { status }, admin: true },
    );
    notify();
    return updated;
  }

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
  if (API_ENABLED) {
    const updated = await request<Review>(
      `/api/admin/reviews/${encodeURIComponent(id)}`,
      { method: 'PATCH', body: patch, admin: true },
    );
    notify();
    return updated;
  }

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
  if (API_ENABLED) {
    await request<void>(`/api/admin/reviews/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      admin: true,
    });
    notify();
    return;
  }

  await delay(LATENCY_MS / 2);
  if (!store.some((review) => review.id === id)) {
    throw new Error('That review no longer exists.');
  }
  store = store.filter((review) => review.id !== id);
  writeStore(store);
  notify();
}

/** Test/dev helper — clears locally mirrored reviews (offline mode only). */
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
