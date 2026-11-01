import { useEffect, useState } from 'react';

import { API_ENABLED, getToken, setToken } from '../services/apiClient';

/**
 * Admin session for the review panel.
 *
 * WITH VITE_API_BASE_URL (real mode): `signIn(email, password)` calls
 * POST /api/admin/auth/login. Only the seeded admin account
 * (ADMIN_EMAIL / ADMIN_PASSWORD in the backend .env) receives a JWT; the
 * token is stored and sent as `Authorization: Bearer <token>` on every
 * admin request. Invalid credentials fail with the server's message.
 *
 * WITHOUT the env var (offline demo mode): any email/password opens the
 * demo dashboard — clearly labelled as a demo gate, no security.
 *
 * State lives in a tiny module-level store (mirrored to sessionStorage)
 * so the sign-in form and the layout gate stay in sync.
 */
const SESSION_KEY = 'cynbit.prototype.adminSession.v1';
const EMAIL_KEY = `${SESSION_KEY}.email`;

function readFlag(): boolean {
  try {
    if (API_ENABLED) return Boolean(getToken());
    return window.sessionStorage.getItem(SESSION_KEY) === 'active';
  } catch {
    return false;
  }
}

function readEmail(): string | null {
  try {
    return window.sessionStorage.getItem(EMAIL_KEY);
  } catch {
    return null;
  }
}

let store = { signedIn: readFlag(), signedInAs: readEmail() };
const listeners = new Set<() => void>();

function notify(): void {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export interface AdminSession {
  signedIn: boolean;
  /** Address captured at sign-in, shown in the admin top bar. */
  signedInAs: string | null;
  /** True when sign-in authenticates against the backend. */
  realAuth: boolean;
  /** Resolves on success; throws an Error with the message to display. */
  signIn: (email: string, password?: string) => Promise<void>;
  signOut: () => void;
}

export function useAdminSession(): AdminSession {
  const [, forceRender] = useState(0);

  useEffect(() => {
    const unsubscribe = subscribe(() => forceRender((count) => count + 1));

    // Keep in sync when another tab changes the flag.
    const onStorage = () => {
      store = { signedIn: readFlag(), signedInAs: readEmail() };
      forceRender((count) => count + 1);
    };
    window.addEventListener('storage', onStorage);

    return () => {
      unsubscribe();
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const signIn = async (email: string, password?: string): Promise<void> => {
    if (API_ENABLED) {
      const { request } = await import('../services/apiClient');
      const response = await request<{ token: string; user: { email: string } }>(
        '/api/admin/auth/login',
        { method: 'POST', body: { email, password: password ?? '' } },
      );
      setToken(response.token);
      try {
        window.sessionStorage.setItem(EMAIL_KEY, response.user.email);
      } catch {
        /* Storage unavailable */
      }
      store = { signedIn: true, signedInAs: response.user.email };
      notify();
      return;
    }

    try {
      window.sessionStorage.setItem(SESSION_KEY, 'active');
      window.sessionStorage.setItem(EMAIL_KEY, email);
    } catch {
      /* Storage unavailable — in-memory state still works for the tab. */
    }
    store = { signedIn: true, signedInAs: email };
    notify();
  };

  const signOut = () => {
    setToken(null);
    try {
      window.sessionStorage.removeItem(SESSION_KEY);
      window.sessionStorage.removeItem(EMAIL_KEY);
    } catch {
      /* ignore */
    }
    store = { signedIn: false, signedInAs: null };
    notify();
  };

  return {
    signedIn: store.signedIn,
    signedInAs: store.signedInAs,
    realAuth: API_ENABLED,
    signIn,
    signOut,
  };
}

export default useAdminSession;
