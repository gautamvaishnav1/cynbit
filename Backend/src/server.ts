import 'dotenv/config';

import app from './app';
import { connectDB } from './config/db';
import { logger } from './utils/logger';

const REQUIRED_ENV_VARS = ['MONGODB_URI', 'JWT_SECRET'] as const;
const JWT_SECRET_MIN_LENGTH = 16;

function reportMissingEnvVars(): void {
  const missing = REQUIRED_ENV_VARS.filter((name) => !process.env[name]);
  if (missing.length === 0) return;

  logger.error(
    `Missing environment variables: ${missing.join(', ')}. Copy .env.example to .env and set it.`,
  );
  process.exit(1);
}

function validateJwtSecret(): void {
  const secret = process.env.JWT_SECRET ?? '';
  if (secret.length < JWT_SECRET_MIN_LENGTH) {
    logger.error(
      `JWT_SECRET must be at least ${JWT_SECRET_MIN_LENGTH} characters long. Generate a strong random value.`,
    );
    process.exit(1);
  }
}

function readPort(): number {
  const raw = process.env.PORT ?? '4000';
  const port = Number(raw);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`PORT must be a valid port number, received "${raw}".`);
  }
  return port;
}

let server: ReturnType<typeof app.listen> | null = null;

async function startServer(): Promise<void> {
  reportMissingEnvVars();
  validateJwtSecret();

  try {
    await connectDB();
    const port = readPort();
    server = app.listen(port, () => {
      logger.info(`Server running at http://localhost:${port}`);
    });
  } catch (error) {
    logger.error('Server failed to start', error);
    process.exit(1);
  }
}

/**
 * Graceful shutdown: stop accepting new requests, finish in-flight ones,
 * then close MongoDB before the process exits.
 */
async function shutdown(signal: string): Promise<void> {
  logger.info(`Received ${signal}, shutting down gracefully...`);
  if (server) {
    await new Promise<void>((resolve) => server!.close(() => resolve()));
    logger.info('HTTP server closed.');
  }
  try {
    await mongooseDisconnect();
    logger.info('MongoDB connection closed.');
  } catch (error) {
    logger.error('Error closing MongoDB connection', error);
  }
  process.exit(0);
}

async function mongooseDisconnect(): Promise<void> {
  const mongoose = await import('mongoose');
  await mongoose.disconnect();
}

process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));

/* Crash clearly on uncaught promise rejections instead of silently hanging. */
process.on('unhandledRejection', (reason: unknown) => {
  logger.error('Unhandled promise rejection', reason);
  process.exit(1);
});

startServer();
