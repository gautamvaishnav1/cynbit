import { useId, useState, type FormEvent } from 'react';
import { AlertTriangle, Check, Loader2 } from 'lucide-react';

import type { ProductId, ReviewInput } from '../../types';
import { products } from '../../data/products';
import { MAX_REVIEW_LENGTH, MIN_REVIEW_LENGTH } from '../../services/reviewService';
import { useSettings } from '../../hooks/useSettings';
import StarRating from './StarRating';
import Button from '../ui/Button';
import { cn } from '../../utils/cn';

type FieldKey = 'customerName' | 'email' | 'rating' | 'comment';
type FieldErrors = Partial<Record<FieldKey, string>>;

interface ReviewFormProps {
  defaultProductId: ProductId;
  submitting: boolean;
  onSubmit: (input: ReviewInput) => Promise<void>;
  onCancel: () => void;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Pure, reusable validation — mirrors services/reviewService.validateReviewInput. */
export function validateReviewForm(values: {
  customerName: string;
  email: string;
  rating: number;
  comment: string;
}): FieldErrors {
  const errors: FieldErrors = {};

  if (!values.customerName.trim()) {
    errors.customerName = 'Please enter your name.';
  } else if (values.customerName.trim().length > 80) {
    errors.customerName = 'Name must be 80 characters or fewer.';
  }

  if (!values.email.trim()) {
    errors.email = 'Please enter your email address.';
  } else if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = 'Enter a valid email address, e.g. name@company.com.';
  }

  if (values.rating < 1 || values.rating > 5) {
    errors.rating = 'Please select a star rating.';
  }

  const comment = values.comment.trim();
  if (!comment) {
    errors.comment = 'Please write your review.';
  } else if (comment.length < MIN_REVIEW_LENGTH) {
    errors.comment = `Your review must be at least ${MIN_REVIEW_LENGTH} characters.`;
  } else if (comment.length > MAX_REVIEW_LENGTH) {
    errors.comment = `Your review must be ${MAX_REVIEW_LENGTH} characters or fewer.`;
  }

  return errors;
}

/**
 * Customer review submission form.
 * Handles client-side validation, a character counter, interactive star
 * selection and explicit success / error states. Submission is asynchronous
 * so pending UI is genuine — but no data ever leaves the browser.
 */
