import { Collection } from '../storage';

import { PRODUCT_IDS, ProductId, REVIEW_STATUSES, ReviewStatus } from '../types';

/** One stored row of the `reviews` collection (file-backed instead of MongoDB). */
export interface ReviewRecord {
  _id: string;
  productId: ProductId;
  customerName: string;
  /** Stored for verification only — never sent on public endpoints. */
  email: string;
  rating: number;
  comment: string;
  status: ReviewStatus;
  createdAt: Date;
}

export type ReviewDoc = ReviewRecord & {
  save(): Promise<ReviewDoc>;
  deleteOne(): Promise<void>;
};

export const Review = new Collection<ReviewRecord>('reviews');

/** Ensure dates are real Date instances after JSON round-trip. */
function hydrate(doc: ReviewRecord): ReviewDoc {
  return Object.assign(doc, {
    createdAt: new Date(doc.createdAt),
  }) as ReviewDoc;
}

/* Wrap collection methods to hydrate dates. */
const originalFind = Review.find.bind(Review);
Review.find = async (query?: Partial<ReviewRecord>) => {
  const q = await originalFind(query);
  // Query is chainable; we need to hydrate on .then(). Replace then.
  const originalThen = q.then.bind(q);
  q.then = (onfulfilled?: any, onrejected?: any) =>
    originalThen((docs: ReviewRecord[]) => docs.map(hydrate), onrejected);
  return q;
};

const originalFindOne = Review.findOne.bind(Review);
Review.findOne = async (query: Partial<ReviewRecord>) => {
  const doc = await originalFindOne(query);
  return doc ? hydrate(doc) : null;
};

const originalFindById = Review.findById.bind(Review);
Review.findById = async (id: string) => {
  const doc = await originalFindById(id);
  return doc ? hydrate(doc) : null;
};

const originalCreate = Review.create.bind(Review);
Review.create = async (input: Omit<ReviewRecord, '_id'>) => {
  const doc = await originalCreate({ ...input, createdAt: new Date() });
  return hydrate(doc);
};
