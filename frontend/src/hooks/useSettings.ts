export {
  SettingsProvider,
  useSettingsContext,
  type SettingsContextValue,
} from '../context/SettingsContext';

import { useSettingsContext } from '../context/SettingsContext';

/**
 * Section settings used by both the public pages (which sections to render)
 * and the admin panel (toggles).
 */
export function useSettings() {
  return useSettingsContext();
}
