import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';

import { ApiError } from '../utils/ApiError';

/** True when the body contains at least one of the allowed keys. */
export function hasAtLeastOneKey(value: unknown, keys: string[]): boolean {
  if (typeof value !== 'object' || value === null) return false;
  const record = value as Record<string, unknown>;
  return keys.some((key) => key in record);
}

/**
 * Runs after express-validator chains: any failure becomes a
 * 422 VALIDATION_FAILED error with a per-field message map (contract §5).
 */
export function validateRequest(req: Request, _res: Response, next: NextFunction): void {
  const result = validationResult(req);
  if (result.isEmpty()) {
    next();
    return;
  }

  const fields: Record<string, string> = {};
  let bodyLevelMessage: string | undefined;
  for (const error of result.array()) {
    if (error.type !== 'field') continue;
    /* body()-level errors have no field name — they only set the message. */
    if (error.path === '') {
      bodyLevelMessage ??= error.msg;
      continue;
    }
    if (!fields[error.path]) {
      fields[error.path] = error.msg;
    }
  }

  const firstMessage =
    Object.values(fields)[0] ?? bodyLevelMessage ?? 'Please check your submitted information.';
  next(new ApiError(422, 'VALIDATION_FAILED', firstMessage, fields));
}
