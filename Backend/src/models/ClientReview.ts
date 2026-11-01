import { Collection } from '../storage';

import { REVIEW_STATUSES, ReviewStatus } from '../types';

export interface ClientReviewRecord {
  _id: string;
  clientName: string;
  clientTitle: string;
  rating: number;
  comment: string;
  source?: string;
  status: ReviewStatus;
  createdAt: Date;
}

export type ClientReviewDoc = ClientReviewRecord & {
  save(): Promise<ClientReviewDoc>;
  deleteOne(): Promise<void>;
};

export const ClientReview = new Collection<ClientReviewRecord>('clientReviews');

function hydrate(doc: ClientReviewRecord): ClientReviewDoc {
  return Object.assign(doc, {
    createdAt: new Date(doc.createdAt),
  }) as ClientReviewDoc;
}

const originalFind = ClientReview.find.bind(ClientReview);
ClientReview.find = async (query?: Partial<ClientReviewRecord>) => {
  const q = await originalFind(query);
  const originalThen = q.then.bind(q);
  q.then = (onfulfilled?: any, onrejected?: any) =>
    originalThen((docs: ClientReviewRecord[]) => docs.map(hydrate), onrejected);
  return q;
};

const originalFindOne = ClientReview.findOne.bind(ClientReview);
ClientReview.findOne = async (query: Partial<ClientReviewRecord>) => {
  const doc = await originalFindOne(query);
  return doc ? hydrate(doc) : null;
};

const originalFindById = ClientReview.findById.bind(ClientReview);
ClientReview.findById = async (id: string) => {
  const doc = await originalFindById(id);
  return doc ? hydrate(doc) : null;
};

const originalCreate = ClientReview.create.bind(ClientReview);
ClientReview.create = async (input: Omit<ClientReviewRecord, '_id'>) => {
  const doc = await originalCreate({ ...input, createdAt: new Date() });
  return hydrate(doc);
};
