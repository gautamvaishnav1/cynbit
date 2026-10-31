/* ------------------------------------------------------------------
   Shared domain types.
   Kept intentionally backend-agnostic so a future REST API can be
   dropped in without touching components (see services/reviewService).
------------------------------------------------------------------- */

/** Identifiers for the three public Cynbit products. */
export type ProductId = 'cynbit-studio' | 'tenantease' | 'revio';

/**
 * Moderation lifecycle.
 * New submissions are created as `pending` (unless the admin panel's
 * auto-approve setting is on) and only `approved` reviews are ever exposed
 * through the public queries — mirroring how a real backend should behave.
 */
export type ReviewStatus = 'pending' | 'approved' | 'rejected';

/** Status filter options used in the admin moderation lists. */
export type AdminStatusFilter = 'all' | ReviewStatus;

/** A single customer review of a Cynbit product. */
export interface Review {
  /** Stable unique id. */
  id: string;
  productId: ProductId;
  customerName: string;
  /** Never rendered publicly; stored for verification/follow-up only. */
  email: string;
  /** Integer 1–5. */
  rating: number;
  /** Written review body. */
  comment: string;
  /** ISO 8601 timestamp. */
  createdAt: string;
  status: ReviewStatus;
}

/** Payload accepted by the review submission service. */
export interface ReviewInput {
  productId: ProductId;
  customerName: string;
  email: string;
  rating: number;
  comment: string;
}

/** Star counts from 1 → 5. */
export type RatingDistribution = Record<1 | 2 | 3 | 4 | 5, number>;

/** Aggregated rating roll-up for one product. */
export interface RatingSummary {
  productId: ProductId;
  /** 0 when there are no approved reviews. */
  averageRating: number;
  /** Number of approved reviews. */
  totalReviews: number;
  distribution: RatingDistribution;
}

/** Sort / filter options exposed in the review toolbar. */
export type ReviewSortOption = 'all' | 'highest' | 'lowest' | 'recent';

/* ------------------------------------------------------------------
   Client (company) reviews — real customer ratings of Cynbit itself.
   These are entered through the prototype admin panel only; the public
   site just displays approved ones. Seed data is intentionally empty.
------------------------------------------------------------------- */

/** A real customer's rating & review of Cynbit Technologies as a company. */
export interface ClientReview {
  id: string;
  /** Customer full name. */
  clientName: string;
  /** Role / company shown under the name, e.g. "Founder, Marketing Addict". */
  clientTitle: string;
  /** Integer 1–5. */
  rating: number;
  /** Written review body. */
  comment: string;
  /** Optional provenance label, e.g. "Google", "Clutch", "Direct feedback". */
  source?: string;
  /** ISO 8601 timestamp. */
  createdAt: string;
  status: ReviewStatus;
}

/** Payload accepted by the client-review admin service. */
export interface ClientReviewInput {
  clientName: string;
  clientTitle: string;
  rating: number;
  comment: string;
  source?: string;
}

/** Aggregated rating roll-up for the company-level client reviews. */
export interface ClientRatingSummary {
  /** 0 when there are no approved reviews. */
  averageRating: number;
  totalReviews: number;
  distribution: RatingDistribution;
}

/* ------------------------------------------------------------------
   Admin panel section settings — control what the public site shows.
------------------------------------------------------------------- */

export interface ReviewSectionSettings {
  /** Show the per-product reviews & ratings sections on the Products page. */
  productReviewsEnabled: boolean;
  /** Show the client (company) reviews section on the Home page. */
  clientReviewsEnabled: boolean;
  /** When true, public review submissions are published immediately. */
  autoApproveSubmissions: boolean;
}

/* ------------------------------------------------------------------ */

export type ProductAccent = 'brand' | 'sand' | 'ink';

export interface ProductStat {
  value: string;
  label: string;
}

export interface ProductFeature {
  icon: string;
  title: string;
  subtitle: string;
}

export interface ProductFeatureGroup {
  eyebrow: string;
  heading: string;
  body?: string;
  features: ProductFeature[];
}

export interface ProductPillar {
  code: string;
  title: string;
  body: string;
}

export interface Product {
  id: ProductId;
  name: string;
  monogram: string;
  icon: string;
  /** Small flag shown on the flagship index cards. */
  flag: string;
  /** Section eyebrow, e.g. "AI-Powered Career Growth Lab". */
  eyebrow: string;
  /** One-line positioning statement. */
  tagline: string;
  /** Short sentence used on index cards. */
  summary: string;
  /** Longer paragraph rendered under the section heading. */
  description: string;
  accent: ProductAccent;
  /** Primary CTA label — anchors to the Schedule a Demo block. */
  ctaLabel: string;
  /** Pull quote used at the end of the section. */
  quote?: string;
  featureGroups: ProductFeatureGroup[];
  pillars: ProductPillar[];
  stats: ProductStat[];
}

/* ------------------------------------------------------------------ */

export interface CaseStudy {
  slug: string;
  client: string;
  category: CaseStudyCategory;
  title: string;
  /** Two highlight chips rendered on the card. */
  metrics: [string, string];
  /** Deterministic gradient used in place of hot-linked stock imagery. */
  palette: [string, string];
  initials: string;
}

export type CaseStudyCategory = 'Software Dev' | 'Cloud Strategy' | 'Digital Marketing';

export interface FaqItem {
  question: string;
  answer: string;
}

export interface NavChild {
  label: string;
  description: string;
  href: string;
  icon: string;
}

export interface NavGroup {
  label: string;
  href?: string;
  children?: NavChild[];
}
