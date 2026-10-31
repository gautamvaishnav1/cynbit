import type { RatingSummary } from '../../types';
import { STAR_LEVELS, starShare } from '../../utils/rating';

interface RatingDistributionProps {
  summary: RatingSummary;
  className?: string;
}

/**
 * 5 → 1 star histogram.
 * With no approved reviews every bucket shows `0` and an explicit empty note —
 * counts and bar widths are always derived from real data, never invented.
 */
export function RatingDistribution({ summary, className }: RatingDistributionProps) {
  const hasData = summary.totalReviews > 0;

  return (
    <div className={className}>
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="font-display text-[11px] font-extrabold tracking-[0.16em] text-ink-soft uppercase">
          Rating breakdown
        </h3>
        {!hasData && (
          <span className="text-[12.5px] font-semibold text-ink-mute">No ratings yet</span>
        )}
      </div>

      <ol className="mt-4 grid gap-2.5">
        {STAR_LEVELS.map((level) => {
          const count = summary.distribution[level];
          const share = hasData ? starShare(summary, level) : 0;

          return (
            <li key={level} className="flex items-center gap-3">
              <span className="flex w-[52px] shrink-0 items-center gap-1 text-[12.5px] font-bold text-ink-soft tabular-nums">
                {level}
                <svg
                  viewBox="0 0 24 24"
                  width="11"
                  height="11"
                  className="text-sand-500"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M12 2.6l2.7 5.9 6.3.7-4.7 4.3 1.3 6.3L12 16.7l-5.6 3.1 1.3-6.3-4.7-4.3 6.3-.7z" />
                </svg>
                <span className="sr-only">stars</span>
              </span>

              <span
                className="h-2 flex-1 overflow-hidden rounded-full bg-line"
                role="presentation"
              >
                <span
                  className="block h-full rounded-full bg-brand-600 transition-[width] duration-500"
                  style={{ width: `${Math.round(share * 100)}%` }}
                />
              </span>

              <span className="w-7 shrink-0 text-right text-[13px] font-bold text-ink tabular-nums">
                {count}
              </span>
            </li>
          );
        })}
      </ol>

      {!hasData && (
        <p className="mt-4 text-[12.5px] leading-relaxed text-ink-mute">
          Distribution appears once approved reviews exist for this product.
        </p>
      )}
    </div>
  );
}

export default RatingDistribution;
