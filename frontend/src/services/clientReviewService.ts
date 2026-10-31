import type {
  ClientRatingSummary,
  ClientReview,
  ClientReviewInput,
  ReviewStatus,
} from '../types';
import { seedClientReviews } from '../data/clientReviews';
import { computeClientRatingSummary } from '../utils/rating';
import { getSettingsSnapshot } from './settingsService';

/* ==================================================================
   PROTOTYPE CLIENT-REVIEW SERVICE — NO BACKEND, NO DATABASE.

   Real customer ratings & reviews of Cynbit Technologies (the company),
   entered by the admin through the prototype admin panel. Isolated behind
   an async interface so a future REST layer can replace it cleanly:

     getClientReviews()           <-  GET  /api/client-reviews?status=approved
     listAllClientReviews()       <-  GET  /api/admin/client-reviews
     createClientReview(input)    <-  POST /api/admin/client-reviews
     updateClientReview(id,…)     <-  PATCH /api/admin/client-reviews/:id
     setClientReviewStatus(id,…)  <-  PATCH /api/admin/client-reviews/:id/status
     deleteClientReview(id)       <-  DELETE /api/admin/client-reviews/:id

   State lives in memory and is mirrored to localStorage so moderation
   survives a refresh. Nothing is ever transmitted anywhere.
   ================================================================== */

const LATENCY_MS = 380;
const STORAGE_KEY = 'cynbit.prototype.clientReviews.v1';

export const MIN_CLIENT_REVIEW_LENGTH = 20;
export const MAX_CLIENT_REVIEW_LENGTH = 600;

function readStore(): ClientReview[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [...seedClientReviews];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [...seedClientReviews];
    return parsed as ClientReview[];
  } catch {
    return [...seedClientReviews];
  }
}

function writeStore(reviews: ClientReview[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
  } catch {
    /* Storage may be unavailable — in-memory copy still works. */
  }
}

let store: ClientReview[] = readStore();
const listeners = new Set<() => void>();

function notify(): void {
  listeners.forEach((listener) => listener());
}

