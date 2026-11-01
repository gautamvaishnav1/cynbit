import { ensureDir } from '../storage';

import { logger } from '../utils/logger';

/* No external database: data lives in JSON files under ./data/.
   This replaces the MongoDB/Mongoose connection for local development. */
export async function connectDB(): Promise<void> {
  await ensureDir();
  logger.info('File storage initialized (data directory ready)');
}
