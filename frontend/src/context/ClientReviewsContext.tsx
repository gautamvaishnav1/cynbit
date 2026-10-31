import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import type { ClientRatingSummary, ClientReview } from '../types';
import clientReviewService from '../services/clientReviewService';
import { computeClientRatingSummary } from '../utils/rating';

export interface ClientReviewsContextValue {
  /** Approved client reviews of the company, newest first. */
  reviews: ClientReview[];
  /** Aggregate roll-up derived from the approved list (zeroed when empty). */
  summary: ClientRatingSummary;
  /** True while the initial (simulated) fetch is in flight. */
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const ClientReviewsContext = createContext<ClientReviewsContextValue | null>(null);

/**
 * Shared source of truth for the public client-reviews section
 * ("what customers say about Cynbit").
 *
 * Only approved reviews are ever loaded here — pending/rejected entries
 * stay behind the admin API. Swap `clientReviewService` for a REST client
 * later — this provider does not need to change.
 */
export function ClientReviewsProvider({ children }: { children: ReactNode }) {
  const [reviews, setReviews] = useState<ClientReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const approved = await clientReviewService.getClientReviews();
      setReviews(approved);
      setError(null);
    } catch {
      setError('We could not load client reviews right now. Please try again shortly.');
    }
  }, []);

  useEffect(() => {
    let active = true;

    setLoading(true);
    void load().finally(() => {
      if (active) setLoading(false);
    });

    const unsubscribe = clientReviewService.subscribeClientReviews(() => {
      void load();
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [load]);

  const summary = useMemo(() => computeClientRatingSummary(reviews), [reviews]);

  const refresh = useCallback(async () => {
    await load();
  }, [load]);

  const value = useMemo<ClientReviewsContextValue>(
    () => ({ reviews, summary, loading, error, refresh }),
    [reviews, summary, loading, error, refresh],
  );

  return <ClientReviewsContext.Provider value={value}>{children}</ClientReviewsContext.Provider>;
}

/** Accessor with a helpful error when used outside the provider. */
export function useClientReviewsContext(): ClientReviewsContextValue {
  const context = useContext(ClientReviewsContext);
  if (!context) {
    throw new Error('useClientReviewsContext must be used inside a <ClientReviewsProvider>');
  }
  return context;
}
