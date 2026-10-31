# Cynbit Frontend ↔ Backend — Data & API Contract (JSON.md)

**Audience:** backend engineer joining this project.
**Purpose:** every piece of data the React frontend (`cynbit-frontend`) uses, the exact JSON shapes it expects, and the REST API the frontend is already written against.

> **Current state of the frontend:** all data operations are isolated behind three service modules (`src/services/reviewService.ts`, `src/services/clientReviewService.ts`, `src/services/settingsService.ts`). Today they read/write `localStorage` and simulate latency. Each function is annotated with the REST call it mirrors. **No seed data ships** — every review dataset is intentionally empty (`src/data/reviews.ts`, `src/data/clientReviews.ts` export `[]`). Nothing may ever be fabricated.

---

## 1. Quick map: frontend service → REST endpoint

| Frontend function (file) | Method | Endpoint | Auth |
| --- | --- | --- | --- |
| `reviewService.getReviews(productId)` | GET | `/api/products/{productId}/reviews` | public |
| `reviewService.getRatingSummary(productId)` | GET | `/api/products/{productId}/reviews/summary` | public |
| `reviewService.submitReview(input)` | POST | `/api/products/{productId}/reviews` | public |
| `reviewService.listAllReviews()` | GET | `/api/admin/reviews` | admin |
| `reviewService.setReviewStatus(id, status)` | PATCH | `/api/admin/reviews/{id}/status` | admin |
| `reviewService.updateReview(id, patch)` | PATCH | `/api/admin/reviews/{id}` | admin |
| `reviewService.deleteReview(id)` | DELETE | `/api/admin/reviews/{id}` | admin |
| `clientReviewService.getClientReviews()` | GET | `/api/client-reviews` | public |
| `clientReviewService.getClientRatingSummary()` | GET | `/api/client-reviews/summary` | public |
| `clientReviewService.listAllClientReviews()` | GET | `/api/admin/client-reviews` | admin |
| `clientReviewService.createClientReview(input)` | POST | `/api/admin/client-reviews` | admin |
| `clientReviewService.updateClientReview(id, patch)` | PATCH | `/api/admin/client-reviews/{id}` | admin |
| `clientReviewService.setClientReviewStatus(id, status)` | PATCH | `/api/admin/client-reviews/{id}/status` | admin |
| `clientReviewService.deleteClientReview(id)` | DELETE | `/api/admin/client-reviews/{id}` | admin |
| `settingsService.getSettings()` | GET | `/api/admin/review-settings` | admin |
| `settingsService.updateSettings(patch)` | PATCH | `/api/admin/review-settings` | admin |
| Demo form (`DemoRequestSection.tsx`) | POST | `/api/demo-requests` | public |
| Contact form (`ContactPage.tsx`) | POST | `/api/contact-inquiries` | public |
| Newsletter (`Footer.tsx`) | POST | `/api/newsletter/subscriptions` | public |
| Admin sign-in (`useAdminSession.ts`) — currently client-only | POST | `/api/admin/auth/login` | public |

All endpoints: `Content-Type: application/json`, UTF-8. Suggested base URL via env: `VITE_API_BASE_URL` (frontend change is a one-line swap per service).

---

## 2. Data models

### 2.1 `Review` — a customer review of a **product** (Cynbit Studio / TenantEase / Revio)

TypeScript: `src/types/index.ts → Review`

```json
{
  "id": "23a53dd1-4f66-4b58-932c-400aa2b8666f",
  "productId": "tenantease",
  "customerName": "Priya Sharma",
  "email": "priya@example.com",
  "rating": 5,
  "comment": "TenantEase made our rental operations dramatically smoother.",
  "createdAt": "2026-10-30T17:52:25.858Z",
  "status": "pending"
}
```

| Field | Type | Rules |
| --- | --- | --- |
| `id` | string (UUID v4) | server-generated, immutable |
| `productId` | string enum | `"cynbit-studio"` \| `"tenantease"` \| `"revio"` |
| `customerName` | string | required, trimmed, ≤ 80 chars |
| `email` | string | required, valid format `^[^\s@]+@[^\s@]+\.[^\s@]{2,}$`; **never returned on public endpoints** |
| `rating` | integer | required, 1–5 |
| `comment` | string | required, 10–600 chars after trim |
| `createdAt` | string | ISO 8601 UTC, server-generated |
| `status` | string enum | `"pending"` \| `"approved"` \| `"rejected"` |

### 2.2 `ClientReview` — a real customer rating & review of **Cynbit the company**

TypeScript: `src/types/index.ts → ClientReview`. Entered only through the admin panel (no public form), shown on the Home page ("Rated by the teams we build for").

