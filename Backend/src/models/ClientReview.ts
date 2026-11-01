import { Collection } from '../storage';

import { REVIEW_STATUSES, ReviewStatus } from '../types';

export interface ClientReviewRecord {
  _id: string;
  clientName: string;
  clientTitle: string;
  rating: number;
  comment: string;
  source?: string;
  status: ReviewStatus;
  createdAt: Date;
}

export type ClientReviewDoc = ClientReviewRecord;

export const ClientReview = new Collection<ClientReviewRecord>('clientReviews');
