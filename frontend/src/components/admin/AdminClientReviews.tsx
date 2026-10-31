import { useMemo, useState } from 'react';
import { AlertTriangle, Loader2, Pencil, Plus, RotateCw, Trash2 } from 'lucide-react';

import type { AdminStatusFilter, ClientReview, ReviewStatus } from '../../types';
import { useAllClientReviews } from '../../hooks/useClientReviews';
import { formatReviewDate } from '../../utils/rating';
import Button from '../ui/Button';
import StarRating from '../review/StarRating';
import AdminModal from './AdminModal';
import StatusBadge, { StatusFilter } from './StatusBadge';
import ClientReviewForm from './ClientReviewForm';

function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const STATUS_HINT: Record<ReviewStatus, string> = {
  pending: 'Hidden on the Home page until approved.',
  approved: 'Shown in the client reviews section on the Home page.',
  rejected: 'Hidden — rejected by moderation.',
};

/**
 * Admin: client (company) review management.
 * Real customer ratings & reviews of Cynbit are entered here, then shown
 * on the public Home page once approved.
 */
export function AdminClientReviews() {
  const { reviews, loading, error, busyIds, saving, create, update, setStatus, remove, refresh } =
    useAllClientReviews();

  const [statusFilter, setStatusFilter] = useState<AdminStatusFilter>('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ClientReview | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const counts = useMemo(
    () => ({
      all: reviews.length,
      pending: reviews.filter((review) => review.status === 'pending').length,
      approved: reviews.filter((review) => review.status === 'approved').length,
      rejected: reviews.filter((review) => review.status === 'rejected').length,
    }),
    [reviews],
  );

  const visible = useMemo(
    () =>
      statusFilter === 'all'
        ? reviews
        : reviews.filter((review) => review.status === statusFilter),
    [reviews, statusFilter],
  );

  const closeForm = () => {
    setFormOpen(false);
    setEditing(null);
  };

  return (
    <div className="grid gap-6">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <StatusFilter value={statusFilter} onChange={setStatusFilter} counts={counts} disabled={loading} />
          <Button
            size="sm"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
            icon={<Plus size={14} strokeWidth={2.6} />}
          >
            Add client review
          </Button>
        </div>

        <button
          type="button"
          onClick={() => void refresh()}
          aria-label="Reload client reviews"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface text-ink-soft transition-colors hover:border-brand-400 hover:text-brand-700"
        >
          <RotateCw size={16} strokeWidth={2.2} />
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-2xl border border-[#f3c2c6] bg-[#fffafa] px-4 py-3.5"
        >
          <AlertTriangle size={18} className="mt-0.5 shrink-0 text-[#d1434d]" />
          <p className="text-[13.5px] leading-relaxed font-semibold text-[#a32b34]">{error}</p>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="card animate-pulse p-8" aria-hidden="true">
          <div className="h-3 w-40 rounded bg-line" />
          <div className="mt-4 h-3 w-3/4 rounded bg-line" />
          <div className="mt-3 h-3 w-2/3 rounded bg-line" />
        </div>
      ) : visible.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="font-display text-[17px] font-extrabold text-ink">
            {reviews.length === 0 ? 'No client reviews yet' : 'No reviews match this filter'}
          </p>
          <p className="mx-auto mt-2 max-w-md text-[14px] leading-relaxed text-ink-mute">
            {reviews.length === 0
              ? 'Add genuine customer feedback about Cynbit Technologies. Approved reviews appear in the client reviews section on the Home page.'
              : 'Try a different status filter.'}
          </p>
          {reviews.length === 0 && (
            <div className="mt-5 flex justify-center">
              <Button
                onClick={() => {
                  setEditing(null);
                  setFormOpen(true);
                }}
                icon={<Plus size={14} strokeWidth={2.6} />}
              >
                Add the first client review
              </Button>
            </div>
          )}
        </div>
      ) : (
        <ul className="grid gap-4">
          {visible.map((review) => {
            const busy = busyIds.includes(review.id);
            const confirmingDelete = confirmDeleteId === review.id;

            return (
              <li key={review.id} className="card p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3.5">
                    <span
                      aria-hidden="true"
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sand-200 font-display text-[14px] font-extrabold text-sand-700"
                    >
                      {initialsFor(review.clientName)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-display text-[15.5px] leading-tight font-extrabold text-ink">
                        {review.clientName}
                      </p>
                      <p className="mt-1 truncate text-[12.5px] text-ink-mute">
                        {review.clientTitle} ·{' '}
                        <time dateTime={review.createdAt}>{formatReviewDate(review.createdAt)}</time>
                        {review.source ? ` · via ${review.source}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    <StarRating
                      rating={review.rating}
                      size={15}
                      labelText={`Rating by ${review.clientName}`}
                    />
                    <StatusBadge status={review.status} />
                  </div>
                </div>

                <p className="mt-4 text-[14.5px] leading-relaxed whitespace-pre-wrap text-ink-soft">
                  {review.comment}
                </p>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
                  {confirmingDelete ? (
                    <span className="text-[13px] font-bold text-[#a32b34]">
                      Delete this client review permanently?
                    </span>
                  ) : (
                    <span className="text-[12.5px] text-ink-mute">{STATUS_HINT[review.status]}</span>
                  )}

                  <div className="flex flex-wrap items-center gap-2">
                    {busy && (
                      <Loader2 size={15} className="animate-spin text-ink-mute" aria-hidden="true" />
                    )}
                    {confirmingDelete ? (
                      <>
                        <Button variant="ghost" size="sm" onClick={() => setConfirmDeleteId(null)} disabled={busy}>
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          disabled={busy}
                          onClick={async () => {
                            const ok = await remove(review.id);
                            if (ok) setConfirmDeleteId(null);
                          }}
                          className="!bg-[#d1434d] hover:!bg-[#a32b34]"
                        >
                          Delete
                        </Button>
                      </>
                    ) : (
                      <>
                        {review.status !== 'approved' && (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={busy}
                            onClick={() => void setStatus(review.id, 'approved')}
                          >
                            Approve
                          </Button>
                        )}
                        {review.status !== 'rejected' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={busy}
                            onClick={() => void setStatus(review.id, 'rejected')}
                          >
                            Reject
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={busy}
                          onClick={() => {
                            setEditing(review);
                            setFormOpen(true);
                          }}
                          icon={<Pencil size={13} strokeWidth={2.2} />}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={busy}
                          onClick={() => setConfirmDeleteId(review.id)}
                          className="!text-[#a32b34]"
                          icon={<Trash2 size={13} strokeWidth={2.2} />}
                        >
                          Delete
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Add / edit dialog */}
      <AdminModal
        open={formOpen}
        onClose={closeForm}
        eyebrow="Client reviews"
        title={editing ? 'Edit client review' : 'Add client review'}
        subtitle={
          editing
            ? `Editing the review by ${editing.clientName}`
            : 'Record a genuine customer rating & review of Cynbit Technologies.'
        }
      >
        <ClientReviewForm
          initial={
            editing
              ? {
                  clientName: editing.clientName,
                  clientTitle: editing.clientTitle,
                  rating: editing.rating,
                  comment: editing.comment,
                  source: editing.source,
                }
              : null
          }
          submitting={saving}
          onCancel={closeForm}
          onSubmit={async (values) => {
            if (editing) return update(editing.id, values);
            const created = await create(values);
            if (created) {
              closeForm();
              return true;
            }
            return false;
          }}
        />
      </AdminModal>
    </div>
  );
}

export default AdminClientReviews;
