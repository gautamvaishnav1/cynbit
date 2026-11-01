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

export type ContactInquiryDoc = ContactInquiryRecord & {
  save(): Promise<ContactInquiryDoc>;
};

export const ContactInquiry = new Collection<ContactInquiryRecord>('contactInquiries');

function hydrate(doc: ContactInquiryRecord): ContactInquiryDoc {
  return Object.assign(doc, {
    createdAt: new Date(doc.createdAt),
  }) as ContactInquiryDoc;
}

const originalCreate = ContactInquiry.create.bind(ContactInquiry);
ContactInquiry.create = async (input: Omit<ContactInquiryRecord, '_id'>) => {
  const doc = await originalCreate({ ...input, createdAt: new Date() });
  return hydrate(doc);
};