export function ReviewForm({ defaultProductId, submitting, onSubmit, onCancel }: ReviewFormProps) {
  const uid = useId();
  const { settings } = useSettings();

  const [productId, setProductId] = useState<ProductId>(defaultProductId);
  const [customerName, setCustomerName] = useState('');
  const [email, setEmail] = useState('');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Partial<Record<FieldKey, boolean>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [succeeded, setSucceeded] = useState(false);

  const fieldId = (key: FieldKey) => `${uid}-${key}`;
  const errorId = (key: FieldKey) => `${uid}-${key}-error`;

  const showError = (key: FieldKey) => (touched[key] ? errors[key] : undefined);

  const setFieldValue = <K extends FieldKey>(key: K, value: string | number) => {
    const next = { ...errors };
    if (key === 'customerName') setCustomerName(String(value));
    if (key === 'email') setEmail(String(value));
    if (key === 'rating') setRating(Number(value));
    if (key === 'comment') setComment(String(value));

    // Re-validate live once a field has already produced an error.
    if (next[key]) {
      const values = {
        customerName: key === 'customerName' ? String(value) : customerName,
        email: key === 'email' ? String(value) : email,
        rating: key === 'rating' ? Number(value) : rating,
        comment: key === 'comment' ? String(value) : comment,
      };
      const fresh = validateReviewForm(values);
      const nextErrors: FieldErrors = { ...next };
      nextErrors[key] = fresh[key];
      setErrors(nextErrors);
    }
  };

  const markTouched = (key: FieldKey) => {
    setTouched((current) => {
      const next: Partial<Record<FieldKey, boolean>> = { ...current };
      next[key] = true;
      return next;
    });
    setErrors(validateReviewForm({ customerName, email, rating, comment }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);

    const validationErrors = validateReviewForm({ customerName, email, rating, comment });
    setErrors(validationErrors);
    setTouched({ customerName: true, email: true, rating: true, comment: true });

    const firstInvalid = (Object.keys(validationErrors) as FieldKey[])[0];
    if (firstInvalid) {
      document.getElementById(fieldId(firstInvalid))?.focus();
      return;
    }

    try {
      await onSubmit({
        productId,
        customerName: customerName.trim(),
        email: email.trim(),
        rating,
        comment: comment.trim(),
      });
      setSucceeded(true);
    } catch (error) {
      setSubmitError(
        error instanceof Error && error.message
          ? error.message
          : 'Something went wrong while submitting. Please try again.',
      );
    }
  };

  /* ----------------------------- success ----------------------------- */
  if (succeeded) {
    return (
      <div className="rounded-3xl border border-brand-200 bg-brand-50 p-7 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-white">
          <Check size={26} strokeWidth={2.6} />
        </span>
        <h3 className="mt-5 font-display text-[21px] font-extrabold text-ink">
          Thanks for sharing your experience
        </h3>
        <p className="mx-auto mt-2.5 max-w-md text-[14.5px] leading-relaxed text-ink-soft">
          {settings.autoApproveSubmissions
            ? 'Your review is now published on this page so you can see the rating summary, distribution and sorting update. This is a front-end prototype — nothing was sent to a server or database.'
            : 'Your review has been recorded and is awaiting approval. An administrator must approve it from the Review Admin panel before it appears publicly. This is a front-end prototype — nothing was sent to a server or database.'}
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button onClick={onCancel}>Done</Button>
        </div>
      </div>
    );
  }

  /* ------------------------------ form ------------------------------- */
  return (
    <form onSubmit={handleSubmit} noValidate className="grid gap-5">
      {submitError && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-2xl border border-[#f3c2c6] bg-[#fff5f5] px-4 py-3.5"
        >
          <AlertTriangle size={18} className="mt-0.5 shrink-0 text-[#d1434d]" />
          <p className="text-[13.5px] leading-relaxed font-semibold text-[#a32b34]">
            {submitError}
          </p>
        </div>
      )}

      {/* Product (preselected, still changeable) */}
      <div>
        <label htmlFor={`${uid}-product`} className="field-label">
          Product <span className="text-[#d1434d]">*</span>
        </label>
        <div className="relative">
          <select
            id={`${uid}-product`}
            value={productId}
            onChange={(event) => setProductId(event.target.value as ProductId)}
            className="field-input appearance-none pr-10"
          >
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>
          <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-ink-mute"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
          >
            <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {/* Name */}
        <div>
          <label htmlFor={fieldId('customerName')} className="field-label">
            Customer name <span className="text-[#d1434d]">*</span>
          </label>
          <input
            id={fieldId('customerName')}
            name="customerName"
            type="text"
            autoComplete="name"
            maxLength={80}
            placeholder="Your full name"
            value={customerName}
            onChange={(event) => setFieldValue('customerName', event.target.value)}
            onBlur={() => markTouched('customerName')}
            aria-invalid={showError('customerName') ? true : undefined}
            aria-describedby={showError('customerName') ? errorId('customerName') : undefined}
            className={cn('field-input')}
          />
          {showError('customerName') && (
            <p id={errorId('customerName')} className="field-error" role="alert">
              {errors.customerName}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor={fieldId('email')} className="field-label">
            Email address <span className="text-[#d1434d]">*</span>
          </label>
          <input
            id={fieldId('email')}
            name="email"
            type="email"
            autoComplete="email"
            placeholder="name@company.com"
            value={email}
            onChange={(event) => setFieldValue('email', event.target.value)}
            onBlur={() => markTouched('email')}
            aria-invalid={showError('email') ? true : undefined}
            aria-describedby={showError('email') ? errorId('email') : undefined}
            className="field-input"
          />
          {showError('email') && (
            <p id={errorId('email')} className="field-error" role="alert">
              {errors.email}
            </p>
          )}
          <p className="field-hint">Never displayed publicly.</p>
        </div>
      </div>

      {/* Rating */}
      <div>
        <span className="field-label">
          Your rating <span className="text-[#d1434d]">*</span>
        </span>
        <div
          className="rounded-xl border border-line bg-canvas px-4 py-3"
          aria-invalid={showError('rating') ? true : undefined}
          aria-describedby={showError('rating') ? errorId('rating') : undefined}
        >
          <StarRating
            rating={rating}
            size={26}
            disabled={submitting}
            labelText="Your rating"
            onChange={(value) => setFieldValue('rating', value)}
          />
        </div>
        {showError('rating') && (
          <p id={errorId('rating')} className="field-error" role="alert">
            {errors.rating}
          </p>
        )}
      </div>

      {/* Comment */}
      <div>
        <div className="flex items-baseline justify-between gap-3">
          <label htmlFor={fieldId('comment')} className="field-label">
            Written review <span className="text-[#d1434d]">*</span>
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
          id={fieldId('comment')}
          name="comment"
          rows={5}
          maxLength={MAX_REVIEW_LENGTH + 100}
          placeholder="What worked well? What could be better? Your review helps other teams evaluate this product."
          value={comment}
          onChange={(event) => setFieldValue('comment', event.target.value)}
          onBlur={() => markTouched('comment')}
          aria-invalid={showError('comment') ? true : undefined}
          aria-describedby={showError('comment') ? errorId('comment') : undefined}
          className="field-input resize-y"
        />
        {showError('comment') ? (
          <p id={errorId('comment')} className="field-error" role="alert">
            {errors.comment}
          </p>
        ) : (
          <p className="field-hint">
            Minimum {MIN_REVIEW_LENGTH} characters. Please avoid confidential information.
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
              Submitting…
            </>
          ) : (
            'Submit review'
          )}
        </Button>
      </div>
    </form>
  );
}

export default ReviewForm;
