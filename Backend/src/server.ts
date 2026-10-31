import 'dotenv/config';

import app from './app';
import { connectDB } from './config/db';
import { logger } from './utils/logger';

const REQUIRED_ENV_VARS = ['MONGODB_URI', 'JWT_SECRET'] as const;

function reportMissingEnvVars(): void {
  const missing = REQUIRED_ENV_VARS.filter((name) => !process.env[name]);
  if (missing.length === 0) return;

  logger.error(
    `Missing environment variables: ${missing.join(', ')}. Copy .env.example to .env and fill in the values.`,
  );
  process.exit(1);
}

function readPort(): number {
  const raw = process.env.PORT ?? '4000';
  const port = Number(raw);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`PORT must be a valid port number, received "${raw}".`);
  }
  return port;
}

async function startServer(): Promise<void> {
  reportMissingEnvVars();

  try {
    await connectDB();
    const port = readPort();
    app.listen(port, () => {
      logger.info(`Server running at http://localhost:${port}`);
    });
  } catch (error) {
    logger.error('Server failed to start', error);
    process.exit(1);
  }
}

startServer();
