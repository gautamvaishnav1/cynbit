import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import type { ReviewSectionSettings } from '../types';
import settingsService from '../services/settingsService';

export interface SettingsContextValue {
  settings: ReviewSectionSettings;
  /** True while a settings write is being processed. */
  saving: boolean;
  error: string | null;
  updateSettings: (patch: Partial<ReviewSectionSettings>) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

/**
 * Shared source of truth for the admin panel's section settings.
 *
 * Loads once from the isolated settings service and stays subscribed to
 * mutations, so toggling a section in /admin updates the public site
 * immediately. Swap `settingsService` for a REST client later — this
 * provider does not need to change.
 */
export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<ReviewSectionSettings>(
    () => settingsService.getSettingsSnapshot(),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    void settingsService.getSettings().then((loaded) => {
      if (active) setSettings(loaded);
    });

    const unsubscribe = settingsService.subscribeSettings(() => {
      setSettings(settingsService.getSettingsSnapshot());
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const updateSettings = useCallback(async (patch: Partial<ReviewSectionSettings>) => {
    setSaving(true);
    setError(null);
    try {
      const next = await settingsService.updateSettings(patch);
      setSettings(next);
    } catch {
      setError('Settings could not be saved. Please try again.');
    } finally {
      setSaving(false);
    }
  }, []);

  const value = useMemo<SettingsContextValue>(
    () => ({ settings, saving, error, updateSettings }),
    [settings, saving, error, updateSettings],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

/** Accessor with a helpful error when used outside the provider. */
export function useSettingsContext(): SettingsContextValue {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettingsContext must be used inside a <SettingsProvider>');
  }
  return context;
}