```json
{
  "id": "8f2c1a44-9b3e-4d5f-8a71-2c9d0e6b3a10",
  "clientName": "Aarav Mehta",
  "clientTitle": "Founder, Evento",
  "rating": 5,
  "comment": "Cynbit rebuilt our event platform end to end. Communication was transparent and the delivery was on schedule.",
  "source": "Google",
  "createdAt": "2026-10-31T09:14:02.113Z",
  "status": "approved"
}
```

| Field | Type | Rules |
| --- | --- | --- |
| `id` | string (UUID v4) | server-generated |
| `clientName` | string | required, ≤ 80 chars |
| `clientTitle` | string | required, ≤ 120 chars (role / company) |
| `rating` | integer | required, 1–5 |
| `comment` | string | required, 20–600 chars after trim |
| `source` | string \| omitted | optional, ≤ 60 chars (e.g. `"Google"`, `"Clutch"`, `"Direct feedback"`) |
| `createdAt` | string | ISO 8601 UTC, server-generated |
| `status` | string enum | `"pending"` \| `"approved"` \| `"rejected"` |

### 2.3 `RatingSummary` — per-product roll-up

Derived **only from approved reviews**. The frontend recomputes it client-side from the review list today, but exposing it server-side avoids shipping full lists later.

```json
{
  "productId": "tenantease",
  "averageRating": 5,
  "totalReviews": 1,
  "distribution": { "5": 1, "4": 0, "3": 0, "2": 0, "1": 0 }
}
```

Empty product (the guaranteed default — never fabricate numbers):

```json
{
  "productId": "revio",
  "averageRating": 0,
  "totalReviews": 0,
  "distribution": { "5": 0, "4": 0, "3": 0, "2": 0, "1": 0 }
}
```

`ClientRatingSummary` is the same shape **without** `productId` (`GET /api/client-reviews/summary`).

### 2.4 `ReviewSectionSettings` — admin panel "Section settings"

```json
{
  "productReviewsEnabled": true,
  "clientReviewsEnabled": true,
  "autoApproveSubmissions": false
}
```

| Field | Meaning |
| --- | --- |
| `productReviewsEnabled` | show the per-product review sections on the Products page |
| `clientReviewsEnabled` | show the client reviews section on the Home page |
| `autoApproveSubmissions` | `false` → new submissions are created `pending` (moderation required); `true` → created `approved` (demo mode). **The server must own this decision** — do not trust a status field sent by the client. |

A single row/table is enough (singleton config).

### 2.5 Lead forms (currently mock-only; frontend validates before sending)

**`POST /api/demo-requests`** — "Schedule a Demo" on the Products page:

```json
{
  "productId": "cynbit-studio",
  "fullName": "Ravi Kumar",
  "workEmail": "ravi@company.com",
  "companyName": "Acme Pvt Ltd",
  "message": "We want a demo of the AI evaluation flow for our 200-person team."
}
```

`companyName` optional; `message` ≥ 15 chars. Response: `201 { "id": "...", "receivedAt": "..." }`.

**`POST /api/contact-inquiries`** — Contact page form:

```json
{
  "fullName": "Sara Khan",
  "email": "sara@example.com",
  "company": "Cloudy Tales",
  "industry": "Creative Studio",
  "message": "Looking to rebuild our collaboration engine on AWS."
}
```

`company` and `industry` optional; `message` ≥ 15 chars.

**`POST /api/newsletter/subscriptions`** — footer newsletter:

```json
{ "email": "architect@company.com" }
```

Response: `201 { "id": "..." }`; duplicate → `409`.

---

## 3. Endpoint contracts

### 3.1 Public product reviews

**`GET /api/products/{productId}/reviews`**
→ `200` with a JSON array of **approved** reviews only, newest first (`createdAt` desc). Public rows must **omit `email`**.

```json
[
  {
    "id": "23a53dd1-4f66-4b58-932c-400aa2b8666f",
    "productId": "tenantease",
    "customerName": "Priya Sharma",
    "rating": 5,
    "comment": "TenantEase made our rental operations dramatically smoother.",
    "createdAt": "2026-10-30T17:52:25.858Z",
    "status": "approved"
  }
]
```

Empty default: `200 []`. Unknown product → `404`.

**`GET /api/products/{productId}/reviews/summary`** → `200` with the `RatingSummary` shape (§2.3). Always return the zeroed shape when empty.

**`POST /api/products/{productId}/reviews`**

Request:

```json
{
  "customerName": "Priya Sharma",
  "email": "priya@example.com",
  "rating": 5,
  "comment": "TenantEase made our rental operations dramatically smoother."
}
```

