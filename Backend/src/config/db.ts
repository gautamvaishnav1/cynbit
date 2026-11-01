import mongoose from 'mongoose';

import { logger } from '../utils/logger';

/** True once Mongoose has successfully connected to MongoDB. */
export let isDBConnected = false;

/**
 * Mask credentials in a MongoDB URI for safe logging.
 * e.g. mongodb://user:pass@host:27017/db -> mongodb://user:***@host:27017/db
 */
function maskMongoUri(uri: string): string {
  try {
    return uri.replace(/(:\/\/[^:]+):[^@]+@/, '$1:***@');
  } catch {
    return '[invalid URI]';
  }
}

/**
 * Connect to MongoDB using MONGODB_URI from the .env file.
 * Retries with exponential backoff so a temporary network blip
 * does not take the whole server down.
 *
 * @param maxRetries – how many times to retry before giving up (default 5)
 * @param baseDelayMs – delay before the first retry (default 2000ms)
 */
export async function connectWithRetry(
  maxRetries: number = 5,
  baseDelayMs: number = 2000,
): Promise<void> {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    logger.error(
      '[DB] MONGODB_URI is missing. Copy .env.example to .env and set it.',
    );
    return;
  }

  logger.info(
    `[DB] Starting MongoDB connection to ${maskMongoUri(mongoUri)}`,
  );

  let lastError: unknown = null;

  for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
    try {
      logger.info(
        `[DB] Connection attempt ${attempt}/${maxRetries} (timeout 10s)...`,
      );

      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
        socketTimeoutMS: 45000,
      });

      isDBConnected = true;
      logger.info(
        `[DB] MongoDB connected successfully: ${mongoose.connection.name}`,
      );
      return;
    } catch (error) {
      lastError = error;
      const errMsg =
        error instanceof Error ? error.message : String(error);
      const errName =
        error instanceof Error ? error.name : 'UnknownError';

      logger.warn(
        `[DB] Connection attempt ${attempt}/${maxRetries} failed — ${errName}: ${errMsg}`,
      );

      if (attempt < maxRetries) {
        const delayMs = baseDelayMs * attempt;
        logger.info(
          `[DB] Retrying MongoDB connection in ${delayMs}ms (${attempt}/${maxRetries})...`,
        );
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  isDBConnected = false;
  const lastErrMsg =
    lastError instanceof Error ? lastError.message : String(lastError);
  logger.error(
    `[DB] MongoDB connection failed after ${maxRetries} attempts. Last error: ${lastErrMsg}`,
  );
  /* Do not throw — keep the HTTP server running so health checks still work.
     Routes will return 503 until MongoDB is reachable. */
}

/* Log unexpected connection drops instead of crashing silently. */
mongoose.connection.on('error', (error: Error) => {
  isDBConnected = false;
  logger.error(
    `[DB] MongoDB connection error — ${error.name}: ${error.message}`,
    error,
  );
});

/* Log reconnections for ops monitoring. */
mongoose.connection.on('reconnected', () => {
  isDBConnected = true;
  logger.info('[DB] MongoDB reconnected.');
});

/* When the connection is lost, mark DB as disconnected so routes can respond 503. */
mongoose.connection.on('disconnected', () => {
  isDBConnected = false;
  logger.warn('[DB] MongoDB disconnected.');
});
