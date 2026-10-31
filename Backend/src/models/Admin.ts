import { randomUUID } from 'node:crypto';
import { HydratedDocument, Schema, model } from 'mongoose';

/** The single admin account. Only a bcrypt hash is ever stored. */
export interface AdminRecord {
  _id: string;
  email: string;
  passwordHash: string;
  role: 'admin';
  createdAt: Date;
}

export type AdminDoc = HydratedDocument<AdminRecord>;

const adminSchema = new Schema<AdminRecord>(
  {
    _id: { type: String, default: () => randomUUID() },
    email: { type: String, required: true, trim: true, lowercase: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['admin'], default: 'admin' },
    createdAt: { type: Date, required: true, default: () => new Date() },
  },
  { versionKey: false },
);

export const Admin = model<AdminRecord>('Admin', adminSchema);