Response `201` — full `Review` object (§2.1) with server id/createdAt and the status the **server** chose:
- `review_settings.autoApproveSubmissions = false` (default) → `"status": "pending"`
- `= true` → `"status": "approved"`

Validation failure → `422` (see error format §5). Rate-limiting/abuse protection recommended.

### 3.2 Admin product reviews (require authenticated admin)

**`GET /api/admin/reviews`** → `200` array of **all statuses**, newest first. Email included. Optional filters: `?status=pending&productId=tenantease` (frontend currently fetches all and filters client-side; filters optional).

**`PATCH /api/admin/reviews/{id}/status`**

Request: `{ "status": "approved" }` (`"pending" | "approved" | "rejected"`)
Response: `200` updated `Review`. Not found → `404`.

**`PATCH /api/admin/reviews/{id}`** — edit rating and/or body:

```json
{ "rating": 4, "comment": "Updated review text (10–600 chars)." }
```

Response: `200` updated `Review`. Optionally bump an `updatedAt` field (frontend ignores extra fields).

**`DELETE /api/admin/reviews/{id}`** → `204`. Not found → `404`. Hard delete is acceptable (the prototype deletes permanently).

### 3.3 Public client reviews

**`GET /api/client-reviews`** → `200` array of **approved** client reviews, newest first:

```json
[
  {
    "id": "8f2c1a44-9b3e-4d5f-8a71-2c9d0e6b3a10",
    "clientName": "Aarav Mehta",
    "clientTitle": "Founder, Evento",
    "rating": 5,
    "comment": "Cynbit rebuilt our event platform end to end...",
    "source": "Google",
    "createdAt": "2026-10-31T09:14:02.113Z",
    "status": "approved"
  }
]
```

Empty default: `200 []`.

**`GET /api/client-reviews/summary`** → `200` `ClientRatingSummary` (approved only, zeroed when empty).

### 3.4 Admin client reviews

Same pattern as §3.2:

| Endpoint | Body | Success |
| --- | --- | --- |
| `GET /api/admin/client-reviews` | — | `200` all statuses, newest first |
| `POST /api/admin/client-reviews` | `ClientReviewInput` (§2.2 minus id/createdAt/status) | `201` created (status per `autoApproveSubmissions`) |
| `PATCH /api/admin/client-reviews/{id}` | partial input | `200` updated |
| `PATCH /api/admin/client-reviews/{id}/status` | `{ "status": "approved" }` | `200` updated |
| `DELETE /api/admin/client-reviews/{id}` | — | `204` |

Note: `POST`/`PATCH` accept `source` as optional; omit the key entirely when unused (frontend renders "via {source}" only when present).

### 3.5 Review settings

**`GET /api/admin/review-settings`** → `200` the singleton object (§2.4); create defaults on first read if missing.
**`PATCH /api/admin/review-settings`** — accepts any subset:

```json
{ "clientReviewsEnabled": false }
```

→ `200` full updated object. The admin UI applies toggles immediately; public pages must reflect them on next fetch.

### 3.6 Admin authentication (the missing piece)

The frontend's `/admin` sign-in is a **client-side demo gate only** — any email/password works. For production:

- `POST /api/admin/auth/login` → `{ "token": "...", "user": { "email": "..." } }` (or an httpOnly session cookie — preferred).
- Every `/api/admin/*` endpoint must reject unauthenticated/role-less callers with `401` / `403`.
- Passwords hashed (bcrypt/argon2); login rate-limited.

---

## 4. Business rules the backend must enforce

1. **Moderation:** public endpoints (`GET /api/products/*/reviews`, `/api/client-reviews`, both `/summary`s) return **approved only**. Pending/rejected never leak to public routes.
2. **Status is server-owned:** ignore any `status` field a public `POST` attempts to send; derive it from `review_settings.autoApproveSubmissions`.
3. **Summaries are computed** from approved rows — no stored/fabricated averages, no fabricated percentages. Empty ⇒ zeroed shape.
4. **Ordering:** all list endpoints return `createdAt` descending.
5. **Trimming:** `customerName`/`clientName`/`clientTitle`/`comment`/`source` are trimmed before validation & storage.
6. **IDs & timestamps** are server-generated (UUID recommended).
7. **Emails** on reviews are stored for verification only and stripped from every public response.
8. **IDs in URLs** — validate UUID format; return `404` for unknown ids (do not leak existence differences between admin/public beyond that).

### Validation summary (enforce server-side; the frontend already mirrors these)

