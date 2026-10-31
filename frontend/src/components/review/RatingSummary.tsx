import type { RatingSummary as RatingSummaryType } from '../../types';
import { formatAverage } from '../../utils/rating';
import StarRating from './StarRating';

interface RatingSummaryProps {
  summary: RatingSummaryType;
  /** Product display name, used for accessible labels. */
  productName: string;
  /** Optional action rendered beside the score (e.g. "Write a review"). */
  action?: React.ReactNode;
}

/**
 * Headline rating block: big average, star row, approved review count.
 * Shows a `New` badge and a "no reviews" line while the dataset is empty.
 */
export function RatingSummary({ summary, productName, action }: RatingSummaryProps) {
  const hasData = summary.totalReviews > 0;

  return (
    <div className="flex flex-wrap items-center justify-between gap-6">
      <div className="flex items-center gap-5">
        <div className="flex h-[76px] w-[76px] shrink-0 flex-col items-center justify-center rounded-2xl border border-line bg-canvas">
          <span className="font-display text-[27px] leading-none font-extrabold text-ink tabular-nums">
            {formatAverage(summary.averageRating, summary.totalReviews)}
          </span>
          <span className="mt-1 text-[9.5px] font-extrabold tracking-[0.12em] text-ink-mute uppercase">
            {hasData ? 'out of 5' : 'no data'}
          </span>
        </div>

        <div>
          <StarRating
            rating={summary.averageRating}
            size={19}
            labelText={`${productName} average rating`}
          />
          <p className="mt-2 text-[14px] font-semibold text-ink-soft">
            {hasData ? (
              <>
                Based on{' '}
                <span className="font-extrabold text-ink">
                  {summary.totalReviews}
                </span>{' '}
                {summary.totalReviews === 1 ? 'review' : 'reviews'}
              </>
            ) : (
              <span className="text-ink-mute">No reviews yet</span>
            )}
          </p>
          <p className="mt-0.5 text-[12.5px] text-ink-mute">
            {hasData ? 'Approved customer reviews only' : 'Be the first to share your experience'}
          </p>
        </div>
      </div>

      {action}
    </div>
  );
}

export default RatingSummary;
