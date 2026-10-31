import mongoose from 'mongoose';
import { NextFunction, Request, Response } from 'express';

import { ApiError } from '../utils/ApiError';
import { logger } from '../utils/logger';
import { ApiErrorResponse } from '../types';

/** Body-parser JSON syntax errors arrive as SyntaxError with status 400. */
function isMalformedJsonError(error: unknown): boolean {
  return error instanceof SyntaxError && 'status' in error && error.status === 400;
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

  /* Second safety net: schema-level failures still answer as 422. */
  if (error instanceof mongoose.Error.ValidationError) {
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

  logger.error(`Unhandled error on ${req.method} ${req.originalUrl}`, error);
  sendError(res, 500, 'INTERNAL', 'Something went wrong on the server.');
}
