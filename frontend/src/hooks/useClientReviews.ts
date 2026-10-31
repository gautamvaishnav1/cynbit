import { useCallback, useEffect, useState } from 'react';

import type { ClientReview, ClientReviewInput, ReviewStatus } from '../types';
import clientReviewService from '../services/clientReviewService';

export {
  ClientReviewsProvider,
  useClientReviewsContext,
  type ClientReviewsContextValue,
} from '../context/ClientReviewsContext';

import { useClientReviewsContext as useClientContext } from '../context/ClientReviewsContext';

/** Approved client reviews of the company + derived summary (public site). */
export function useClientReviews() {
  return useClientContext();
}

/* ------------------------------------------------------------------
   Admin-side hook: every client review (all statuses) plus CRUD actions.
   Mutations go through the isolated service; the public
   ClientReviewsContext re-loads automatically via its subscription.
------------------------------------------------------------------- */

export interface AllClientReviewsAdmin {
  reviews: ClientReview[];
  loading: boolean;
  error: string | null;
  /** Ids with an in-flight action (for row-level spinners). */
  busyIds: string[];
  /** True while a create/update form submission is processing. */
  saving: boolean;
  create: (input: ClientReviewInput) => Promise<ClientReview | null>;
  update: (id: string, patch: Partial<ClientReviewInput>) => Promise<boolean>;
  setStatus: (id: string, status: ReviewStatus) => Promise<boolean>;
  remove: (id: string) => Promise<boolean>;
  refresh: () => Promise<void>;
}

export function useAllClientReviews(): AllClientReviewsAdmin {
  const [reviews, setReviews] = useState<ClientReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyIds, setBusyIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      setReviews(await clientReviewService.listAllClientReviews());
      setError(null);
    } catch {
      setError('Client reviews could not be loaded. Please try again shortly.');
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

  const markBusy = useCallback((id: string, busy: boolean) => {
    setBusyIds((current) =>
      busy ? [...current, id] : current.filter((item) => item !== id),
    );
  }, []);

  const create = useCallback(async (input: ClientReviewInput): Promise<ClientReview | null> => {
    setSaving(true);
    setError(null);
    try {
      return await clientReviewService.createClientReview(input);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'The review could not be saved.');
      return null;
    } finally {
      setSaving(false);
    }
  }, []);

  const update = useCallback(
    async (id: string, patch: Partial<ClientReviewInput>): Promise<boolean> => {
      setSaving(true);
      setError(null);
      try {
        await clientReviewService.updateClientReview(id, patch);
        return true;
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : 'The review could not be saved.');
        return false;
      } finally {
        setSaving(false);
      }
    },
    [],
  );

  const setStatus = useCallback(
    async (id: string, status: ReviewStatus): Promise<boolean> => {
      markBusy(id, true);
      try {
        await clientReviewService.setClientReviewStatus(id, status);
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

  const remove = useCallback(
    async (id: string): Promise<boolean> => {
      markBusy(id, true);
      try {
        await clientReviewService.deleteClientReview(id);
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

  const refresh = useCallback(async () => {
    await load();
  }, [load]);

  return { reviews, loading, error, busyIds, saving, create, update, setStatus, remove, refresh };
}
