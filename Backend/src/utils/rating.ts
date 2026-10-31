import { RatingDistribution } from '../types';

export interface SummaryValues {
  averageRating: number;
  totalReviews: number;
  distribution: RatingDistribution;
}

/**
 * Roll up approved ratings only — mirrors the frontend's computeRatingSummary.
 * Returns zeroed values when the list is empty (never fabricate numbers).
 */
export function computeSummary(ratings: number[]): SummaryValues {
  const distribution: RatingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let total = 0;
  let counted = 0;

  for (const rating of ratings) {
    if (Number.isInteger(rating) && rating >= 1 && rating <= 5) {
      distribution[rating as 1 | 2 | 3 | 4 | 5] += 1;
      total += rating;
      counted += 1;
    }
  }

  return {
    averageRating: counted > 0 ? total / counted : 0,
    totalReviews: counted,
    distribution,
  };
}
