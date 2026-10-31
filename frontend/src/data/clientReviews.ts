import type { ClientReview } from '../types';

/**
 * PROTOTYPE DATA SOURCE — INTENTIONALLY EMPTY.
 *
 * This project must never publish invented customer testimonials or star
 * ratings for the company. Real client reviews of Cynbit Technologies are
 * entered through the prototype admin panel (/admin) and stored locally;
 * this seed stays empty so nothing fabricated ships with the app.
 *
 * Backend integration phase: replace this seed with a REST fetch such as
 *   GET  /api/client-reviews?status=approved
 */
export const seedClientReviews: ClientReview[] = [];
