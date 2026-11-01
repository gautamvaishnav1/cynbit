import { Collection } from '../storage';

export interface AdminRecord {
  _id: string;
  email: string;
  passwordHash: string;
  role: string;
  createdAt: Date;
}

export type AdminDoc = AdminRecord;

export const Admin = new Collection<AdminRecord>('adminUsers');