/** Subscribe to local data mutations (used by the ClientReviewsProvider). */
export function subscribeClientReviews(listener: () => void): () => void {
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
  return `cln_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Server-side-equivalent validation. Returned as user-facing messages. */
export function validateClientReviewInput(input: ClientReviewInput): string[] {
  const errors: string[] = [];

  if (!input.clientName.trim()) {
    errors.push('Please enter the client name.');
  } else if (input.clientName.trim().length > 80) {
    errors.push('Client name must be 80 characters or fewer.');
  }

  if (!input.clientTitle.trim()) {
    errors.push('Please enter the client role or company.');
  } else if (input.clientTitle.trim().length > 120) {
    errors.push('Role / company must be 120 characters or fewer.');
  }

  if (input.source && input.source.trim().length > 60) {
    errors.push('Source must be 60 characters or fewer.');
  }

  if (!Number.isInteger(input.rating) || input.rating < 1 || input.rating > 5) {
    errors.push('Please select a star rating between 1 and 5.');
  }

  const comment = input.comment.trim();
  if (comment.length < MIN_CLIENT_REVIEW_LENGTH) {
    errors.push(`The review must be at least ${MIN_CLIENT_REVIEW_LENGTH} characters.`);
  } else if (comment.length > MAX_CLIENT_REVIEW_LENGTH) {
    errors.push(`The review must be ${MAX_CLIENT_REVIEW_LENGTH} characters or fewer.`);
  }

  return errors;
}

/** Approved client reviews for the public site, newest first. */
export async function getClientReviews(): Promise<ClientReview[]> {
  await delay(LATENCY_MS);
  return store
    .filter((review) => review.status === 'approved')
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

/** Every client review (all statuses) for the admin panel, newest first. */
export async function listAllClientReviews(): Promise<ClientReview[]> {
  await delay(LATENCY_MS);
  return [...store].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

/** Aggregated roll-up of approved client reviews. Always zeroed when empty. */
export async function getClientRatingSummary(): Promise<ClientRatingSummary> {
  await delay(LATENCY_MS);
  return computeClientRatingSummary(store);
}

/**
 * Create a client review (admin panel).
 * Status mirrors the auto-approve setting, exactly like a backend would
 * decide server-side; without it the review waits for moderation.
 */
export async function createClientReview(input: ClientReviewInput): Promise<ClientReview> {
  await delay(LATENCY_MS);

  const errors = validateClientReviewInput(input);
  if (errors.length > 0) {
    throw new Error(errors.join(' '));
  }

  const { autoApproveSubmissions } = getSettingsSnapshot();
  const review: ClientReview = {
    id: createId(),
    clientName: input.clientName.trim(),
    clientTitle: input.clientTitle.trim(),
    rating: input.rating,
    comment: input.comment.trim(),
    ...(input.source && input.source.trim() ? { source: input.source.trim() } : {}),
    createdAt: new Date().toISOString(),
    status: autoApproveSubmissions ? 'approved' : 'pending',
  };

  store = [review, ...store];
  writeStore(store);
  notify();

  return review;
}

/** Edit an existing client review (name, role, rating, body, source). */
export async function updateClientReview(
  id: string,
  patch: Partial<ClientReviewInput>,
): Promise<ClientReview> {
  await delay(LATENCY_MS);

  const existing = store.find((review) => review.id === id);
  if (!existing) throw new Error('That client review no longer exists.');

  const merged: ClientReviewInput = {
    clientName: patch.clientName ?? existing.clientName,
    clientTitle: patch.clientTitle ?? existing.clientTitle,
    rating: patch.rating ?? existing.rating,
    comment: patch.comment ?? existing.comment,
    source: patch.source ?? existing.source,
  };

  const errors = validateClientReviewInput(merged);
  if (errors.length > 0) throw new Error(errors.join(' '));

  const updated: ClientReview = {
    ...existing,
    clientName: merged.clientName.trim(),
    clientTitle: merged.clientTitle.trim(),
    rating: merged.rating,
    comment: merged.comment.trim(),
    ...(merged.source && merged.source.trim() ? { source: merged.source.trim() } : {}),
  };

  store = store.map((review) => (review.id === id ? updated : review));
  writeStore(store);
  notify();

  return updated;
}

/** Approve / reject / restore to pending. */
export async function setClientReviewStatus(
  id: string,
  status: ReviewStatus,
): Promise<ClientReview> {
  await delay(LATENCY_MS / 2);

  const existing = store.find((review) => review.id === id);
  if (!existing) throw new Error('That client review no longer exists.');

  const updated: ClientReview = { ...existing, status };
  store = store.map((review) => (review.id === id ? updated : review));
  writeStore(store);
  notify();

  return updated;
}

/** Permanently remove a client review. */
export async function deleteClientReview(id: string): Promise<void> {
  await delay(LATENCY_MS / 2);

  if (!store.some((review) => review.id === id)) {
    throw new Error('That client review no longer exists.');
  }

  store = store.filter((review) => review.id !== id);
  writeStore(store);
  notify();
}

/** Test/dev helper — clears every locally stored client review. */
export function resetClientReviews(): void {
  store = [...seedClientReviews];
  writeStore(store);
  notify();
}

export const clientReviewService = {
  getClientReviews,
  listAllClientReviews,
  getClientRatingSummary,
  createClientReview,
  updateClientReview,
  setClientReviewStatus,
  deleteClientReview,
  validateClientReviewInput,
  subscribeClientReviews,
  resetClientReviews,
  MIN_CLIENT_REVIEW_LENGTH,
  MAX_CLIENT_REVIEW_LENGTH,
};

export default clientReviewService;

/** Re-exported for form parity with the product review service. */
export { EMAIL_PATTERN };
