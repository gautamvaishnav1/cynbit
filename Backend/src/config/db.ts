import mongoose from 'mongoose';

import { logger } from '../utils/logger';

/** Connect to MongoDB using MONGODB_URI from the .env file. */
export async function connectDB(): Promise<void> {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('MONGODB_URI is missing. Copy .env.example to .env and set it.');
  }

  await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
  });
  logger.info(`MongoDB connected: ${mongoose.connection.name}`);
}

/* Log unexpected connection drops instead of crashing silently. */
mongoose.connection.on('error', (error: Error) => {
  logger.error('MongoDB connection error', error);
});

/* Log reconnections for ops monitoring. */
mongoose.connection.on('reconnected', () => {
  logger.info('MongoDB reconnected.');
});
