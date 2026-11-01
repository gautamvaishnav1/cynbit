import { Collection } from '../storage';

export interface ReviewSettingsRecord {
  _id: string;
  productReviewsEnabled: boolean;
  clientReviewsEnabled: boolean;
  autoApproveSubmissions: boolean;
}

export type ReviewSettingsDoc = ReviewSettingsRecord & {
  save(): Promise<ReviewSettingsDoc>;
};

export const ReviewSettings = new Collection<ReviewSettingsRecord>('reviewSettings');

const originalFindOne = ReviewSettings.findOne.bind(ReviewSettings);
ReviewSettings.findOne = async () => {
  const doc = await originalFindOne({});
  return doc;
};

const originalCreate = ReviewSettings.create.bind(ReviewSettings);
ReviewSettings.create = async (input: Omit<ReviewSettingsRecord, '_id'>) => {
  return originalCreate(input);
};
