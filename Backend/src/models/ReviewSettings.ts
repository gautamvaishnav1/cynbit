import { HydratedDocument, Schema, model, Types } from 'mongoose';

import { ReviewSectionSettings } from '../types';

/** Singleton row controlling what the public site shows (contract §2.4). */
export interface ReviewSettingsRecord extends ReviewSectionSettings {
  _id: Types.ObjectId | string;
}

export type ReviewSettingsDoc = HydratedDocument<ReviewSettingsRecord>;

const reviewSettingsSchema = new Schema<ReviewSettingsRecord>(
  {
    _id: { type: Schema.Types.String, default: 'main' },
    productReviewsEnabled: { type: Boolean, required: true, default: true },
    clientReviewsEnabled: { type: Boolean, required: true, default: true },
    autoApproveSubmissions: { type: Boolean, required: true, default: false },
  },
  { versionKey: false },
);

export const ReviewSettings = model<ReviewSettingsRecord>(
  'ReviewSettings',
  reviewSettingsSchema,
);
