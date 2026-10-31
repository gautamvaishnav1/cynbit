import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import type { ProductId, Review, ReviewInput } from '../types';
import { productIds } from '../data/products';
import reviewService from '../services/reviewService';

export interface ReviewsContextValue {
  /** Approved reviews keyed by product id. */
  reviewsByProduct: Record<ProductId, Review[]>;
  /** True while the initial (simulated) fetch is in flight. */
  loading: boolean;
  error: string | null;
  /** True while a submission is being processed. */
  submitting: boolean;
  submitReview: (input: ReviewInput) => Promise<Review>;
  refresh: () => Promise<void>;
}

const ReviewsContext = createContext<ReviewsContextValue | null>(null);

function emptyBucket(): Record<ProductId, Review[]> {
  return {
    'cynbit-studio': [],
    tenantease: [],
    revio: [],
  };
}

/**
 * Single source of truth for review data across the app.
 *
 * Loads once on mount from the isolated review service, stays subscribed to
 * local mutations, and exposes an async submit action so the UI can render
 * accurate pending states. Swap `reviewService` for a REST client later —
 * this provider does not need to change.
 */
export function ReviewsProvider({ children }: { children: ReactNode }) {
  const [reviewsByProduct, setReviewsByProduct] = useState<Record<ProductId, Review[]>>(
    emptyBucket,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadAll = useCallback(async () => {
    try {
      const results = await Promise.all(productIds.map((id) => reviewService.getReviews(id)));
      const next = emptyBucket();
      productIds.forEach((id, index) => {
        next[id] = results[index] ?? [];
      });
      setReviewsByProduct(next);
      setError(null);
    } catch {
      setError('We could not load reviews right now. Please try again shortly.');
    }
  }, []);

  useEffect(() => {
    let active = true;

    setLoading(true);
    void loadAll().finally(() => {
      if (active) setLoading(false);
    });

    const unsubscribe = reviewService.subscribeReviews(() => {
      void loadAll();
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [loadAll]);

  const submitReview = useCallback(async (input: ReviewInput): Promise<Review> => {
    setSubmitting(true);
    try {
      return await reviewService.submitReview(input);
    } finally {
      setSubmitting(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    await loadAll();
  }, [loadAll]);

  const value = useMemo<ReviewsContextValue>(
    () => ({ reviewsByProduct, loading, error, submitting, submitReview, refresh }),
    [reviewsByProduct, loading, error, submitting, submitReview, refresh],
  );

  return <ReviewsContext.Provider value={value}>{children}</ReviewsContext.Provider>;
}

/** Internal accessor with a helpful error when used outside the provider. */
export function useReviewsContext(): ReviewsContextValue {
  const context = useContext(ReviewsContext);
  if (!context) {
    throw new Error('useReviewsContext must be used inside a <ReviewsProvider>');
  }
  return context;
}
