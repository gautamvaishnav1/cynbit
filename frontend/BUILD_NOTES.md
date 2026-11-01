# Cynbit Frontend — Build & Change Documentation

**Project:** `cynbit-frontend` · v0.1.0
**Location:** `frontend/` (React + TypeScript + Vite + Tailwind v4)
**Purpose:** Independent frontend-only recreation of the public [cynbit.in](https://www.cynbit.in) site, plus a product reviews & ratings feature, a prototype admin panel, a client-reviews section, and production hardening.

> This document records **what was built** and **what changed**, so anyone picking up the project can see the full history of decisions and modifications in one place. For the backend API contract, see [`JSON.md`](./JSON.md). For a feature/usage overview, see [`README.md`](./README.md).

---

## Table of contents

1. [Tech stack & conventions](#1-tech-stack--conventions)
2. [Build phases (what was created)](#2-build-phases-what-was-created)
3. [Change log by area](#3-change-log-by-area)
4. [Production-readiness changes (latest pass)](#4-production-readiness-changes-latest-pass)
5. [Data & state architecture](#5-data--state-architecture)
6. [Routes](#6-routes)
7. [Full file inventory](#7-full-file-inventory)
8. [Commands](#8-commands)
9. [Known placeholder items before deploy](#9-known-placeholder-items-before-deploy)

---

## 1. Tech stack & conventions

| Concern | Choice | Notes |
| --- | --- | --- |
| Framework | React 19 + TypeScript (Vite 7) | `tsc -b && vite build` |
| Styling | Tailwind CSS **v4** via `@tailwindcss/vite` | Design tokens in `src/index.css` `@theme` block |
| Routing | `react-router-dom` v7 | Client-side routing, SPA fallback configs included |
| Icons | `lucide-react` | No icon font |
| Fonts | Manrope (body) + Plus Jakarta Sans (display) | Google Fonts, `preconnect`ed |
| State | React Context + hooks | No state library |
| Data | Isolated async service modules | Currently `localStorage`-backed; swap-in ready for REST |

**Conventions used throughout:**
- **No path aliases** — all imports are relative.
- **Design tokens** — colors (`brand`, `ink`, `canvas`, `sand`, `line`), fonts, radii are Tailwind v4 `@theme` variables, not hard-coded hex in components.
- **Honest data** — every count/average/distribution is computed from real data. Seeds are empty; nothing fabricated ships.
- **Accessible by default** — semantic landmarks, one `h1`/page, skip link, focus rings, keyboard-operable controls, `aria-*` attributes.
- **Service isolation** — components never touch `localStorage` directly; they call service functions that are annotated with the REST endpoint they mirror.

---

## 2. Build phases (what was created)

The project was delivered in successive phases. High-level order:

1. **Scaffold** — Vite + React + TS + Tailwind v4, design tokens, base `ui/` primitives (Button, Section, Icon, Skeleton, SectionHeading).
2. **Pages** — Home, Products (priority), Case Studies (+ detail), Contact, NotFound. Content transcribed from the public site only.
3. **Reviews & ratings feature** — per-product review sections: star summary, 5→1 distribution, sortable list, modal submission form with validation. Empty-by-default.
4. **Admin panel** — sign-in demo gate, dashboard stats, product-review moderation, client-review management, section settings with persisted toggles + reset.
5. **Client reviews section** — public "Rated by the teams we build for" section on Home, admin-entered only.
6. **Backend handoff doc** — `JSON.md` with full API contract (17 endpoints, models, SQL schema).
7. **Production hardening** — the most recent pass (detailed in §4): `.gitignore`, SEO/social meta, `robots.txt` + `sitemap.xml`, SPA fallback, ErrorBoundary, route code-splitting, a11y fixes, README cleanup.

---

## 3. Change log by area

### 3.1 Routing & entry

| File | Change |
| --- | --- |
| `src/main.tsx` | Wrapped `<App/>` in a top-level `<ErrorBoundary>` inside `<StrictMode>`. |
| `src/App.tsx` | Added the `/admin` route (own `AdminLayout` chrome, demo sign-in gate). **Then** converted `/admin` to a **lazy** route (`React.lazy` + `Suspense`) with an accessible `RouteFallback` loader so admin UI is code-split from the public bundle. |
| `src/layouts/RootLayout.tsx` | Now nests `SettingsProvider` → `ReviewsProvider` → `ClientReviewsProvider` around the marketing shell; sets per-route `document.title`. |
| `src/layouts/AdminLayout.tsx` | **New.** Admin shell (own sticky top bar, no marketing header/footer). Renders `AdminSignIn` when signed out, the dashboard `Outlet` when signed in. |
| `src/components/ScrollManager.tsx` | Scrolls to top on path change, honors in-page hashes (`#inquiry`, `#cynbit-studio`). |

### 3.2 Types & data

| File | Change |
| --- | --- |
| `src/types/index.ts` | Added `ClientReview`, `ClientReviewInput`, `ClientRatingSummary`, `ReviewSectionSettings`, `AdminStatusFilter`. `ReviewStatus` doc updated to describe moderation (`pending → approved/rejected`). |
| `src/data/reviews.ts` | Product-review seed — **intentionally empty (`[]`)**. |
| `src/data/clientReviews.ts` | **New.** Client-review seed — **intentionally empty (`[]`)**. |
| `src/data/products.ts`, `src/data/site.ts` | Static public-site content (products, case studies, FAQs, nav). Unchanged content; data-only. |
| `src/utils/rating.ts` | Added `computeClientRatingSummary()` alongside `computeRatingSummary()`, `clampRating`, `approvedFor`, `starShare`, `sortReviews`, `formatAverage`, `formatReviewDate`. |

### 3.3 Services (isolated data layers — dual-mode: REST API or localStorage)

All three services are **dual-mode**. When `VITE_API_BASE_URL` is set (`frontend/.env`), every call goes through the shared fetch wrapper `src/services/apiClient.ts` to the real backend (JSON.md contract); without it, they fall back to a `localStorage` mirror so the prototype still runs offline. After every API mutation the services call `notify()` so contexts re-fetch and public/admin views stay in sync.

| File | Change |
| --- | --- |
| `src/services/apiClient.ts` | **New.** Shared fetch wrapper: base URL from `VITE_API_BASE_URL`, JSON handling, admin `Authorization: Bearer` token (localStorage key `cynbit.admin.token`), `ApiError` envelope parsing (`{ error: { code, message, fields } }`), exports `API_ENABLED`. |
| `src/services/reviewService.ts` | Switched persistence `sessionStorage → localStorage` (moderation survives refresh). Storage key bumped to `cynbit.prototype.reviews.v2`. `submitReview` now creates reviews as **`pending`** unless the admin auto-approve setting is on. Added admin API: `listAllReviews`, `setReviewStatus`, `updateReview`, `deleteReview`, `subscribeReviews`. **REST-backed:** public list/summary/submit → `/api/products/:id/reviews[...]`; admin CRUD → `/api/admin/reviews[...]`. |
| `src/services/clientReviewService.ts` | **New.** Full CRUD for company reviews (`getClientReviews`, `listAllClientReviews`, `getClientRatingSummary`, `createClientReview`, `updateClientReview`, `setClientReviewStatus`, `deleteClientReview`) + validation. Mirrors `localStorage` key `cynbit.prototype.clientReviews.v1`. **REST-backed:** `/api/client-reviews[...]` + `/api/admin/client-reviews[...]`. |
| `src/services/settingsService.ts` | **New.** Singleton section settings (`getSettings`, `updateSettings`, `resetSettings`, `getSettingsSnapshot`, `subscribeSettings`). Key `cynbit.prototype.reviewSettings.v1`. Defaults: both sections ON, auto-approve OFF. **REST-backed:** public read → `GET /api/review-settings` (no auth needed on public pages); admin write → `PATCH /api/admin/review-settings`. |

### 3.4 Contexts & hooks

| File | Change |
| --- | --- |
| `src/context/ReviewsContext.tsx` | Shared approved-reviews store; subscribes to `reviewService` so admin changes reflect publicly. |
| `src/context/ClientReviewsContext.tsx` | **New.** Approved client reviews + derived summary for the public section. |
| `src/context/SettingsContext.tsx` | **New.** Shared settings state for both public toggles and admin controls. |
| `src/hooks/useReviews.ts` | Added `useAllReviews()` — admin-side hook: all reviews (all statuses), busy-id tracking, `setStatus`/`update`/`remove`/`refresh`. |
| `src/hooks/useClientReviews.ts` | **New.** Public `useClientReviews()` + admin `useAllClientReviews()` (with `create`/`update`/`setStatus`/`remove`). |
| `src/hooks/useSettings.ts` | **New.** Accessor for the settings context. |
| `src/hooks/useAdminSession.ts` | **New, then fixed.** Originally used per-component `useState` (bug: `AdminLayout` and `AdminSignIn` desynced). Rewritten to a **module-level store + subscribers** so every consumer shares one session source of truth. Demo-only flag in `sessionStorage` (`cynbit.prototype.adminSession.v1`). |

### 3.5 Components

**New review components** (`src/components/review/`): `StarRating`, `RatingSummary`, `RatingDistribution`, `ReviewCard`, `ReviewFilters`, `ReviewForm`, `ReviewModal`, `ProductReviewSection`. `ReviewForm`/`ProductReviewSection` copy is moderation-aware (mentions "awaiting approval" vs "published instantly" based on the auto-approve setting).

**New admin components** (`src/components/admin/`):
- `AdminSignIn.tsx` — demo gate with input validation + "no real authentication" warning.
- `AdminModal.tsx` — generic dialog (portal, focus trap, Escape, scroll lock, focus restore).
- `AdminProductReviews.tsx` — moderation list with status filters (counts), product filter, Approve/Reject/Edit/Delete (confirm-on-delete), edit modal.
- `AdminClientReviews.tsx` — client-review list + add/edit/approve/reject/delete.
- `ClientReviewForm.tsx` — admin entry form (name, role/company, optional source, stars, 20–600 char body, live counter, validation).
- `AdminSettingsPanel.tsx` — 3 switches (instant, persisted) + armed "Reset all prototype data".
- `StatusBadge.tsx` — status pill + reusable `StatusFilter` radio group.

**New public section**: `src/components/sections/ClientReviewsSection.tsx` — company average rating + approved client-review cards; honest empty state; hidden entirely when toggled off.

**New production component**: `src/components/ErrorBoundary.tsx` — see §4.

**Modified**: `Footer.tsx` (added "Review Admin (prototype)" link under a "Prototype" nav group), `Header.tsx` (aria-current fix — see §4).

### 3.6 Pages

| File | Change |
| --- | --- |
| `src/pages/HomePage.tsx` | Inserted `<ClientReviewsSection />` between the testimonials band and the CTA banner. |
| `src/pages/ProductsPage.tsx` | Review sections now gated by `settings.productReviewsEnabled`. |
| `src/pages/AdminPage.tsx` | **New.** Admin dashboard: 4 stat cards (honest zeros), arrow-key-navigable tabs (Product reviews / Client reviews / Section settings). |

### 3.7 Styles

| File | Change |
| --- | --- |
| `src/index.css` | Tailwind v4 `@theme` tokens (colors, fonts), component classes (`btn-primary`, `btn-outline`, `btn-ghost`, `card`, `eyebrow`, `field-*`), `dot-grid` utility. Unchanged this pass except being the token source of truth. |

---

## 4. Production-readiness changes (latest pass)

A full production audit was run and every gap fixed. **Build passes; all 6 routes verified with 0 console errors.**

| # | Issue found | Fix applied | Files |
| --- | --- | --- | --- |
| 1 | No `.gitignore` (risk of committing `node_modules`, `dist`, secrets) | Added `.gitignore` covering deps, build output, `.env*`, logs, editor/OS junk, `*.tsbuildinfo`, `.vite/` | `.gitignore` (new) |
| 2 | `robots.txt` referenced a **non-existent** external sitemap and didn't block `/admin` | Rewrote: `Disallow: /admin`, points to local `sitemap.xml`, notes about replacing the domain | `public/robots.txt` |
| 3 | No `sitemap.xml` | Created one listing the 4 **public** routes (`/admin` excluded), placeholder domain clearly marked | `public/sitemap.xml` (new) |
| 4 | No Open Graph / Twitter meta, no canonical URL | Added `og:title/description/type/url/site_name/image`, `twitter:card/title/description/image`, `<link rel="canonical">` | `index.html` |
| 5 | No SPA fallback → deep links (`/products`, `/admin`) broke on refresh on static hosts | Added Netlify `_redirects` (`/* /index.html 200`) and `vercel.json` rewrites | `public/_redirects` (new), `vercel.json` (new) |
| 6 | No error boundary → a render crash = blank white page | Created `ErrorBoundary` (friendly recovery screen, reload/back-home actions, collapsible technical details, `console.error` for monitoring) and wrapped the app | `src/components/ErrorBoundary.tsx` (new), `src/main.tsx` |
| 7 | Single large JS bundle (452.83 kB) — admin code shipped to every visitor | Lazy-loaded `/admin` (`React.lazy` + `Suspense` + accessible `RouteFallback`). **Main bundle → 418.23 kB**; admin split into `AdminLayout` (7.20 kB) + `AdminPage` (32.33 kB), loaded only on visit | `src/App.tsx` |
| 8 | README referenced non-existent hooks (`useLockBodyScroll`, `useMediaQuery`) | Removed stale lines; file tree now matches reality; added a "Production readiness" section | `README.md` |
| 9 | Drawer/dropdown nav links lacked `aria-current` (desktop `NavLink` already had it) | Upgraded dropdown `MenuPanelItem` and drawer direct links from `Link` → `NavLink` so the active route is announced to assistive tech | `src/components/Header.tsx` |

### Bundle impact (before → after code-splitting)

```
index.html                1.16 kB → 2.64 kB   (added meta tags)
index CSS                55.72 kB → 54.94 kB  (10.15 kB gzip)
index JS (public)       452.83 kB → 418.23 kB (125.00 kB gzip)
AdminLayout JS               —  →  7.20 kB    (lazy)
AdminPage JS                 —  → 32.33 kB    (lazy)
```

### Browser verification (all on the fixed build)
- `/`, `/products`, `/case-studies`, `/case-studies/:slug`, `/contact`, `/admin`, and a bogus 404 route — **0 console errors each**.
- `/admin` lazy chunk loads → sign-in → dashboard renders all 3 tabs.
- Products page shows 3 honest empty review states with cleared data.
- `dist/` confirmed to contain `robots.txt`, `sitemap.xml`, `_redirects`, and the meta-tagged `index.html`.

---

## 4b. Backend integration pass (latest)

The prototype is now **wired to the real backend** (`../Backend` — Express 5 + JSON file storage; MongoDB is not required). `VITE_API_BASE_URL=http://localhost:4000` in `frontend/.env` turns on real mode; removing it returns the app to pure-offline demo mode. Everything below was verified end-to-end (API smoke tests + in-browser flows) with **0 console errors**.

| # | Change | Files |
| --- | --- | --- |
| 1 | Backend converted from MongoDB to **JSON file storage** (`Backend/data/*.json`) so it runs with no DB install. `Collection<T>` layer with `find/save/deleteOne`; all controllers de-chained (no Mongo query chaining); `createdAt` passed explicitly to `create()`. | `Backend/src/storage.ts` (new), all models, controllers, `db.ts`, `seedAdmin.ts`, `errorMiddleware.ts` |
| 2 | Shared fetch wrapper with `API_ENABLED` flag, Bearer-token handling and API-envelope error parsing. | `src/services/apiClient.ts` (new) |
| 3 | Review, client-review and settings services call the real REST endpoints (JSON.md contract) when API mode is on; `localStorage` mirror kept as offline fallback. Contexts re-fetch after every mutation. | `src/services/reviewService.ts`, `clientReviewService.ts`, `settingsService.ts` |
| 4 | Admin sign-in authenticates for real: `POST /api/admin/auth/login` → JWT stored → attached to all `/api/admin/*` calls. Seeded admin (`npm run seed`): `admin@cynbit.in` / `Admin@12345`. Sign-in UI shows API errors and swaps copy between "Backend sign-in" and "Demo gate only". | `src/hooks/useAdminSession.ts`, `src/components/admin/AdminSignIn.tsx` |
| 5 | **Bug fix:** public pages fetched the admin-only `/api/admin/review-settings` → 401 console noise. Added public `GET /api/review-settings` on the backend; the frontend settings service uses it. Admin route remains protected (401 without token). | `Backend/src/routes/settingsRoutes.ts`, `Backend/src/app.ts`, `src/services/settingsService.ts` |
| 6 | **Bug fix:** admin lists returned 500 after data round-tripped through JSON (`createdAt.getTime is not a function` — dates reload as strings). All controller sorts/serializers now accept `Date | string`. | `Backend/src/controllers/reviewController.ts`, `clientReviewController.ts`, `formController.ts` |
| 7 | Honest prototype copy is now API-aware (`API_ENABLED` conditionals): review dialog, review-form success text, admin footer, sign-in gate, settings "restore defaults" card. | `src/components/review/ReviewModal.tsx`, `ReviewForm.tsx`, `src/layouts/AdminLayout.tsx`, `src/components/admin/AdminSignIn.tsx`, `AdminSettingsPanel.tsx` |

### Verification (API + browser)

- API smoke: health 200 · empty lists `[]` · zeroed summaries · unknown product 404 · submit → 201 `status:"pending"` (server-owned) · pending not leaked publicly · 422 with `fields` map · login 200 / bad password 401 / admin routes 401 without token · approve → public list (email stripped) + computed summary · edit/delete 200/204/404 · settings GET/PATCH (public + admin) · auto-approve flow · client-review CRUD + validation.
- Browser E2E: submit via dialog → "awaiting approval" (API copy) → sign in at `/admin` with seeded creds → moderate (approve updates counts live) → review appears on `/products` without email → client-review add via dialog → approve → appears on Home → section-settings toggle hides/shows the Home section (server truth confirmed) → **0 console errors** on `/`, `/products`, `/admin` throughout.

---

## 5. Data & state architecture

```
Component ──► Hook ──► Context ──► Service ──► REST API (VITE_API_BASE_URL set)
                                               └─ localStorage mirror (offline demo mode)
```

- **Public site** reads only **approved** reviews (`ReviewsContext`, `ClientReviewsContext`).
- **Admin** reads **all statuses** (`useAllReviews`, `useAllClientReviews`) and mutates via the same services; the public contexts re-render automatically because they subscribe to the same service store (local notify, or re-fetch after each API mutation).
- **Settings** (`SettingsContext`) drive which public sections render and whether submissions auto-approve.
- **Moderation flow:** public submit → `pending` (hidden) → admin approve → appears publicly with correct average/distribution. Auto-approve setting can skip the queue for demos.
- **Session:** `useAdminSession` is a module-level store (shared across components). With the API configured, the signed-in flag **is** the backend JWT (`cynbit.admin.token` in `localStorage`); offline it's a `sessionStorage` demo flag.

**Storage keys (offline demo mode — all `localStorage` unless noted):**
| Key | Contents |
| --- | --- |
| `cynbit.prototype.reviews.v2` | Product reviews (all statuses) |
| `cynbit.prototype.clientReviews.v1` | Client/company reviews (all statuses) |
| `cynbit.prototype.reviewSettings.v1` | Section settings singleton |
| `cynbit.prototype.adminSession.v1` (+ `.email`) | Admin demo session (**`sessionStorage`**) |
| `cynbit.admin.token` | Backend JWT (**real mode only**) |

---

## 6. Routes

| Route | Surface | Notes |
| --- | --- | --- |
| `/` | Home | Hero, stats, services, featured products, selected work, testimonials, **client reviews section**, CTA |
| `/products` | Products | Cynbit Studio / TenantEase / Revio details + **per-product review sections** (admin-toggleable) + demo request form |
| `/case-studies` | Case Studies | Filterable index |
| `/case-studies/:slug` | Case study detail | Overview, challenge/solution/outcome, results |
| `/contact` | Contact | Contact methods, inquiry form, FAQ |
| `/admin` | **Review admin (prototype)** | Lazy-loaded; own chrome; demo sign-in gate; moderation + client reviews + settings |
| `*` | NotFound | "This route isn't part of the recreated frontend." |

---

## 7. Full file inventory

**Root config:** `package.json`, `vite.config.ts`, `tsconfig.json` / `tsconfig.app.json` / `tsconfig.node.json`, `index.html`, `.gitignore`, `vercel.json`

**Docs:** `README.md` (feature/usage), `JSON.md` (backend API contract), **`BUILD_NOTES.md`** (this file)

**Public assets:** `public/logo.svg`, `public/robots.txt`, `public/sitemap.xml`, `public/_redirects`

**Source (`src/`):**

```
App.tsx, main.tsx, index.css, vite-env.d.ts

components/
  admin/       AdminClientReviews, AdminModal, AdminProductReviews, AdminSettingsPanel,
               AdminSignIn, ClientReviewForm, StatusBadge
  review/      ProductReviewSection, RatingDistribution, RatingSummary, ReviewCard,
               ReviewFilters, ReviewForm, ReviewModal, StarRating
  sections/    ClientReviewsSection
  ui/          Button, Icon, SectionHeading, Skeleton
  CtaBanner, DemoRequestSection, ErrorBoundary, Footer, Header, Logo,
  ProductCard, ProductDetails, ScrollManager, SocialLinks

context/       ClientReviewsContext, ReviewsContext, SettingsContext
data/          clientReviews (empty), products, reviews (empty), site
hooks/         useAdminSession, useClientReviews, useReviews, useSettings
layouts/       AdminLayout, RootLayout
pages/         AdminPage, CaseStudiesPage, CaseStudyDetailPage, ContactPage,
               HomePage, NotFoundPage, ProductsPage
services/      clientReviewService, reviewService, settingsService
types/         index
utils/         cn, rating
```

**Source file count:** 60 TS/TSX/CSS files.

---

## 8. Commands

```bash
# Backend (../Backend) — required for real mode
cd ../Backend
npm install          # install deps
npm run build        # compile TypeScript → dist/
npm run seed         # create the admin account (admin@cynbit.in / Admin@12345)
node dist/server.js  # API on http://localhost:4000 (data in Backend/data/*.json)

# Frontend
npm install       # install deps
npm run dev       # dev server → http://localhost:5173 (reads frontend/.env)
npm run build     # type-check (tsc -b) + production build → dist/
npm run preview   # serve the built dist/ locally
```

Frontend build pipeline: `tsc -b` (strict type-check, `noUnusedLocals`, `noUnusedParameters`) then `vite build`. There is no separate linter configured — `tsc -b` + `vite build` are the checks.

---

## 9. Known placeholder items before deploy

These do **not** block a static deploy but must be addressed for a real launch (also listed in `README.md`):

1. **Placeholder domain** — `cynbit-prototype.example.com` appears in `index.html` (canonical + OG/Twitter URLs), `public/robots.txt`, and `public/sitemap.xml`. Replace with the real deployment domain.
2. **OG image** — `og:image` points to `/og-image.png`, which is not yet added. Provide a real **1200×630 PNG** (social scrapers don't reliably support SVG) or update the URL.
3. ~~**Backend** — wire the REST API per `JSON.md`~~ **Done** — services call the real API when `VITE_API_BASE_URL` is set; the `localStorage` mirror remains only as an offline fallback (delete it once the backend is always available).
4. ~~**Real auth** — replace the demo `useAdminSession` gate~~ **Done** — sign-in issues a backend JWT (7-day expiry) and every `/api/admin/*` route enforces it (401 without token). Consider httpOnly cookies + rate limiting for production hardening.
5. **Backend storage** — currently JSON files (`Backend/data/`), ideal for demos/evaluation. Swap `Backend/src/storage.ts` for MongoDB/Postgres before handling real user data; keep `npm run seed` for the admin account.

---

*This document reflects the project as of the latest production-hardening pass. Update it whenever build-affecting changes are made.*
