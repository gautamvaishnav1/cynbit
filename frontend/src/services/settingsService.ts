import type { ReviewSectionSettings } from '../types';
import { API_ENABLED, request } from './apiClient';

/* ==================================================================
   SECTION-SETTINGS SERVICE — REST-backed (JSON.md contract).

   Backs the admin panel's "Section settings" tab:

     getSettings()          <-  GET   /api/admin/review-settings
     updateSettings(patch)  <-  PATCH /api/admin/review-settings

   The localStorage snapshot (offline demo mode) exists only so the
   prototype still runs without the backend configured.
   ================================================================== */

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
 * Synchronous snapshot of the current settings (offline fallback only).
 * UI code should prefer the SettingsProvider/hook so it re-renders.
 */
export function getSettingsSnapshot(): ReviewSectionSettings {
  return { ...store };
}

/** Update the cached snapshot (used after every server read/write). */
function cacheSettings(next: ReviewSectionSettings): ReviewSectionSettings {
  store = { ...next };
  return { ...next };
}

/** Current settings (async — mirrors GET /api/admin/review-settings). */
export async function getSettings(): Promise<ReviewSectionSettings> {
  if (API_ENABLED) {
    const server = await request<ReviewSectionSettings>(
      '/api/admin/review-settings',
      { admin: true },
    );
    return cacheSettings(server);
  }

  return { ...store };
}

/** Apply a partial update (async — mirrors PATCH /api/admin/review-settings). */
export async function updateSettings(
  patch: Partial<ReviewSectionSettings>,
): Promise<ReviewSectionSettings> {
  if (API_ENABLED) {
    const updated = await request<ReviewSectionSettings>(
      '/api/admin/review-settings',
      { method: 'PATCH', body: patch, admin: true },
    );
    cacheSettings(updated);
    notify();
    return { ...updated };
  }

  store = { ...store, ...patch };
  writeStore(store);
  notify();
  return { ...store };
}

/** Restore the defaults (used by the admin "reset prototype data" action). */
export async function resetSettings(): Promise<void> {
  if (API_ENABLED) {
    await request<ReviewSectionSettings>('/api/admin/review-settings', {
      method: 'PATCH',
      body: { ...DEFAULT_SETTINGS },
      admin: true,
    });
    cacheSettings({ ...DEFAULT_SETTINGS });
    notify();
    return;
  }
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
