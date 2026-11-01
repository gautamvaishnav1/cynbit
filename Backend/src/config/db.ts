import mongoose from 'mongoose';

import { logger } from '../utils/logger';

/** True once Mongoose has successfully connected to MongoDB. */
export let isDBConnected = false;

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
    logger.error('MONGODB_URI is missing. Copy .env.example to .env and set it.');
    return;
  }

  let lastError: unknown = null;

  for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
    try {
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
        socketTimeoutMS: 45000,
      });
      isDBConnected = true;
      logger.info(`MongoDB connected: ${mongoose.connection.name}`);
      return;
    } catch (error) {
      lastError = error;
      logger.warn(
        `MongoDB connection attempt ${attempt}/${maxRetries} failed: ${(error as Error).message}`,
      );

      if (attempt < maxRetries) {
        const delayMs = baseDelayMs * attempt;
        logger.info(`Retrying MongoDB connection in ${delayMs}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  isDBConnected = false;
  logger.error(
    `MongoDB connection failed after ${maxRetries} attempts. Last error: ${
      lastError as Error
    }`,
  );
  /* Do not throw — keep the HTTP server running so health checks still work.
     Routes will return 503 until MongoDB is reachable. */
}

/* Log unexpected connection drops instead of crashing silently. */
mongoose.connection.on('error', (error: Error) => {
  isDBConnected = false;
  logger.error('MongoDB connection error', error);
});

/* Log reconnections for ops monitoring. */
mongoose.connection.on('reconnected', () => {
  isDBConnected = true;
  logger.info('MongoDB reconnected.');
});

/* When the connection is lost, mark DB as disconnected so routes can respond 503. */
mongoose.connection.on('disconnected', () => {
  isDBConnected = false;
  logger.warn('MongoDB disconnected.');
});
