import { useEffect, useState } from 'react';

/**
 * Prototype admin session.
 *
 * IMPORTANT: this is NOT authentication. There is no backend, no password
 * check and no security — the flag below only hides the demo dashboard UI
 * behind a sign-in screen so the flow feels realistic. A real deployment
 * must use server-side auth (session cookies / JWT) with role checks on
 * every admin endpoint.
 *
 * State lives in a tiny module-level store (mirrored to sessionStorage) so
 * every consumer of this hook shares one source of truth — the sign-in
 * form and the layout that gates the dashboard stay in sync.
 */
const SESSION_KEY = 'cynbit.prototype.adminSession.v1';
const EMAIL_KEY = `${SESSION_KEY}.email`;

function readFlag(): boolean {
  try {
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
  signIn: (email: string) => void;
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

  const signIn = (email: string) => {
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
    try {
      window.sessionStorage.removeItem(SESSION_KEY);
      window.sessionStorage.removeItem(EMAIL_KEY);
    } catch {
      /* ignore */
    }
    store = { signedIn: false, signedInAs: null };
    notify();
  };

  return { signedIn: store.signedIn, signedInAs: store.signedInAs, signIn, signOut };
}

export default useAdminSession;
