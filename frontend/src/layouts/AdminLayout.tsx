import { useEffect } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { ExternalLink, LogOut, ShieldCheck } from 'lucide-react';

import Logo from '../components/Logo';
import AdminSignIn from '../components/admin/AdminSignIn';
import { ReviewsProvider } from '../hooks/useReviews';
import { ClientReviewsProvider } from '../hooks/useClientReviews';
import { SettingsProvider } from '../hooks/useSettings';
import { useAdminSession } from '../hooks/useAdminSession';
import { API_ENABLED } from '../services/apiClient';

/**
 * Admin shell with its own chrome (no marketing header/footer).
 *
 * With VITE_API_BASE_URL configured the sign-in screen authenticates
 * against the backend (JWT). Without it, the sign-in screen is a DEMO
 * GATE only — no real authentication or authorisation.
 */
export default function AdminLayout() {
  const { signedIn, signedInAs, signOut } = useAdminSession();

  useEffect(() => {
    document.title = 'Review Admin | Cynbit prototype';
  }, []);

  return (
    <SettingsProvider>
      <ReviewsProvider>
        <ClientReviewsProvider>
          {!signedIn ? (
            <AdminSignIn />
          ) : (
            <div className="min-h-dvh bg-canvas">
              <a
                href="#admin-main"
                className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-full focus:bg-brand-600 focus:px-5 focus:py-3 focus:text-sm focus:font-bold focus:text-white"
              >
                Skip to admin content
              </a>

              {/* Top bar */}
              <header className="sticky top-0 z-40 border-b border-line bg-surface/90 backdrop-blur">
                <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-8">
                  <div className="flex items-center gap-4">
                    <Link to="/" aria-label="Cynbit Technologies — home">
                      <Logo />
                    </Link>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-sand-200 px-3 py-1.5 text-[10.5px] font-extrabold tracking-[0.12em] text-ink uppercase">
                      <ShieldCheck size={13} aria-hidden="true" />
                      Review admin · prototype
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {signedInAs && (
                      <span className="hidden text-[13px] font-semibold text-ink-mute sm:inline">
                        {signedInAs}
                      </span>
                    )}
                    <Link
                      to="/"
                      className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2.5 text-[11px] font-extrabold tracking-[0.1em] text-ink-soft uppercase transition-colors hover:border-brand-400 hover:text-brand-700"
                    >
                      <ExternalLink size={13} strokeWidth={2.2} aria-hidden="true" />
                      View site
                    </Link>
                    <button
                      type="button"
                      onClick={signOut}
                      className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-4 py-2.5 text-[11px] font-extrabold tracking-[0.1em] text-white uppercase transition-colors hover:bg-brand-700"
                    >
                      <LogOut size={13} strokeWidth={2.4} aria-hidden="true" />
                      Sign out
                    </button>
                  </div>
                </div>
              </header>

              <main id="admin-main">
                <Outlet />
              </main>

              <footer className="mx-auto max-w-[1240px] px-5 pt-2 pb-10 sm:px-8">
                <p className="border-t border-line pt-6 text-[12.5px] leading-relaxed text-ink-mute">
                  {API_ENABLED ? (
                    <>
                      Connected to the Cynbit backend — reviews and settings are stored in the
                      server database. Sign-in is verified by the API; sessions expire after 7
                      days.
                    </>
                  ) : (
                    <>
                      Prototype admin panel — data is stored in this browser only (localStorage).
                      There is no backend, database or real authentication; do not enter real
                      personal data.
                    </>
                  )}
                </p>
              </footer>
            </div>
          )}
        </ClientReviewsProvider>
      </ReviewsProvider>
    </SettingsProvider>
  );
}
