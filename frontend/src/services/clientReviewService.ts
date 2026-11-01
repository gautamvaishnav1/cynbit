import type {
  ClientRatingSummary,
  ClientReview,
  ClientReviewInput,
  ReviewStatus,
} from '../types';
import { seedClientReviews } from '../data/clientReviews';
import { computeClientRatingSummary } from '../utils/rating';
import { API_ENABLED, request } from './apiClient';

/* ==================================================================
   CLIENT-REVIEW SERVICE — REST-backed (JSON.md contract).

   With VITE_API_BASE_URL configured:

     getClientReviews()           <-  GET    /api/client-reviews
     getClientRatingSummary()     <-  GET    /api/client-reviews/summary
     listAllClientReviews()       <-  GET    /api/admin/client-reviews
     createClientReview(input)    <-  POST   /api/admin/client-reviews
     updateClientReview(id,…)     <-  PATCH  /api/admin/client-reviews/:id
     setClientReviewStatus(id,…)  <-  PATCH  /api/admin/client-reviews/:id/status
     deleteClientReview(id)       <-  DELETE /api/admin/client-reviews/:id

   Without it, falls back to a localStorage mirror (offline demo mode).
   ================================================================== */

const STORAGE_KEY = 'cynbit.prototype.clientReviews.v1';

export const MIN_CLIENT_REVIEW_LENGTH = 20;
export const MAX_CLIENT_REVIEW_LENGTH = 600;

const LATENCY_MS = API_ENABLED ? 0 : 260;

/* ------------------------------------------------------------------
   Local (offline/demo) fallback store.
------------------------------------------------------------------- */

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

/** Shared validation (mirrors server rules — the server decides). */
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

/* ------------------------------------------------------------------
   Public API
------------------------------------------------------------------- */

/** Approved client reviews for the public site, newest first. */
export async function getClientReviews(): Promise<ClientReview[]> {
  if (API_ENABLED) {
    return request<ClientReview[]>('/api/client-reviews');
  }
  await delay(LATENCY_MS);
  return store
    .filter((review) => review.status === 'approved')
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

/** Aggregated roll-up of approved client reviews. Always zeroed when empty. */
export async function getClientRatingSummary(): Promise<ClientRatingSummary> {
  if (API_ENABLED) {
    return request<ClientRatingSummary>('/api/client-reviews/summary');
  }
  await delay(LATENCY_MS);
  return computeClientRatingSummary(store);
}

/* ------------------------------------------------------------------
   Admin API
------------------------------------------------------------------- */

/** Every client review (all statuses) for the admin panel, newest first. */
export async function listAllClientReviews(): Promise<ClientReview[]> {
  if (API_ENABLED) {
    return request<ClientReview[]>('/api/admin/client-reviews', { admin: true });
  }
  await delay(LATENCY_MS);
  return [...store].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

/**
 * Create a client review (admin panel). The backend decides the initial
 * status from `autoApproveSubmissions` — the client never sends status.
 */
export async function createClientReview(input: ClientReviewInput): Promise<ClientReview> {
  const errors = validateClientReviewInput(input);
  if (errors.length > 0) throw new Error(errors.join(' '));

  if (API_ENABLED) {
    const body: Record<string, unknown> = {
      clientName: input.clientName,
      clientTitle: input.clientTitle,
      rating: input.rating,
      comment: input.comment,
    };
    if (input.source && input.source.trim()) body.source = input.source.trim();
    const created = await request<ClientReview>('/api/admin/client-reviews', {
      method: 'POST',
      body,
      admin: true,
    });
    notify();
    return created;
  }

  await delay(LATENCY_MS);
  const review: ClientReview = {
    id: createId(),
    clientName: input.clientName.trim(),
    clientTitle: input.clientTitle.trim(),
    rating: input.rating,
    comment: input.comment.trim(),
    ...(input.source && input.source.trim() ? { source: input.source.trim() } : {}),
    createdAt: new Date().toISOString(),
    status: 'pending',
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
  if (API_ENABLED) {
    const body: Record<string, unknown> = {};
    if (patch.clientName !== undefined) body.clientName = patch.clientName;
    if (patch.clientTitle !== undefined) body.clientTitle = patch.clientTitle;
    if (patch.rating !== undefined) body.rating = patch.rating;
    if (patch.comment !== undefined) body.comment = patch.comment;
    if (patch.source !== undefined) body.source = patch.source;
    const updated = await request<ClientReview>(
      `/api/admin/client-reviews/${encodeURIComponent(id)}`,
      { method: 'PATCH', body, admin: true },
    );
    notify();
    return updated;
  }

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
  if (API_ENABLED) {
    const updated = await request<ClientReview>(
      `/api/admin/client-reviews/${encodeURIComponent(id)}/status`,
      { method: 'PATCH', body: { status }, admin: true },
    );
    notify();
    return updated;
  }

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
  if (API_ENABLED) {
    await request<void>(`/api/admin/client-reviews/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      admin: true,
    });
    notify();
    return;
  }

  await delay(LATENCY_MS / 2);
  if (!store.some((review) => review.id === id)) {
    throw new Error('That client review no longer exists.');
  }
  store = store.filter((review) => review.id !== id);
  writeStore(store);
  notify();
}

/** Test/dev helper — clears locally mirrored client reviews (offline mode). */
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
