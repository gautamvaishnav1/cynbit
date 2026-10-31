import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { ApiError } from '../utils/ApiError';
import { logger } from '../utils/logger';
import { AdminTokenInfo } from '../types';

interface AdminTokenPayload {
  sub?: unknown;
  email?: unknown;
  role?: unknown;
}

function readBearerToken(req: Request): string {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required. Please sign in.');
  }
  return header.slice('Bearer '.length).trim();
}

function verifyToken(token: string): AdminTokenInfo {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    logger.error('JWT_SECRET is not configured — cannot verify admin tokens.');
    throw new ApiError(500, 'INTERNAL', 'Authentication is not available right now.');
  }

  let decoded: unknown;
  try {
    decoded = jwt.verify(token, secret);
  } catch {
    throw new ApiError(401, 'UNAUTHORIZED', 'Your session is invalid or has expired.');
  }

  if (typeof decoded !== 'object' || decoded === null) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Your session is invalid or has expired.');
  }

  const payload = decoded as AdminTokenPayload;
  if (payload.role !== 'admin' || typeof payload.email !== 'string') {
    throw new ApiError(403, 'FORBIDDEN', 'This account cannot access the admin API.');
  }

  return {
    id: typeof payload.sub === 'string' ? payload.sub : '',
    email: payload.email,
  };
}

/** Protects every /api/admin/* route except login. */
export function requireAdmin(req: Request, _res: Response, next: NextFunction): void {
  req.admin = verifyToken(readBearerToken(req));
  next();
}
