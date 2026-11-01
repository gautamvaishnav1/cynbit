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

export type DemoRequestDoc = DemoRequestRecord & {
  save(): Promise<DemoRequestDoc>;
};

export const DemoRequest = new Collection<DemoRequestRecord>('demoRequests');

function hydrate(doc: DemoRequestRecord): DemoRequestDoc {
  return Object.assign(doc, {
    createdAt: new Date(doc.createdAt),
  }) as DemoRequestDoc;
}

const originalCreate = DemoRequest.create.bind(DemoRequest);
DemoRequest.create = async (input: Omit<DemoRequestRecord, '_id'>) => {
  const doc = await originalCreate({ ...input, createdAt: new Date() });
  return hydrate(doc);
};
