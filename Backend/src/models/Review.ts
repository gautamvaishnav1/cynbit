import { randomUUID } from 'node:crypto';
import { HydratedDocument, Schema, model } from 'mongoose';

import { PRODUCT_IDS, ProductId, REVIEW_STATUSES, ReviewStatus } from '../types';

/** One stored row of the `reviews` collection. */
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

export type ReviewDoc = HydratedDocument<ReviewRecord>;

const reviewSchema = new Schema<ReviewRecord>(
  {
    _id: { type: String, default: () => randomUUID() },
    productId: { type: String, required: true, enum: PRODUCT_IDS },
    customerName: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, trim: true, lowercase: true },
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
    comment: { type: String, required: true, trim: true, minlength: 10, maxlength: 600 },
    status: { type: String, required: true, enum: REVIEW_STATUSES, default: 'pending' },
    createdAt: { type: Date, required: true, default: () => new Date() },
  },
  { versionKey: false },
);

/* Matches the index suggested by the API contract. */
reviewSchema.index({ productId: 1, status: 1, createdAt: -1 });

export const Review = model<ReviewRecord>('Review', reviewSchema);
