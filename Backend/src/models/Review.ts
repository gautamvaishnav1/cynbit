import { Collection } from '../storage';

import { PRODUCT_IDS, ProductId, REVIEW_STATUSES, ReviewStatus } from '../types';

export interface ReviewRecord {
  _id: string;
  productId: ProductId;
  customerName: string;
  /** Stored for verification only — never sent on public endpoints. */
  email: string;
  rating: number;
  comment: string;
  status: ReviewStatus;
  createdAt: Date;
}

export type ReviewDoc = ReviewRecord;

export const Review = new Collection<ReviewRecord>('reviews');
