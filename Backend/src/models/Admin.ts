import { Collection } from '../storage';

export interface AdminRecord {
  _id: string;
  email: string;
  passwordHash: string;
  role: string;
  createdAt: Date;
}

export type AdminDoc = AdminRecord & {
  save(): Promise<AdminDoc>;
};

export const Admin = new Collection<AdminRecord>('adminUsers');

function hydrate(doc: AdminRecord): AdminDoc {
  return Object.assign(doc, {
    createdAt: new Date(doc.createdAt),
  }) as AdminDoc;
}

const originalFindOne = Admin.findOne.bind(Admin);
Admin.findOne = async (query: Partial<AdminRecord>) => {
  const doc = await originalFindOne(query);
  return doc ? hydrate(doc) : null;
};

const originalCreate = Admin.create.bind(Admin);
Admin.create = async (input: Omit<AdminRecord, '_id'>) => {
  const doc = await originalCreate({ ...input, createdAt: new Date() });
  return hydrate(doc);
};
