import { NextFunction, Request, Response } from 'express';

import { ApiError } from '../utils/ApiError';
import { logger } from '../utils/logger';

interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
}

interface HitRecord {
  count: number;
  resetAt: number;
}

/**
 * Simple per-IP fixed-window limiter (no extra dependency).
 * Used for admin login and public review submission.
 */
export function createRateLimiter(name: string, options: RateLimitOptions) {
  const hits = new Map<string, HitRecord>();

  const cleanupTimer = setInterval(() => {
    const now = Date.now();
    hits.forEach((record, key) => {
      if (record.resetAt <= now) hits.delete(key);
    });
  }, options.windowMs);
  cleanupTimer.unref();

  return function rateLimit(req: Request, res: Response, next: NextFunction): void {
    const now = Date.now();
    /* With trust proxy enabled, req.ip is the real client IP even behind a load balancer. */
    const key = req.ip ?? req.socket?.remoteAddress ?? 'unknown-ip';
    let record = hits.get(key);

    if (!record || record.resetAt <= now) {
      record = { count: 0, resetAt: now + options.windowMs };
      hits.set(key, record);
    }

    record.count += 1;
    if (record.count > options.maxRequests) {
      const retryAfterSeconds = Math.ceil((record.resetAt - now) / 1000);
      res.setHeader('Retry-After', String(retryAfterSeconds));
      logger.warn(`Rate limit "${name}" exceeded for ${key}`);
      next(
        new ApiError(
          429,
          'RATE_LIMITED',
          'Too many requests. Please wait a moment and try again.',
        ),
      );
      return;
    }

    next();
  };
}
