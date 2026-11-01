import { Collection } from '../storage';

export interface ContactInquiryRecord {
  _id: string;
  fullName: string;
  email: string;
  company?: string;
  industry?: string;
  message: string;
  createdAt: Date;
}

export type ContactInquiryDoc = ContactInquiryRecord;

export const ContactInquiry = new Collection<ContactInquiryRecord>('contactInquiries');
