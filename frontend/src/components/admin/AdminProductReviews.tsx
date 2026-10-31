import { useMemo, useState } from 'react';
import { AlertTriangle, Check, Loader2, Pencil, RotateCw, Trash2, X } from 'lucide-react';

import type { AdminStatusFilter, ProductId, Review } from '../../types';
import { products } from '../../data/products';
import { useAllReviews } from '../../hooks/useReviews';
import { useSettings } from '../../hooks/useSettings';
import { formatReviewDate } from '../../utils/rating';
import { MAX_REVIEW_LENGTH, MIN_REVIEW_LENGTH } from '../../services/reviewService';
import Button from '../ui/Button';
import { ReviewListSkeleton } from '../ui/Skeleton';
import StarRating from '../review/StarRating';
import AdminModal from './AdminModal';
import StatusBadge, { StatusFilter } from './StatusBadge';
import { cn } from '../../utils/cn';

function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function productNameOf(productId: ProductId): string {
  return products.find((product) => product.id === productId)?.name ?? productId;
}

/**
 * Admin: product review moderation.
 * Lists every submitted review (all statuses), with approve / reject /
 * edit / delete actions. Public pages update instantly because they
 * subscribe to the same review service.
 */
export function AdminProductReviews() {
  const { reviews, loading, error, busyIds, setStatus, update, remove, refresh } = useAllReviews();
  const { settings } = useSettings();

  const [statusFilter, setStatusFilter] = useState<AdminStatusFilter>('all');
  const [productFilter, setProductFilter] = useState<'all' | ProductId>('all');
  const [editing, setEditing] = useState<Review | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const productScoped = useMemo(
    () =>
      productFilter === 'all'
        ? reviews
        : reviews.filter((review) => review.productId === productFilter),
    [reviews, productFilter],
  );

  const counts = useMemo(
    () => ({
      all: productScoped.length,
      pending: productScoped.filter((review) => review.status === 'pending').length,
      approved: productScoped.filter((review) => review.status === 'approved').length,
      rejected: productScoped.filter((review) => review.status === 'rejected').length,
    }),
    [productScoped],
  );

  const visible = useMemo(
    () =>
      statusFilter === 'all'
        ? productScoped
        : productScoped.filter((review) => review.status === statusFilter),
    [productScoped, statusFilter],
  );

  return (
    <div className="grid gap-6">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <StatusFilter
            value={statusFilter}
            onChange={setStatusFilter}
            counts={counts}
            disabled={loading}
          />
          <div>
            <label htmlFor="admin-product-filter" className="sr-only">
              Filter by product
            </label>
            <select
              id="admin-product-filter"
              value={productFilter}
              onChange={(event) => setProductFilter(event.target.value as 'all' | ProductId)}
              disabled={loading}
              className="field-input !w-auto appearance-none py-2.5 pr-9 text-[13.5px] font-bold disabled:opacity-60"
            >
              <option value="all">All products</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!settings.autoApproveSubmissions && counts.pending > 0 && (
            <span className="inline-flex items-center gap-2 rounded-full bg-sand-100 px-4 py-2 text-[12.5px] font-extrabold text-sand-700">
              <span className="h-2 w-2 animate-pulse rounded-full bg-sand-500" aria-hidden="true" />
              {counts.pending} awaiting approval
            </span>
          )}
          <button
            type="button"
            onClick={() => void refresh()}
            aria-label="Reload reviews"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface text-ink-soft transition-colors hover:border-brand-400 hover:text-brand-700"
          >
            <RotateCw size={16} strokeWidth={2.2} />
          </button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div role="alert" className="flex items-start gap-3 rounded-2xl border border-[#f3c2c6] bg-[#fffafa] px-4 py-3.5">
          <AlertTriangle size={18} className="mt-0.5 shrink-0 text-[#d1434d]" />
          <p className="text-[13.5px] leading-relaxed font-semibold text-[#a32b34]">{error}</p>
        </div>
      )}

      {/* List */}
      {loading ? (
        <ReviewListSkeleton count={3} />
      ) : visible.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="font-display text-[17px] font-extrabold text-ink">
            {reviews.length === 0
              ? 'No product reviews yet'
              : 'No reviews match this filter'}
          </p>
          <p className="mx-auto mt-2 max-w-md text-[14px] leading-relaxed text-ink-mute">
            {reviews.length === 0
              ? 'Submitted reviews from the Products page will appear here awaiting your approval.'
              : 'Try a different status or product filter.'}
          </p>
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
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-100 font-display text-[14px] font-extrabold text-brand-700"
                    >
                      {initialsFor(review.customerName)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-display text-[15.5px] leading-tight font-extrabold text-ink">
                        {review.customerName}
                      </p>
                      <p className="mt-1 truncate text-[12.5px] text-ink-mute">
                        {review.email} · <time dateTime={review.createdAt}>{formatReviewDate(review.createdAt)}</time>
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="rounded-full border border-line bg-canvas px-3 py-1 text-[11.5px] font-extrabold text-ink-soft">
                      {productNameOf(review.productId)}
                    </span>
                    <StatusBadge status={review.status} />
                  </div>
                </div>

                <div className="mt-4">
                  <StarRating
                    rating={review.rating}
                    size={15}
                    labelText={`Rating by ${review.customerName}`}
                  />
                  <p className="mt-2.5 text-[14.5px] leading-relaxed whitespace-pre-wrap text-ink-soft">
                    {review.comment}
                  </p>
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
                  {confirmingDelete ? (
                    <span className="text-[13px] font-bold text-[#a32b34]">
                      Delete this review permanently?
                    </span>
                  ) : (
                    <span className="text-[12.5px] text-ink-mute">
                      {review.status === 'pending'
                        ? 'Hidden from the public site until approved.'
                        : review.status === 'approved'
                          ? 'Visible on the public Products page.'
                          : 'Hidden — rejected by moderation.'}
                    </span>
                  )}

                  <div className="flex flex-wrap items-center gap-2">
                    {busy && (
                      <Loader2 size={15} className="animate-spin text-ink-mute" aria-hidden="true" />
                    )}
                    {confirmingDelete ? (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setConfirmDeleteId(null)}
                          disabled={busy}
                        >
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
                            icon={<Check size={13} strokeWidth={2.6} />}
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
                            icon={<X size={13} strokeWidth={2.6} />}
                          >
                            Reject
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={busy}
                          onClick={() => setEditing(review)}
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

      <EditReviewModal
        review={editing}
        onClose={() => setEditing(null)}
        onSave={async (id, patch) => {
          const ok = await update(id, patch);
          if (ok) setEditing(null);
          return ok;
        }}
      />
    </div>
  );
}

/* --------------------------- edit review modal --------------------------- */

function EditReviewModal({
  review,
  onClose,
  onSave,
}: {
  review: Review | null;
  onClose: () => void;
  onSave: (id: string, patch: { rating: number; comment: string }) => Promise<boolean>;
}) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [errors, setErrors] = useState<{ rating?: string; comment?: string }>({});
  const [saving, setSaving] = useState(false);
  const [loadedFor, setLoadedFor] = useState<string | null>(null);

  // Sync form state whenever a different review opens the modal.
  if (review && loadedFor !== review.id) {
    setLoadedFor(review.id);
    setRating(review.rating);
    setComment(review.comment);
    setErrors({});
  }
  if (!review && loadedFor !== null) setLoadedFor(null);

  const handleSave = async () => {
    if (!review) return;

    const next: { rating?: string; comment?: string } = {};
    if (rating < 1 || rating > 5) next.rating = 'Please select a star rating.';
    const trimmed = comment.trim();
    if (trimmed.length < MIN_REVIEW_LENGTH) {
      next.comment = `The review must be at least ${MIN_REVIEW_LENGTH} characters.`;
    } else if (trimmed.length > MAX_REVIEW_LENGTH) {
      next.comment = `The review must be ${MAX_REVIEW_LENGTH} characters or fewer.`;
    }

    setErrors(next);
    if (next.rating || next.comment) return;

    setSaving(true);
    try {
      await onSave(review.id, { rating, comment: trimmed });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminModal
      open={review !== null}
      onClose={onClose}
      eyebrow="Moderation"
      title="Edit review"
      subtitle={
        review
          ? `${review.customerName} · ${productNameOf(review.productId)} · submitted ${formatReviewDate(review.createdAt)}`
          : undefined
      }
    >
      <div className="grid gap-5">
        <div>
          <span className="field-label">Rating</span>
          <div className="rounded-xl border border-line bg-canvas px-4 py-3">
            <StarRating
              rating={rating}
              size={26}
              disabled={saving}
              labelText="Review rating"
              onChange={setRating}
            />
          </div>
          {errors.rating && (
            <p className="field-error" role="alert">
              {errors.rating}
            </p>
          )}
        </div>

        <div>
          <div className="flex items-baseline justify-between gap-3">
            <label htmlFor="admin-edit-comment" className="field-label">
              Written review
            </label>
            <span
              className={cn(
                'text-[12px] font-bold tabular-nums',
                comment.length > MAX_REVIEW_LENGTH ? 'text-[#d1434d]' : 'text-ink-mute',
              )}
            >
              {comment.length} / {MAX_REVIEW_LENGTH}
            </span>
          </div>
          <textarea
            id="admin-edit-comment"
            rows={5}
            maxLength={MAX_REVIEW_LENGTH + 100}
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            aria-invalid={errors.comment ? true : undefined}
            className="field-input resize-y"
          />
          {errors.comment && (
            <p className="field-error" role="alert">
              {errors.comment}
            </p>
          )}
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={() => void handleSave()} disabled={saving}>
            {saving ? (
              <>
                <Loader2 size={15} className="animate-spin" aria-hidden="true" />
                Saving…
              </>
            ) : (
              'Save changes'
            )}
          </Button>
        </div>
      </div>
    </AdminModal>
  );
}

export default AdminProductReviews;
