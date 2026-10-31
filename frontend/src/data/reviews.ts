import type { Review } from '../types';

/**
 * PROTOTYPE DATA SOURCE — INTENTIONALLY EMPTY.
 *
 * This project must never publish invented customer testimonials, star
 * ratings, or review counts. Reviews enter the application only through the
 * in-browser submission flow (services/reviewService.ts), which is a
 * front-end demonstration with no persistence.
 *
 * Backend integration phase: replace this seed with a REST fetch such as
 *   GET /api/products/:productId/reviews?status=approved
 */
export const seedReviews: Review[] = [];
