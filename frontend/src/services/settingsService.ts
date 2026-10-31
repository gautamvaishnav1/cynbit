import type { ReviewSectionSettings } from '../types';

/* ==================================================================
   PROTOTYPE SECTION-SETTINGS SERVICE — NO BACKEND.

   Backs the admin panel's "Section settings" tab: which review sections
   the public site shows and whether new submissions need moderation.

   Async shape mirrors a future REST layer:

     getSettings()          <-  GET  /api/admin/review-settings
     updateSettings(patch)  <-  PATCH /api/admin/review-settings

   State lives in memory and is mirrored to localStorage. The synchronous
   snapshot is used by reviewService.submitReview to decide the initial
   moderation status of a submission (a real backend makes that decision
   server-side).
   ================================================================== */

const LATENCY_MS = 220;
const STORAGE_KEY = 'cynbit.prototype.reviewSettings.v1';

/** Sensible defaults: everything visible, moderation ON (no auto-approve). */
export const DEFAULT_SETTINGS: ReviewSectionSettings = {
  productReviewsEnabled: true,
  clientReviewsEnabled: true,
  autoApproveSubmissions: false,
};

function readStore(): ReviewSectionSettings {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return { ...DEFAULT_SETTINGS };
    const value = parsed as Partial<ReviewSectionSettings>;
    return {
      productReviewsEnabled:
        typeof value.productReviewsEnabled === 'boolean'
          ? value.productReviewsEnabled
          : DEFAULT_SETTINGS.productReviewsEnabled,
      clientReviewsEnabled:
        typeof value.clientReviewsEnabled === 'boolean'
          ? value.clientReviewsEnabled
          : DEFAULT_SETTINGS.clientReviewsEnabled,
      autoApproveSubmissions:
        typeof value.autoApproveSubmissions === 'boolean'
          ? value.autoApproveSubmissions
          : DEFAULT_SETTINGS.autoApproveSubmissions,
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

function writeStore(settings: ReviewSectionSettings): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    /* Storage may be unavailable — in-memory copy still works. */
  }
}

let store: ReviewSectionSettings = readStore();
const listeners = new Set<() => void>();

function notify(): void {
  listeners.forEach((listener) => listener());
}

/** Subscribe to settings mutations (used by the SettingsProvider). */
export function subscribeSettings(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Synchronous snapshot of the current settings.
 * Used internally (e.g. by reviewService) — UI code should prefer the
 * SettingsProvider/hook so it re-renders on changes.
 */
export function getSettingsSnapshot(): ReviewSectionSettings {
  return { ...store };
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

/** Current settings (async — mirrors GET /api/admin/review-settings). */
export async function getSettings(): Promise<ReviewSectionSettings> {
  await delay(LATENCY_MS);
  return { ...store };
}

/** Apply a partial update and notify subscribers (async — mirrors PATCH). */
export async function updateSettings(
  patch: Partial<ReviewSectionSettings>,
): Promise<ReviewSectionSettings> {
  await delay(LATENCY_MS);
  store = { ...store, ...patch };
  writeStore(store);
  notify();
  return { ...store };
}

/** Restore the defaults (used by the admin "reset prototype data" action). */
export async function resetSettings(): Promise<void> {
  await delay(LATENCY_MS);
  store = { ...DEFAULT_SETTINGS };
  writeStore(store);
  notify();
}

export const settingsService = {
  getSettings,
  getSettingsSnapshot,
  updateSettings,
  resetSettings,
  subscribeSettings,
  DEFAULT_SETTINGS,
};

export default settingsService;
