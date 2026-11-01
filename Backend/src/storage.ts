import fs from 'node:fs/promises';
import path from 'node:path';

/* ------------------------------------------------------------------
   JSON file-based storage. Used instead of MongoDB so the backend can
   run locally without an external database. Data lives in ./data/
   relative to the backend working directory.
------------------------------------------------------------------- */

const DATA_DIR = path.join(process.cwd(), 'data');

async function ensureDir(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

function filePath(name: string): string {
  return path.join(DATA_DIR, `${name}.json`);
}

async function readFile<T>(name: string): Promise<T[]> {
  await ensureDir();
  try {
    const raw = await fs.readFile(filePath(name), 'utf-8');
    return JSON.parse(raw) as T[];
  } catch {
    return [];
  }
}

async function writeFile<T>(name: string, data: T[]): Promise<void> {
  await ensureDir();
  await fs.writeFile(filePath(name), JSON.stringify(data, null, 2));
}

/** Collection backed by a single JSON file. Returns plain objects;
   controllers sort arrays after awaiting (no Mongoose chaining). */
export class Collection<T extends { _id: string }> {
  private name: string;

  constructor(name: string) {
    this.name = name;
  }

  private async read(): Promise<T[]> {
    return readFile<T>(this.name);
  }

  private async write(data: T[]): Promise<void> {
    await writeFile<T>(this.name, data);
  }

  async find(query: Partial<T> = {}): Promise<T[]> {
    const data = await this.read();
    return data.filter((doc) => {
      return Object.entries(query).every(([k, v]) => {
        const docVal = (doc as Record<string, unknown>)[k];
        return docVal === v;
      });
    });
  }

  async findOne(query: Partial<T>): Promise<T | null> {
    const data = await this.read();
    return (
      data.find((doc) => {
        return Object.entries(query).every(([k, v]) => {
          const docVal = (doc as Record<string, unknown>)[k];
          return docVal === v;
        });
      }) ?? null
    );
  }

  async findById(id: string): Promise<T | null> {
    const data = await this.read();
    return data.find((doc) => doc._id === id) ?? null;
  }

  async create(input: Omit<T, '_id'>): Promise<T> {
    const data = await this.read();
    const doc: T = { ...input, _id: crypto.randomUUID() } as T;
    data.push(doc);
    await this.write(data);
    return doc;
  }

  /** Persist changes to an existing doc (replaces Mongoose `doc.save()`). */
  async save(doc: T): Promise<void> {
    const data = await this.read();
    const idx = data.findIndex((d) => d._id === doc._id);
    if (idx >= 0) data[idx] = doc;
    await this.write(data);
  }

  /** Remove a doc by id (replaces Mongoose `doc.deleteOne()`). */
  async deleteOne(id: string): Promise<void> {
    const data = await this.read();
    const idx = data.findIndex((d) => d._id === id);
    if (idx >= 0) data.splice(idx, 1);
    await this.write(data);
  }

  async countDocuments(query: Partial<T> = {}): Promise<number> {
    const data = await this.read();
    return data.filter((doc) => {
      return Object.entries(query).every(([k, v]) => {
        const docVal = (doc as Record<string, unknown>)[k];
        return docVal === v;
      });
    }).length;
  }
}

export { ensureDir, DATA_DIR };
