import { randomUUID } from 'node:crypto';
import { HydratedDocument, Schema, model, Types } from 'mongoose';

/** Footer newsletter sign-ups — one row per email (unique index, contract §2.5). */
export interface NewsletterSubscriberRecord {
  _id: Types.ObjectId | string;
  email: string;
  createdAt: Date;
}

export type NewsletterSubscriberDoc = HydratedDocument<NewsletterSubscriberRecord>;

const newsletterSubscriberSchema = new Schema<NewsletterSubscriberRecord>(
  {
    _id: { type: Schema.Types.String, default: () => randomUUID() },
    email: { type: String, required: true, trim: true, lowercase: true, unique: true, maxlength: 254 },
    createdAt: { type: Date, required: true, default: () => new Date() },
  },
  { versionKey: false },
);

export const NewsletterSubscriber = model<NewsletterSubscriberRecord>(
  'NewsletterSubscriber',
  newsletterSubscriberSchema,
);
