import { Collection } from '../storage';

export interface NewsletterSubscriberRecord {
  _id: string;
  email: string;
  createdAt: Date;
}

export type NewsletterSubscriberDoc = NewsletterSubscriberRecord & {
  save(): Promise<NewsletterSubscriberDoc>;
};

export const NewsletterSubscriber = new Collection<NewsletterSubscriberRecord>('newsletterSubscribers');

function hydrate(doc: NewsletterSubscriberRecord): NewsletterSubscriberDoc {
  return Object.assign(doc, {
    createdAt: new Date(doc.createdAt),
  }) as NewsletterSubscriberDoc;
}

const originalFindOne = NewsletterSubscriber.findOne.bind(NewsletterSubscriber);
NewsletterSubscriber.findOne = async (query: Partial<NewsletterSubscriberRecord>) => {
  const doc = await originalFindOne(query);
  return doc ? hydrate(doc) : null;
};

const originalCreate = NewsletterSubscriber.create.bind(NewsletterSubscriber);
NewsletterSubscriber.create = async (input: Omit<NewsletterSubscriberRecord, '_id'>) => {
  const doc = await originalCreate({ ...input, createdAt: new Date() });
  return hydrate(doc);
};
