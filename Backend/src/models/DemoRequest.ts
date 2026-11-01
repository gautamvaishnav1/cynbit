import { Collection } from '../storage';

export interface DemoRequestRecord {
  _id: string;
  productId: string;
  fullName: string;
  workEmail: string;
  companyName?: string;
  message: string;
  createdAt: Date;
}

export type DemoRequestDoc = DemoRequestRecord;

export const DemoRequest = new Collection<DemoRequestRecord>('demoRequests');
