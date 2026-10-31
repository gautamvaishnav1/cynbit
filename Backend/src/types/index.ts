/* Shared API types, constants and validation rules (source: API contract JSON.md). */

/* ------------------------------------------------------------------
   Shared constants (one place so models, routes and controllers
   never drift apart).
------------------------------------------------------------------- */

/** The three public Cynbit products. */
export const PRODUCT_IDS = ['cynbit-studio', 'tenantease', 'revio'] as const;
export type ProductId = (typeof PRODUCT_IDS)[number];

export function isProductId(value: string): value is ProductId {
  return (PRODUCT_IDS as readonly string[]).includes(value);
}

/** Moderation lifecycle for every review. */
export const REVIEW_STATUSES = ['pending', 'approved', 'rejected'] as const;
export type ReviewStatus = (typeof REVIEW_STATUSES)[number];

export function isReviewStatus(value: string): value is ReviewStatus {
  return (REVIEW_STATUSES as readonly string[]).includes(value);
}

/** Email rule from contract section 2.1. */
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Every public id is a UUID (contract section 4.8). */
export const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: string): boolean {
  return UUID_PATTERN.test(value);
}

/* ------------------------------------------------------------------
   Error envelope (contract section 5).
------------------------------------------------------------------- */

export type ApiErrorCode =
  | 'BAD_REQUEST'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'VALIDATION_FAILED'
  | 'RATE_LIMITED'
  | 'INTERNAL';

export interface ApiErrorResponse {
  error: {
    code: ApiErrorCode;
    message: string;
    /** Field name -> user-facing message. Empty object when not applicable. */
    fields: Record<string, string>;
  };
}

/* ------------------------------------------------------------------
   Admin session (set on req.admin by authMiddleware).
------------------------------------------------------------------- */

export interface AdminTokenInfo {
  id: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      /** Present only after a valid admin JWT has been verified. */
      admin?: AdminTokenInfo;
    }
  }
}

/* ------------------------------------------------------------------
   Product reviews (contract section 2.1 / 3.1 / 3.2).
------------------------------------------------------------------- */

export interface ReviewSubmissionInput {
  customerName: string;
  email: string;
  rating: number;
  comment: string;
}

/** Public shape — the customer email is deliberately absent. */
export interface PublicReview {
  id: string;
  productId: ProductId;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: string;
  status: ReviewStatus;
}

/** Admin shape — includes the stored verification email. */
export interface AdminReview extends PublicReview {
  email: string;
}

export interface ReviewStatusUpdate {
  status: ReviewStatus;
}

export interface ReviewEditInput {
  rating?: number;
  comment?: string;
}

export type RatingDistribution = Record<1 | 2 | 3 | 4 | 5, number>;

export interface RatingSummary {
  productId: ProductId;
  /** 0 when there are no approved reviews. */
  averageRating: number;
  totalReviews: number;
  distribution: RatingDistribution;
}

/* ------------------------------------------------------------------
   Client (company) reviews (contract section 2.2 / 3.3 / 3.4).
------------------------------------------------------------------- */

export interface ClientReviewInput {
  clientName: string;
  clientTitle: string;
  rating: number;
  comment: string;
  source?: string;
}

/** Public and admin shapes are identical — client reviews store no email. */
export interface ClientReview {
  id: string;
  clientName: string;
  clientTitle: string;
  rating: number;
  comment: string;
  source?: string;
  createdAt: string;
  status: ReviewStatus;
}

export interface ClientRatingSummary {
  /** 0 when there are no approved reviews. */
  averageRating: number;
  totalReviews: number;
  distribution: RatingDistribution;
}

/* ------------------------------------------------------------------
   Review settings (contract section 2.4 / 3.5).
------------------------------------------------------------------- */

export interface ReviewSectionSettings {
  productReviewsEnabled: boolean;
  clientReviewsEnabled: boolean;
  autoApproveSubmissions: boolean;
}

/* ------------------------------------------------------------------
   Admin authentication (contract section 3.6).
------------------------------------------------------------------- */

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: { email: string };
}

/* ------------------------------------------------------------------
   Website forms (contract section 2.5).
------------------------------------------------------------------- */

export interface DemoRequestInput {
  productId: ProductId;
  fullName: string;
  workEmail: string;
  companyName?: string;
  message: string;
}

export interface ContactInquiryInput {
  fullName: string;
  email: string;
  company?: string;
  industry?: string;
  message: string;
}

export interface NewsletterInput {
  email: string;
}
