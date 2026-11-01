import { ApiError } from '../utils/ApiError';
import jwt, { SignOptions } from 'jsonwebtoken';

/** Sign a short-lived admin JWT using JWT_SECRET from the .env file. */
export function generateAdminToken(admin: { id: string; email: string }): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new ApiError(500, 'INTERNAL', 'Authentication is not configured on the server.');
  }

  const options: SignOptions = {
    subject: admin.id,
    /* JWT_EXPIRES_IN is a duration string like "7d" (ms library format). */
    expiresIn: (process.env.JWT_EXPIRES_IN ?? '7d') as SignOptions['expiresIn'],
  };

  return jwt.sign({ email: admin.email, role: 'admin' }, secret, options);
}
