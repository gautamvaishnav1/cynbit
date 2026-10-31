import { useState, type FormEvent } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';

import type { ClientReviewInput } from '../../types';
import {
  MAX_CLIENT_REVIEW_LENGTH,
  MIN_CLIENT_REVIEW_LENGTH,
} from '../../services/clientReviewService';
import StarRating from '../review/StarRating';
import Button from '../ui/Button';
import { cn } from '../../utils/cn';

type FieldKey = 'clientName' | 'clientTitle' | 'rating' | 'comment' | 'source';
type FieldErrors = Partial<Record<FieldKey, string>>;

/**
 * Admin entry form for a real client review of the company.
 * Pure client-side validation, live character counter and interactive stars.
 * Used for both "Add" and "Edit" in the admin client-reviews panel.
 */
export function ClientReviewForm({
  initial,
  submitting,
  onSubmit,
  onCancel,
}: {
  initial?: ClientReviewInput | null;
  submitting: boolean;
  onSubmit: (values: ClientReviewInput) => Promise<boolean>;
  onCancel: () => void;
}) {
  const [clientName, setClientName] = useState(initial?.clientName ?? '');
  const [clientTitle, setClientTitle] = useState(initial?.clientTitle ?? '');
  const [source, setSource] = useState(initial?.source ?? '');
  const [rating, setRating] = useState(initial?.rating ?? 0);
  const [comment, setComment] = useState(initial?.comment ?? '');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Partial<Record<FieldKey, boolean>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validate = (): FieldErrors => {
    const next: FieldErrors = {};

    if (!clientName.trim()) next.clientName = 'Please enter the client name.';
    else if (clientName.trim().length > 80) next.clientName = 'Max 80 characters.';

    if (!clientTitle.trim()) next.clientTitle = 'Please enter the role or company.';
    else if (clientTitle.trim().length > 120) next.clientTitle = 'Max 120 characters.';

    if (source.trim().length > 60) next.source = 'Max 60 characters.';

    if (rating < 1 || rating > 5) next.rating = 'Please select a star rating between 1 and 5.';

    const trimmed = comment.trim();
    if (trimmed.length < MIN_CLIENT_REVIEW_LENGTH) {
      next.comment = `The review must be at least ${MIN_CLIENT_REVIEW_LENGTH} characters.`;
    } else if (trimmed.length > MAX_CLIENT_REVIEW_LENGTH) {
      next.comment = `The review must be ${MAX_CLIENT_REVIEW_LENGTH} characters or fewer.`;
    }

    return next;
  };

  const showError = (key: FieldKey) => (touched[key] ? errors[key] : undefined);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);

    const validationErrors = validate();
    setErrors(validationErrors);
    setTouched({
      clientName: true,
      clientTitle: true,
      source: true,
      rating: true,
      comment: true,
    });

    const firstInvalid = (Object.keys(validationErrors) as FieldKey[])[0];
    if (firstInvalid) {
      document.getElementById(`client-review-${firstInvalid}`)?.focus();
      return;
    }

    const ok = await onSubmit({
      clientName: clientName.trim(),
      clientTitle: clientTitle.trim(),
      rating,
      comment: comment.trim(),
      ...(source.trim() ? { source: source.trim() } : {}),
    });

    if (!ok) {
      setSubmitError('The review could not be saved. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="grid gap-5">
      {submitError && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-2xl border border-[#f3c2c6] bg-[#fff5f5] px-4 py-3.5"
        >
          <AlertTriangle size={18} className="mt-0.5 shrink-0 text-[#d1434d]" />
          <p className="text-[13.5px] leading-relaxed font-semibold text-[#a32b34]">{submitError}</p>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="client-review-clientName" className="field-label">
            Client name <span className="text-[#d1434d]">*</span>
          </label>
          <input
            id="client-review-clientName"
            type="text"
            maxLength={80}
            autoComplete="off"
            placeholder="Full name of the customer"
            value={clientName}
            onChange={(event) => {
              setClientName(event.target.value);
              if (errors.clientName) setErrors(validate());
            }}
            onBlur={() => {
              setTouched((t) => ({ ...t, clientName: true }));
              setErrors(validate());
            }}
            aria-invalid={showError('clientName') ? true : undefined}
            aria-describedby={
              showError('clientName') ? 'client-review-clientName-error' : undefined
            }
            className="field-input"
          />
          {showError('clientName') && (
            <p id="client-review-clientName-error" className="field-error" role="alert">
              {errors.clientName}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="client-review-clientTitle" className="field-label">
            Role / company <span className="text-[#d1434d]">*</span>
          </label>
          <input
            id="client-review-clientTitle"
            type="text"
            maxLength={120}
            autoComplete="off"
            placeholder="Founder, Marketing Addict"
            value={clientTitle}
            onChange={(event) => {
              setClientTitle(event.target.value);
              if (errors.clientTitle) setErrors(validate());
            }}
            onBlur={() => {
              setTouched((t) => ({ ...t, clientTitle: true }));
              setErrors(validate());
            }}
            aria-invalid={showError('clientTitle') ? true : undefined}
            aria-describedby={
              showError('clientTitle') ? 'client-review-clientTitle-error' : undefined
            }
            className="field-input"
          />
          {showError('clientTitle') && (
            <p id="client-review-clientTitle-error" className="field-error" role="alert">
              {errors.clientTitle}
            </p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="client-review-source" className="field-label">
          Source <span className="font-normal normal-case text-ink-mute">(optional)</span>
        </label>
        <input
          id="client-review-source"
          type="text"
          maxLength={60}
          autoComplete="off"
          placeholder="Google, Clutch, direct feedback…"
          value={source}
          onChange={(event) => {
            setSource(event.target.value);
            if (errors.source) setErrors(validate());
          }}
          onBlur={() => {
            setTouched((t) => ({ ...t, source: true }));
            setErrors(validate());
          }}
          aria-invalid={showError('source') ? true : undefined}
          aria-describedby={showError('source') ? 'client-review-source-error' : undefined}
          className="field-input"
        />
        {showError('source') && (
          <p id="client-review-source-error" className="field-error" role="alert">
            {errors.source}
          </p>
        )}
      </div>

      <div>
        <span className="field-label">
          Client rating <span className="text-[#d1434d]">*</span>
        </span>
        <div
          className="rounded-xl border border-line bg-canvas px-4 py-3"
          aria-invalid={showError('rating') ? true : undefined}
          aria-describedby={showError('rating') ? 'client-review-rating-error' : undefined}
        >
          <StarRating
            rating={rating}
            size={26}
            disabled={submitting}
            labelText="Client rating"
            onChange={setRating}
          />
        </div>
        {showError('rating') && (
          <p id="client-review-rating-error" className="field-error" role="alert">
            {errors.rating}
          </p>
        )}
      </div>

      <div>
        <div className="flex items-baseline justify-between gap-3">
          <label htmlFor="client-review-comment" className="field-label">
            Review text <span className="text-[#d1434d]">*</span>
          </label>
          <span
            className={cn(
              'text-[12px] font-bold tabular-nums',
              comment.length > MAX_CLIENT_REVIEW_LENGTH ? 'text-[#d1434d]' : 'text-ink-mute',
            )}
          >
            {comment.length} / {MAX_CLIENT_REVIEW_LENGTH}
          </span>
        </div>
        <textarea
          id="client-review-comment"
          rows={5}
          maxLength={MAX_CLIENT_REVIEW_LENGTH + 100}
          placeholder="The customer's real feedback about working with Cynbit Technologies…"
          value={comment}
          onChange={(event) => {
            setComment(event.target.value);
            if (errors.comment) setErrors(validate());
          }}
          onBlur={() => {
            setTouched((t) => ({ ...t, comment: true }));
            setErrors(validate());
          }}
          aria-invalid={showError('comment') ? true : undefined}
          aria-describedby={showError('comment') ? 'client-review-comment-error' : undefined}
          className="field-input resize-y"
        />
        {showError('comment') ? (
          <p id="client-review-comment-error" className="field-error" role="alert">
            {errors.comment}
          </p>
        ) : (
          <p className="field-hint">
            Minimum {MIN_CLIENT_REVIEW_LENGTH} characters. Only publish genuine customer feedback.
          </p>
        )}
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button variant="ghost" type="button" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 size={15} className="animate-spin" aria-hidden="true" />
              Saving…
            </>
          ) : (
            'Save review'
          )}
        </Button>
      </div>
    </form>
  );
}

export default ClientReviewForm;
