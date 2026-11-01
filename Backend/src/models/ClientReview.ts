import { randomUUID } from 'node:crypto';
import { HydratedDocument, Schema, model, Types } from 'mongoose';

import { REVIEW_STATUSES, ReviewStatus } from '../types';

/** A customer's rating of Cynbit the company (admin-entered only). */
export interface ClientReviewRecord {
  _id: Types.ObjectId | string;
  clientName: string;
  clientTitle: string;
  rating: number;
  comment: string;
  /** Optional provenance label, e.g. "Google". Omitted when unused. */
  source?: string;
  status: ReviewStatus;
  createdAt: Date;
}

export type ClientReviewDoc = HydratedDocument<ClientReviewRecord>;

const clientReviewSchema = new Schema<ClientReviewRecord>(
  {
    _id: { type: Schema.Types.String, default: () => randomUUID() },
    clientName: { type: String, required: true, trim: true, maxlength: 80 },
    clientTitle: { type: String, required: true, trim: true, maxlength: 120 },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      validate: {
        validator: (value: number) => Number.isInteger(value),
        message: 'Rating must be a whole number between 1 and 5.',
      },
    },
    comment: { type: String, required: true, trim: true, minlength: 20, maxlength: 600 },
    source: { type: String, trim: true, maxlength: 60 },
    status: { type: String, required: true, enum: REVIEW_STATUSES, default: 'pending' },
    createdAt: { type: Date, required: true, default: () => new Date() },
  },
  { versionKey: false },
);

clientReviewSchema.index({ status: 1, createdAt: -1 });

export const ClientReview = model<ClientReviewRecord>('ClientReview', clientReviewSchema);
