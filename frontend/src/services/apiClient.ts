/* ------------------------------------------------------------------
   Shared fetch wrapper for the Cynbit backend (JSON.md contract).

   Reads VITE_API_BASE_URL from the frontend .env, sends JSON, attaches
   the admin Bearer token when present, and normalises error payloads so
   services can `throw new Error(message)` the same way the old localStorage
   implementation did.
------------------------------------------------------------------- */

const BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(
  /\/+$/,
  '',
);

/** True when a real API is configured (VITE_API_BASE_URL is set). */
export const API_ENABLED = Boolean(BASE_URL);

const TOKEN_KEY = 'cynbit.admin.token';

export function getToken(): string | null {
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null): void {
  try {
    if (token) window.localStorage.setItem(TOKEN_KEY, token);
    else window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

export class ApiError extends Error {
  readonly status: number;
  readonly fields: Record<string, string>;

  constructor(status: number, message: string, fields: Record<string, string> = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fields = fields;
  }
}

/** Build an API URL from a path like `/api/products/revio/reviews`. */
export function apiUrl(path: string): string {
  if (!BASE_URL) throw new Error('VITE_API_BASE_URL is not configured.');
  return `${BASE_URL}${path}`;
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  /** Public endpoints never send the admin token. */
  admin?: boolean;
}

/** Perform a JSON request and return the parsed body (or undefined for 204). */
export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, admin = false } = options;

  const headers: Record<string, string> = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (admin) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(apiUrl(path), {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(
      0,
      'Could not reach the server. Please start the backend and try again.',
    );
  }

  if (response.status === 204) return undefined as T;

  const text = await response.text();
  let payload: unknown = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = null;
    }
  }

  if (!response.ok) {
    const envelope = payload as
      | { error?: { message?: string; fields?: Record<string, string> } }
      | null;
    const message = envelope?.error?.message ?? `Request failed (${response.status}).`;
    const fields = envelope?.error?.fields ?? {};
    throw new ApiError(response.status, message, fields);
  }

  return payload as T;
}
