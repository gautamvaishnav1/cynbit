import { Collection } from '../storage';

export interface ReviewSettingsRecord {
  _id: string;
  productReviewsEnabled: boolean;
  clientReviewsEnabled: boolean;
  autoApproveSubmissions: boolean;
}

export type ReviewSettingsDoc = ReviewSettingsRecord;

export const ReviewSettings = new Collection<ReviewSettingsRecord>('reviewSettings');
