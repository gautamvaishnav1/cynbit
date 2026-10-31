import type { Review } from '../../types';
import { formatReviewDate } from '../../utils/rating';
import StarRating from './StarRating';

/** Deterministic tint so repeat renderers keep a stable avatar colour. */
const TINTS = [
  'bg-brand-100 text-brand-700',
  'bg-sand-200 text-sand-700',
  'bg-brand-50 text-brand-800',
  'bg-line text-ink-soft',
];

function tintFor(name: string): string {
  let hash = 0;
  for (let index = 0; index < name.length; index += 1) {
    hash = (hash * 31 + name.charCodeAt(index)) % 10_000;
  }
  return TINTS[hash % TINTS.length];
}

function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

interface ReviewCardProps {
  review: Review;
}

/** Single approved customer review. */
export function ReviewCard({ review }: ReviewCardProps) {
  return (
    <article className="card p-6 transition-colors hover:border-line-strong">
      <header className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <span
            aria-hidden="true"
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-display text-[14px] font-extrabold ${tintFor(review.customerName)}`}
          >
            {initialsFor(review.customerName)}
          </span>
          <div className="min-w-0">
            <p className="truncate font-display text-[15.5px] leading-tight font-extrabold text-ink">
              {review.customerName}
            </p>
            <p className="mt-1 text-[12.5px] text-ink-mute">
              <time dateTime={review.createdAt}>{formatReviewDate(review.createdAt)}</time>
            </p>
          </div>
        </div>

        <StarRating rating={review.rating} size={15} labelText={`Rating by ${review.customerName}`} />
      </header>

      <p className="mt-4 text-[15px] leading-relaxed whitespace-pre-wrap text-ink-soft">
        {review.comment}
      </p>
    </article>
  );
}

export default ReviewCard;
