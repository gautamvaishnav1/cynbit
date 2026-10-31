import bcrypt from 'bcrypt';
import { Request, Response } from 'express';

import { ApiError } from '../utils/ApiError';
import { generateAdminToken } from '../utils/generateToken';
import { logger } from '../utils/logger';
import { LoginInput, LoginResponse } from '../types';
import { Admin } from '../models/Admin';

/**
 * POST /api/admin/auth/login (contract §3.6).
 * Wrong email and wrong password return the exact same message,
 * so the response never reveals which accounts exist.
 */
export async function login(req: Request, res: Response): Promise<void> {
  const input = req.body as LoginInput;
  const email = input.email.trim().toLowerCase();

  const invalidCredentials = new ApiError(
    401,
    'UNAUTHORIZED',
    'Invalid email or password.',
  );

  const admin = await Admin.findOne({ email });
  if (!admin) throw invalidCredentials;

  const passwordMatches = await bcrypt.compare(input.password, admin.passwordHash);
  if (!passwordMatches) throw invalidCredentials;

  const token = generateAdminToken({ id: admin._id, email: admin.email });
  logger.info(`Admin signed in: ${admin.email}`);

  const response: LoginResponse = { token, user: { email: admin.email } };
  res.status(200).json(response);
}
