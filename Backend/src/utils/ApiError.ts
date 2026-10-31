import { ApiErrorCode } from '../types';

/**
 * An error that carries the HTTP status and contract error code,
 * so controllers can throw it and the error middleware formats the response.
 */
export class ApiError extends Error {
  readonly statusCode: number;
  readonly code: ApiErrorCode;
  readonly fields: Record<string, string>;

  constructor(
    statusCode: number,
    code: ApiErrorCode,
    message: string,
    fields: Record<string, string> = {},
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.fields = fields;
  }
}
