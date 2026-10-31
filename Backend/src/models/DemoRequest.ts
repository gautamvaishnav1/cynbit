import { randomUUID } from 'node:crypto';
import { HydratedDocument, Schema, model } from 'mongoose';

import { PRODUCT_IDS, ProductId } from '../types';

/** "Schedule a Demo" submissions from the Products page (contract §2.5). */
export interface DemoRequestRecord {
  _id: string;
  productId: ProductId;
  fullName: string;
  workEmail: string;
  companyName?: string;
  message: string;
  createdAt: Date;
}

export type DemoRequestDoc = HydratedDocument<DemoRequestRecord>;

const demoRequestSchema = new Schema<DemoRequestRecord>(
  {
    _id: { type: String, default: () => randomUUID() },
    productId: { type: String, required: true, enum: PRODUCT_IDS },
    fullName: { type: String, required: true, trim: true, maxlength: 120 },
    workEmail: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
    companyName: { type: String, trim: true, maxlength: 150 },
    message: { type: String, required: true, trim: true, minlength: 15, maxlength: 3000 },
    createdAt: { type: Date, required: true, default: () => new Date() },
  },
  { versionKey: false },
);

export const DemoRequest = model<DemoRequestRecord>('DemoRequest', demoRequestSchema);
