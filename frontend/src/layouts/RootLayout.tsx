import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

import Header from '../components/Header';
import Footer from '../components/Footer';
import ScrollManager from '../components/ScrollManager';
import { ReviewsProvider } from '../hooks/useReviews';
import { ClientReviewsProvider } from '../hooks/useClientReviews';
import { SettingsProvider } from '../hooks/useSettings';

/** Document title mapping for the routes covered by this prototype. */
const TITLES: Record<string, string> = {
  '/': 'Cynbit Technologies | AI Automation & Software Solutions',
  '/products': 'Proprietary Software Suite | Cynbit Studio, TenantEase & Revio | Cynbit Technologies',
  '/case-studies': 'Success Blueprints | Cynbit Technologies Case Studies',
  '/contact': 'Inquiry Hub | Start Your Next Project With Cynbit Technologies',
};

/** App shell: providers, persistent chrome, and the routed page body. */
export default function RootLayout() {
  const { pathname } = useLocation();

  useEffect(() => {
    document.title = TITLES[pathname] ?? 'Cynbit Technologies';
  }, [pathname]);

  return (
    <SettingsProvider>
      <ReviewsProvider>
        <ClientReviewsProvider>
          <ScrollManager />
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-full focus:bg-brand-600 focus:px-5 focus:py-3 focus:text-sm focus:font-bold focus:text-white"
          >
            Skip to main content
          </a>
          <Header />
          <main id="main-content">
            <Outlet />
          </main>
          <Footer />
        </ClientReviewsProvider>
      </ReviewsProvider>
    </SettingsProvider>
  );
}
