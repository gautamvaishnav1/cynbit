import { randomUUID } from 'node:crypto';
import { HydratedDocument, Schema, model } from 'mongoose';

/** Contact page form submissions (contract §2.5). */
export interface ContactInquiryRecord {
  _id: string;
  fullName: string;
  email: string;
  company?: string;
  industry?: string;
  message: string;
  createdAt: Date;
}

export type ContactInquiryDoc = HydratedDocument<ContactInquiryRecord>;

const contactInquirySchema = new Schema<ContactInquiryRecord>(
  {
    _id: { type: String, default: () => randomUUID() },
    fullName: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
    company: { type: String, trim: true, maxlength: 150 },
    industry: { type: String, trim: true, maxlength: 120 },
    message: { type: String, required: true, trim: true, minlength: 15, maxlength: 3000 },
    createdAt: { type: Date, required: true, default: () => new Date() },
  },
  { versionKey: false },
);

export const ContactInquiry = model<ContactInquiryRecord>(
  'ContactInquiry',
  contactInquirySchema,
);
