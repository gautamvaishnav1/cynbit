import type { ReviewSortOption } from '../../types';
import { REVIEW_SORT_OPTIONS, REVIEW_SORT_LABELS } from '../../utils/rating';
import { cn } from '../../utils/cn';

interface ReviewFiltersProps {
  value: ReviewSortOption;
  onChange: (option: ReviewSortOption) => void;
  /** Number of reviews currently listed (drives the live announcement). */
  resultCount: number;
  disabled?: boolean;
}

/**
 * Sort control for the review list: All reviews / Highest rated /
 * Lowest rated / Most recent. Implemented as an accessible radio group.
 */
export function ReviewFilters({ value, onChange, resultCount, disabled = false }: ReviewFiltersProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div
        role="radiogroup"
        aria-label="Sort reviews"
        className="inline-flex flex-wrap items-center gap-1 rounded-full border border-line bg-canvas p-1"
      >
        {REVIEW_SORT_OPTIONS.map((option) => {
          const isActive = option === value;
          return (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={isActive}
              disabled={disabled}
              onClick={() => onChange(option)}
              className={cn(
                'rounded-full px-4 py-2 text-[12.5px] font-extrabold tracking-[0.02em] transition-colors',
                'disabled:cursor-not-allowed disabled:opacity-60',
                isActive
                  ? 'bg-brand-600 text-white shadow-[0_6px_18px_-10px_rgba(0,96,103,0.9)]'
                  : 'text-ink-soft hover:bg-surface hover:text-ink',
              )}
            >
              {REVIEW_SORT_LABELS[option]}
            </button>
          );
        })}
      </div>

      <p className="text-[13px] font-semibold text-ink-mute" aria-live="polite">
        {disabled ? 'Loading…' : `Showing ${resultCount} ${resultCount === 1 ? 'review' : 'reviews'}`}
      </p>
    </div>
  );
}

export default ReviewFilters;
