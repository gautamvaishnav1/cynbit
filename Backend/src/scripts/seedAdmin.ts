import 'dotenv/config';

import bcrypt from 'bcrypt';
import mongoose from 'mongoose';

import { connectDB } from '../config/db';
import { logger } from '../utils/logger';
import { Admin } from '../models/Admin';

/**
 * Safe admin initialization: `npm run seed`.
 * Reads ADMIN_EMAIL / ADMIN_PASSWORD from .env — creates the account when
 * missing, or syncs its password hash when it already exists. Idempotent.
 */
async function seedAdmin(): Promise<void> {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    logger.error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env before seeding.');
    process.exit(1);
  }
  if (password.length < 8) {
    logger.error('ADMIN_PASSWORD must be at least 8 characters long.');
    process.exit(1);
  }

  await connectDB();

  const passwordHash = await bcrypt.hash(password, 10);
  const existing = await Admin.findOne({ email });

  if (existing) {
    existing.passwordHash = passwordHash;
    await existing.save();
    logger.info(`Admin already existed — password hash synced for ${email}.`);
  } else {
    await Admin.create({ email, passwordHash });
    logger.info(`Admin created: ${email}`);
  }

  await mongoose.disconnect();
}

seedAdmin().catch((error: unknown) => {
  logger.error('Admin seed failed', error);
  process.exit(1);
});
