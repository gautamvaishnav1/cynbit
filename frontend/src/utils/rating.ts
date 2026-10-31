import type {
  ClientRatingSummary,
  ClientReview,
  ProductId,
  RatingDistribution,
  RatingSummary,
  Review,
  ReviewSortOption,
} from '../types';

/** Distribution with all buckets zeroed — used when no data exists. */
export const EMPTY_DISTRIBUTION: RatingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

export const STAR_LEVELS = [5, 4, 3, 2, 1] as const;

/** Clamp any incoming value to a whole 1–5 star rating. */
export function clampRating(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(5, Math.max(1, Math.round(value)));
}

/** Approved reviews only — pending/rejected never count towards a summary. */
export function approvedFor(reviews: Review[], productId: ProductId): Review[] {
  return reviews.filter((r) => r.productId === productId && r.status === 'approved');
}

/**
 * Build a rating roll-up from raw reviews.
 * Returns zeroed values (never fabricated percentages) when there is no data.
 */
export function computeRatingSummary(
  productId: ProductId,
  reviews: Review[],
): RatingSummary {
  const approved = approvedFor(reviews, productId);
  const totalReviews = approved.length;
  const distribution: RatingDistribution = { ...EMPTY_DISTRIBUTION };

  let total = 0;
  for (const review of approved) {
    const star = clampRating(review.rating);
    if (star >= 1 && star <= 5) {
      distribution[star as 1 | 2 | 3 | 4 | 5] += 1;
    }
    total += review.rating;
  }

  return {
    productId,
    averageRating: totalReviews > 0 ? total / totalReviews : 0,
    totalReviews,
    distribution,
  };
}

/** Share of reviews at a given star level, 0–1. Returns 0 without data. */
export function starShare(summary: RatingSummary, level: 1 | 2 | 3 | 4 | 5): number {
  if (summary.totalReviews === 0) return 0;
  return summary.distribution[level] / summary.totalReviews;
}

/**
 * Roll-up for company-level client reviews (approved only).
 * Same zeroed-when-empty guarantee as computeRatingSummary — never fabricated.
 */
export function computeClientRatingSummary(reviews: ClientReview[]): ClientRatingSummary {
  const approved = reviews.filter((review) => review.status === 'approved');
  const totalReviews = approved.length;
  const distribution: RatingDistribution = { ...EMPTY_DISTRIBUTION };

  let total = 0;
  for (const review of approved) {
    const star = clampRating(review.rating);
    if (star >= 1 && star <= 5) {
      distribution[star as 1 | 2 | 3 | 4 | 5] += 1;
    }
    total += review.rating;
  }

  return {
    averageRating: totalReviews > 0 ? total / totalReviews : 0,
    totalReviews,
    distribution,
  };
}

const SORT_LABELS: Record<ReviewSortOption, string> = {
  all: 'All reviews',
  highest: 'Highest rated',
  lowest: 'Lowest rated',
  recent: 'Most recent',
};

export const REVIEW_SORT_LABELS = SORT_LABELS;

export const REVIEW_SORT_OPTIONS: ReviewSortOption[] = ['all', 'highest', 'lowest', 'recent'];

/** Apply the selected toolbar ordering to a review list. */
export function sortReviews(reviews: Review[], option: ReviewSortOption): Review[] {
  const copy = [...reviews];
  switch (option) {
    case 'highest':
      return copy.sort((a, b) => b.rating - a.rating || dateValue(b) - dateValue(a));
    case 'lowest':
      return copy.sort((a, b) => a.rating - b.rating || dateValue(b) - dateValue(a));
    case 'recent':
      return copy.sort((a, b) => dateValue(b) - dateValue(a));
    case 'all':
    default:
      return copy;
  }
}

function dateValue(review: Review): number {
  const time = Date.parse(review.createdAt);
  return Number.isNaN(time) ? 0 : time;
}

/** Human-friendly review date, e.g. "March 4, 2026". */
export function formatReviewDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'Date unavailable';
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

/** "4.5" style label, or "New" when there are no reviews yet. */
export function formatAverage(average: number, totalReviews: number): string {
  if (totalReviews === 0) return 'New';
  return average.toFixed(1);
}
