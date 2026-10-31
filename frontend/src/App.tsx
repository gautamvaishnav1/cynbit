import { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

import RootLayout from './layouts/RootLayout';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import CaseStudiesPage from './pages/CaseStudiesPage';
import CaseStudyDetailPage from './pages/CaseStudyDetailPage';
import ContactPage from './pages/ContactPage';
import NotFoundPage from './pages/NotFoundPage';

// The admin panel is a separate, non-marketing surface — code-split it so
// visitors to the public site don't download the admin UI.
const AdminLayout = lazy(() => import('./layouts/AdminLayout'));
const AdminPage = lazy(() => import('./pages/AdminPage'));

/** Accessible loading indicator shown while a lazy route chunk loads. */
function RouteFallback() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-dvh items-center justify-center bg-canvas px-5"
    >
      <div className="flex items-center gap-3 text-ink-soft">
        <Loader2 size={20} className="animate-spin text-brand-600" aria-hidden="true" />
        <span className="text-[14px] font-semibold">Loading…</span>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route index element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/case-studies" element={<CaseStudiesPage />} />
        <Route path="/case-studies/:slug" element={<CaseStudyDetailPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Prototype review admin panel — own chrome, demo sign-in gate.
          Lazy-loaded; the Suspense boundary above AdminLayout also covers
          the index <AdminPage /> rendered through its <Outlet />. */}
      <Route
        path="/admin"
        element={
          <Suspense fallback={<RouteFallback />}>
            <AdminLayout />
          </Suspense>
        }
      >
        <Route index element={<AdminPage />} />
      </Route>
    </Routes>
  );
}
