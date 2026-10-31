import { useCallback, useEffect, useMemo, useState } from 'react';

import type { ProductId, RatingSummary, Review, ReviewStatus } from '../types';
import { computeRatingSummary } from '../utils/rating';
import reviewService from '../services/reviewService';
import { useReviewsContext } from '../context/ReviewsContext';

export { ReviewsProvider, useReviewsContext } from '../context/ReviewsContext';
export type { ReviewsContextValue } from '../context/ReviewsContext';

/** Full review store shared across every product section. */
export function useReviews() {
  return useReviewsContext();
}

/** Reviews + derived rating summary for one product. */
export function useProductReviews(productId: ProductId) {
  const { reviewsByProduct, loading, error, submitting, submitReview, refresh } =
    useReviewsContext();

  const reviews = useMemo(
    () => reviewsByProduct[productId] ?? [],
    [reviewsByProduct, productId],
  );

  const summary = useMemo<RatingSummary>(
    () => computeRatingSummary(productId, reviews),
    [productId, reviews],
  );

  return { reviews, summary, loading, error, submitting, submitReview, refresh };
}

/* ------------------------------------------------------------------
   Admin-side hook: every review (all statuses) plus moderation actions.
   Mutations go through the isolated service; the public ReviewsContext
   re-loads automatically because it subscribes to the same service.
------------------------------------------------------------------- */

export interface AllReviewsAdmin {
  reviews: Review[];
  loading: boolean;
  error: string | null;
  /** Ids with an in-flight moderation action (for row-level spinners). */
  busyIds: string[];
  setStatus: (id: string, status: ReviewStatus) => Promise<boolean>;
  update: (id: string, patch: { rating?: number; comment?: string }) => Promise<boolean>;
  remove: (id: string) => Promise<boolean>;
  refresh: () => Promise<void>;
}

export function useAllReviews(): AllReviewsAdmin {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyIds, setBusyIds] = useState<string[]>([]);

  const load = useCallback(async () => {
    try {
      setReviews(await reviewService.listAllReviews());
      setError(null);
    } catch {
      setError('Reviews could not be loaded. Please try again shortly.');
    }
  }, []);

  useEffect(() => {
    let active = true;

    setLoading(true);
    void load().finally(() => {
      if (active) setLoading(false);
    });

    const unsubscribe = reviewService.subscribeReviews(() => {
      void load();
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [load]);

  const markBusy = useCallback((id: string, busy: boolean) => {
    setBusyIds((current) =>
      busy ? [...current, id] : current.filter((item) => item !== id),
    );
  }, []);

  const run = useCallback(
    async (id: string, action: () => Promise<unknown>): Promise<boolean> => {
      markBusy(id, true);
      try {
        await action();
        return true;
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : 'The action failed. Please try again.');
        return false;
      } finally {
        markBusy(id, false);
      }
    },
    [markBusy],
  );

  const setStatus = useCallback(
    (id: string, status: ReviewStatus) => run(id, () => reviewService.setReviewStatus(id, status)),
    [run],
  );

  const update = useCallback(
    (id: string, patch: { rating?: number; comment?: string }) =>
      run(id, () => reviewService.updateReview(id, patch)),
    [run],
  );

  const remove = useCallback((id: string) => run(id, () => reviewService.deleteReview(id)), [run]);

  const refresh = useCallback(async () => {
    await load();
  }, [load]);

  return { reviews, loading, error, busyIds, setStatus, update, remove, refresh };
}