| Entity | Field | Rule |
| --- | --- | --- |
| Review | `productId` | one of `cynbit-studio`, `tenantease`, `revio` |
| Review | `customerName` | required, ≤ 80 |
| Review | `email` | required, format `^[^\s@]+@[^\s@]+\.[^\s@]{2,}$` |
| Review | `rating` | integer 1–5 |
| Review | `comment` | 10–600 |
| ClientReview | `clientName` | required, ≤ 80 |
| ClientReview | `clientTitle` | required, ≤ 120 |
| ClientReview | `rating` | integer 1–5 |
| ClientReview | `comment` | 20–600 |
| ClientReview | `source` | optional, ≤ 60 |
| DemoRequest | `message` | ≥ 15 |
| ContactInquiry | `message` | ≥ 15 |

---

## 5. Error format (suggested convention)

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Please select a star rating between 1 and 5.",
    "fields": { "rating": "Please select a star rating between 1 and 5." }
  }
}
```

| Status | `code` | When |
| --- | --- | --- |
| 400 | `BAD_REQUEST` | malformed JSON / params |
| 401 | `UNAUTHORIZED` | no/invalid admin session |
| 403 | `FORBIDDEN` | authenticated but not admin |
| 404 | `NOT_FOUND` | unknown id / product |
| 409 | `CONFLICT` | duplicate newsletter email etc. |
| 422 | `VALIDATION_FAILED` | body failed the rules in §4 |
| 429 | `RATE_LIMITED` | abuse protection tripped |
| 500 | `INTERNAL` | unexpected |

The frontend displays `error.message` inline; `fields` (field → message) enables per-field mapping if adopted later.

---

## 6. Suggested database schema

```sql
CREATE TABLE reviews (
  id            UUID PRIMARY KEY,
  product_id    TEXT NOT NULL CHECK (product_id IN ('cynbit-studio','tenantease','revio')),
  customer_name TEXT NOT NULL,
  email         TEXT NOT NULL,
  rating        SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment       TEXT NOT NULL CHECK (char_length(comment) BETWEEN 10 AND 600),
  status        TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX reviews_product_status_idx ON reviews (product_id, status, created_at DESC);

CREATE TABLE client_reviews (
  id           UUID PRIMARY KEY,
  client_name  TEXT NOT NULL,
  client_title TEXT NOT NULL,
  rating       SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment      TEXT NOT NULL CHECK (char_length(comment) BETWEEN 20 AND 600),
  source       TEXT,
  status       TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE review_settings (
  id                       BOOLEAN PRIMARY KEY DEFAULT true CHECK (id), -- singleton row
  product_reviews_enabled  BOOLEAN NOT NULL DEFAULT true,
  client_reviews_enabled   BOOLEAN NOT NULL DEFAULT true,
  auto_approve_submissions BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE demo_requests (
  id UUID PRIMARY KEY, product_id TEXT NOT NULL, full_name TEXT NOT NULL,
  work_email TEXT NOT NULL, company_name TEXT, message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE contact_inquiries (
  id UUID PRIMARY KEY, full_name TEXT NOT NULL, email TEXT NOT NULL,
  company TEXT, industry TEXT, message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE newsletter_subscribers (
  id UUID PRIMARY KEY, email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE admin_users (
  id UUID PRIMARY KEY, email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

## 7. Data currently hard-coded in the frontend (no API needed)

These are transcribed from the **public** cynbit.in site and live in `src/data/` as static TypeScript. Moving them to a CMS/API is optional; they are not part of the review backend:

| File | Contents |
| --- | --- |
| `src/data/products.ts` | the 3 products: ids, names, feature groups, pillars, stats, quotes |
| `src/data/site.ts` | 13 case-study index entries (slug, client, category, title, 2 metrics), FAQ items, nav groups |
| `src/data/reviews.ts` | `[]` — **must stay empty** |
| `src/data/clientReviews.ts` | `[]` — **must stay empty** |

Optional future endpoints if these become CMS-managed: `GET /api/products`, `GET /api/case-studies`, `GET /api/faqs`.

---

## 8. Integration checklist (frontend side, for whoever wires it up)

1. Add `VITE_API_BASE_URL` to `.env` and replace each service function body with `fetch` (they already have the async shape and comments marking the swap points).
2. Keep public serializers free of `email`; keep admin serializers complete.
3. Delete the `localStorage` mirrors and `resetX()` dev helpers once the API is live; remove the seed imports.
4. Replace `useAdminSession` (client-only flag in `sessionStorage`) with the real login endpoint; keep the route guard UX unchanged.
5. CORS: allow the frontend origin; credentials if using cookies.
6. Pagination is **not** required by the current UI (lists load fully), but `?page=&limit=` can be added later — the frontend would need a small change.
