import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Keeps browser scrolling behaviour correct for a client-rendered app:
 *  - top-level navigation scrolls back to the top
 *  - in-page hashes (#cynbit-studio, #inquiry) scroll to their target
 *  - hash-only changes do not reset scroll position unnecessarily
 */
export default function ScrollManager() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const id = hash.replace(/^#/, '');
      // Wait one frame so the target section exists after route render.
      const frame = window.requestAnimationFrame(() => {
        const target = document.getElementById(id);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
      return () => window.cancelAnimationFrame(frame);
    }

    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    return undefined;
  }, [pathname, hash]);

  return null;
}
