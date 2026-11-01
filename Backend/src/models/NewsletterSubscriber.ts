import { Collection } from '../storage';

export interface NewsletterSubscriberRecord {
  _id: string;
  email: string;
  createdAt: Date;
}

export type NewsletterSubscriberDoc = NewsletterSubscriberRecord;

export const NewsletterSubscriber = new Collection<NewsletterSubscriberRecord>('newsletterSubscribers');
