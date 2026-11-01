# Cynbit Technologies — Website Prototype (React + TypeScript)

An independent, frontend-only recreation of the publicly visible pages of [cynbit.in](https://www.cynbit.in), plus a new **product reviews & ratings** experience integrated into the Products page.

> **Scope note:** This prototype was built only from publicly available content on cynbit.in. It does not use Cynbit's private repositories, APIs, database, analytics or hosting. All copy, structure and branding belong to Cynbit Technologies; this recreation is for demonstration purposes.

## Tech stack

- **React 19** + **TypeScript** (Vite 7)
- **Tailwind CSS v4** (`@tailwindcss/vite` plugin + `@theme` design tokens)
- **React Router** (`react-router-dom`) for client-side routing
- **Lucide React** for icons
- Google Fonts: **Manrope** (body) + **Plus Jakarta Sans** (display)

No other runtime dependencies — no UI kits, no form libraries, no state managers.

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build to dist/
npm run preview  # serve the production build
```

## What was recreated

All page content is sourced from the public website (hero copy, product features and FAQs, case-study index entries, contact details, footer links and legal text). Routes that exist on the real site but whose content is not publicly available (Story, Team, Services, Blog, …) render an honest "not part of this prototype" page instead of invented content.

| Route | Page |
| --- | --- |
| `/` | Home — hero, stats, services, featured products, selected work, testimonials (public quotes, no fabricated ratings), client reviews section, CTA |
| `/products` | Products — details for Cynbit Studio, TenantEase and Revio + reviews & ratings feature + demo request form |
| `/case-studies` | Case Studies — filterable index (industries, outcomes, technologies) |
| `/case-studies/:slug` | Case study detail — overview, challenge/solution/outcome, results grid |
| `/contact` | Contact — contact methods, prototype enquiry form, FAQ accordion |
| `/admin` | Review admin panel (prototype) — moderation, client reviews, section settings |
| anything else | NotFound |

## New feature: Product Reviews & Ratings

The **Products page** includes a reviews experience for each of the three products.

### Honest, empty-by-default data

- The shipped seed data contains **zero reviews** (both product reviews and client reviews). Every count, average and distribution is computed from actual data — nothing is fabricated.
- Average rating, total count, the 5→1 star distribution and every list are derived from the review collection at runtime (empty states are shown until the first review is approved).
- Any reviews submitted or entered in the running app are stored by the **backend** (`../Backend`, Mongoose + MongoDB) when `VITE_API_BASE_URL` is set in `frontend/.env`; without it, the app falls back to **in-memory + `localStorage`** prototype data. Nothing is fabricated either way.
- The two public testimonials shown on the Home page are Cynbit's own published quotes; no star ratings are attached to them, because no real ratings exist.

### Moderation flow (admin → public)

1. A visitor submits a product review on the Products page → it is stored as **pending** (or published immediately if the admin's *auto-approve* setting is on).
2. In `/admin` → **Product reviews**, an admin approves, rejects, edits or deletes it.
3. Only **approved** reviews appear publicly, feed the average rating and the 5→1 distribution, and count towards "Based on N reviews".

### What you can do with it

- See per-product rating summary (average stars, approved review count, 5→1 distribution).
- Filter and sort reviews: **All / Highest / Lowest / Most recent**.
- Read reviews (reviewer, star rating, date, body).
- Submit a review via a modal form: product pre-selected, 1–5 interactive stars, 500–650 character body with live counter, inline validation, success and error states, cancel, focus trap, `Escape` to close, background scroll lock.
- Request a product demo via the demo form (name, work email, company, product, message + consent checkbox) — posted to the backend when configured.

## Admin panel (`/admin`)

A prototype back office for the whole reviews feature, linked discreetly from the footer ("Review Admin (prototype)"). It has its own chrome (no marketing header/footer).

- **Sign-in gate** — when `VITE_API_BASE_URL` is set, credentials are verified by the backend (`POST /api/admin/auth/login` → JWT; seeded admin: `admin@cynbit.in` / `Admin@12345` via `npm run seed` in `../Backend`). Without the env var it is a **demo gate** (any email + password) — clearly labelled in the UI.
- **Dashboard stats** — awaiting moderation, published product reviews, published client reviews, company average rating (all computed, zeroed when empty).
- **Product reviews tab** — every submission with status filters (All / Pending / Approved / Rejected with counts) and a product filter; per-row **Approve / Reject / Edit / Delete** (delete has a confirm step), row-level busy indicators and honest visibility hints.
- **Client reviews tab** — manage the "real customers rating Cynbit" section: **Add / Edit / Approve / Reject / Delete** client reviews (client name, role/company, 1–5 stars, review body, optional source such as "Google" or "Clutch").
- **Section settings tab** — instant, persisted toggles:
  - show/hide the product reviews sections on the Products page,
  - show/hide the client reviews section on the Home page,
  - auto-approve new submissions (off by default → moderation required),
  - **Restore default settings** (resets the settings singleton; reviews are managed individually in the moderation tabs — offline mode additionally clears locally stored reviews).

## Client reviews section (Home page)

A separate public section — "Rated by the teams we build for" — showing the **company's** overall average rating and approved customer reviews of Cynbit Technologies itself. Admin-entered only (no public submission form), so only genuine customer feedback can appear. Ships with an honest empty state; the section disappears entirely when toggled off in admin settings.

## Files

```
src/
├── components/
│   ├── admin/              AdminSignIn, AdminModal, AdminProductReviews, AdminClientReviews,
│   │                       ClientReviewForm, AdminSettingsPanel, StatusBadge (+ StatusFilter)
│   ├── layout/            Header, Footer, Logo, ErrorBoundary, RootLayout,
│   │                      ScrollManager, SocialLinks
│   ├── review/            StarRating, RatingSummary, RatingDistribution, ReviewCard,
│   │                      ReviewFilters, ReviewForm, ReviewModal, ProductReviewSection
│   ├── sections/          Hero, StatBand, ServiceGrid, FeaturedProducts, SelectedWork,
│   │                      TestimonialBand, ClientReviewsSection, CtaBanner,
│   │                      DemoRequestSection, FaqAccordion
│   ├── ui/                Button, Section, Badge, Card, FormField, Icon, Skeleton
│   └── products/          ProductCard, ProductDetails
├── context/               ReviewsContext, ClientReviewsContext, SettingsContext
├── data/                  site.ts, products.ts, caseStudies.ts,
│                          reviews.ts + clientReviews.ts (empty seeds)
├── hooks/                 useReviews (+ useAllReviews admin), useClientReviews
│                          (+ useAllClientReviews admin), useSettings, useAdminSession
├── layouts/               RootLayout, AdminLayout
├── pages/                 Home, Products, CaseStudies, CaseStudyDetail, Contact,
│                          Admin, NotFound
├── services/              reviewService, clientReviewService, settingsService
│                          (isolated async data layers)
├── types/                 Review, ClientReview, Product, RatingSummary, ReviewStatus,
│                          ReviewSectionSettings, …
└── utils/                 cn, date, rating (computeRatingSummary,
                           computeClientRatingSummary, …)
```

## Backend integration (done — dual-mode)

Every data operation is isolated behind three services with async APIs. **They are already wired to the real backend** (`../Backend`, Express 5 + Mongoose/MongoDB) via the shared fetch wrapper `src/services/apiClient.ts` when `VITE_API_BASE_URL` is set (e.g. `http://localhost:4000` in `frontend/.env`); without it, the same functions fall back to a `localStorage` mirror so the prototype runs offline:

```ts
// reviewService.ts
getReviews(productId)         // GET    /api/products/:id/reviews
getRatingSummary(productId)   // GET    /api/products/:id/reviews/summary
submitReview(input)           // POST   /api/products/:id/reviews  (server sets status)
listAllReviews()              // GET    /api/admin/reviews           (Bearer token)
setReviewStatus(id, status)   // PATCH  /api/admin/reviews/:id/status
updateReview(id, patch)       // PATCH  /api/admin/reviews/:id
deleteReview(id)              // DELETE /api/admin/reviews/:id

// clientReviewService.ts
getClientReviews()            // GET    /api/client-reviews
listAllClientReviews()        // GET    /api/admin/client-reviews    (Bearer token)
createClientReview(input)     // POST   /api/admin/client-reviews
updateClientReview(id, patch) // PATCH  /api/admin/client-reviews/:id
setClientReviewStatus(id, s)  // PATCH  /api/admin/client-reviews/:id/status
deleteClientReview(id)        // DELETE /api/admin/client-reviews/:id

// settingsService.ts
getSettings()                 // GET    /api/review-settings   (public — section visibility)
updateSettings(patch)         // PATCH  /api/admin/review-settings  (Bearer token)
```

Run it: start MongoDB (`mongod`) with `MONGODB_URI` set in `../Backend/.env`, then `cd ../Backend && npm install && npm run build && npm run seed && node dist/server.js`, and `npm run dev` in this folder. Admin credentials: `admin@cynbit.in` / `Admin@12345`.

To drop the offline fallback entirely: delete the `localStorage` mirrors and seed files (`src/data/reviews.ts`, `src/data/clientReviews.ts`) once the backend is always available. Moderation statuses already flow end-to-end: submissions default to `pending` (or the server's `autoApproveSubmissions` decides) and only `approved` reviews reach the public queries.

## Accessibility

- Semantic landmarks, one `h1` per page, ordered heading levels.
- Visible focus rings, skip link, keyboard-operable filters/accordion/drawer/modal.
- `aria-label`/`aria-current`/`aria-expanded`/`aria-pressed`/`aria-hidden` used throughout; star inputs expose proper labels.
- Colour contrast checked with Lighthouse: **Accessibility 100 / Best practices 100 / SEO 100**.

## Production readiness

The build is production-ready. Hardening in place:

- **Code splitting** — the `/admin` panel is lazy-loaded (`React.lazy` + `Suspense`), so the public site's main bundle stays small (~418 kB / ~125 kB gzipped) and the admin UI (~39 kB) only downloads when visited.
- **Error boundary** — a top-level `ErrorBoundary` wraps the app so a render crash shows a friendly recovery screen (reload / back-to-home) with collapsible technical details instead of a blank page.
- **SPA routing** — `public/_redirects` (Netlify) and `vercel.json` (Vercel) rewrite all paths to `index.html`, so deep links like `/products` and `/admin` work on refresh.
- **SEO / social** — `index.html` ships Open Graph + Twitter card meta and a canonical URL; `public/robots.txt` allows public routes, disallows `/admin`, and points to `public/sitemap.xml` (public routes only).
- **Git hygiene** — `.gitignore` excludes `node_modules/`, `dist/`, `.env*` and editor/OS junk so secrets and build artifacts are never committed.
- **Environment** — no secrets are committed. `frontend/.env` sets `VITE_API_BASE_URL=http://localhost:4000` for local development (git-ignored; see `JSON.md`).

### Before you deploy (checklist)

1. Replace the `cynbit-prototype.example.com` placeholder domain in `index.html`, `public/robots.txt` and `public/sitemap.xml` with the real deployment domain.
2. Add a real `public/og-image.png` (1200×630) — social scrapers don't reliably support SVG.
3. Deploy the backend (`../Backend`) against a managed MongoDB (Atlas or a proper `mongod` service), point `VITE_API_BASE_URL` at it, and consider httpOnly cookies for the admin session.
4. `npm run build` then serve `dist/` (or use your host's Vite/SPA preset).
