import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';

import { ApiError } from '../utils/ApiError';
import { logger } from '../utils/logger';
import { ApiErrorResponse } from '../types';

/** Body-parser JSON syntax errors arrive as SyntaxError with status 400. */
function isMalformedJsonError(error: unknown): boolean {
  return error instanceof SyntaxError && 'status' in error && error.status === 400;
}

function getErrorName(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'name' in error) {
    return String((error as { name?: unknown }).name);
  }
  return '';
}

function getErrorCode(error: unknown): number | string | undefined {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    return (error as { code?: number | string }).code;
  }
  return undefined;
}

/** Mongoose CastError means an invalid ObjectId was passed (e.g. bad :id). */
function isCastError(error: unknown): boolean {
  return error instanceof mongoose.Error.CastError;
}

/** Mongoose ValidationError means schema validation failed. */
function isMongooseValidationError(error: unknown): error is mongoose.Error.ValidationError {
  return error instanceof mongoose.Error.ValidationError;
}

/** Mongoose MongoServerError covers duplicate key (11000), connection issues, etc. */
function isMongoServerError(error: unknown): boolean {
  return getErrorName(error) === 'MongoServerError';
}

function sendError(res: Response, statusCode: number, code: ApiErrorResponse['error']['code'], message: string): void {
  const body: ApiErrorResponse = { error: { code, message, fields: {} } };
  res.status(statusCode).json(body);
}

/** Handles requests to routes that do not exist (mounted after all routes). */
export function notFoundHandler(req: Request, res: Response): void {
  sendError(res, 404, 'NOT_FOUND', `No API endpoint for ${req.method} ${req.originalUrl}.`);
}

/**
 * Central error handler (must take 4 args so Express treats it as one).
 * Never exposes stack traces or database details to clients.
 */
export function errorMiddleware(
  error: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (res.headersSent) {
    next(error);
    return;
  }

  if (error instanceof ApiError) {
    const body: ApiErrorResponse = {
      error: { code: error.code, message: error.message, fields: error.fields },
    };
    res.status(error.statusCode).json(body);
    return;
  }

  if (isMalformedJsonError(error)) {
    sendError(res, 400, 'BAD_REQUEST', 'Request body is not valid JSON.');
    return;
  }

  /* Invalid ObjectId in URL (e.g. /api/admin/reviews/not-a-uuid) → 404 */
  if (isCastError(error)) {
    sendError(
      res,
      404,
      'NOT_FOUND',
      'The requested resource was not found.',
    );
    return;
  }

  /* Schema validation failures (e.g. rating out of range) → 422 */
  if (isMongooseValidationError(error)) {
    const fields: Record<string, string> = {};
    for (const [path, detail] of Object.entries(error.errors)) {
      fields[path] = detail.message;
    }
    const firstMessage =
      Object.values(fields)[0] ?? 'Please check your submitted information.';
    const body: ApiErrorResponse = {
      error: { code: 'VALIDATION_FAILED', message: firstMessage, fields },
    };
    res.status(422).json(body);
    return;
  }

  /* Duplicate key (e.g. newsletter email already subscribed) → 409 */
  if (isMongoServerError(error) && Number(getErrorCode(error)) === 11000) {
    sendError(
      res,
      409,
      'CONFLICT',
      'This email is already subscribed to the newsletter.',
    );
    return;
  }

  /* MongoDB connection/server errors → 503 Service Unavailable */
  const codeStr = String(getErrorCode(error) ?? '');
  if (
    isMongoServerError(error) &&
    (codeStr === 'ETIMEDOUT' ||
      codeStr === 'ECONNREFUSED' ||
      codeStr === 'NS' ||
      (typeof error === 'object' && error !== null && 'reason' in error &&
        String((error as { reason?: unknown }).reason).includes('timed out')))
  ) {
    sendError(
      res,
      503,
      'INTERNAL',
      'Database is temporarily unavailable. Please try again later.',
    );
    return;
  }

  logger.error(`Unhandled error on ${req.method} ${req.originalUrl}`, error);
  sendError(res, 500, 'INTERNAL', 'Something went wrong on the server.');
}
