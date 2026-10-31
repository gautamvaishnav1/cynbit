import { AlertTriangle, Inbox, RotateCw, Star } from 'lucide-react';

import type { ClientReview } from '../../types';
import { useClientReviews } from '../../hooks/useClientReviews';
import { useSettings } from '../../hooks/useSettings';
import { formatAverage, formatReviewDate } from '../../utils/rating';
import Button from '../ui/Button';
import StarRating from '../review/StarRating';
import { Skeleton } from '../ui/Skeleton';

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

/** Single approved client review of the company. */
function ClientReviewCard({ review }: { review: ClientReview }) {
  return (
    <figure className="card flex h-full flex-col p-6 transition-colors hover:border-brand-300">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3.5">
          <span
            aria-hidden="true"
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-display text-[14px] font-extrabold ${tintFor(review.clientName)}`}
          >
            {initialsFor(review.clientName)}
          </span>
          <figcaption className="min-w-0">
            <p className="truncate font-display text-[15.5px] leading-tight font-extrabold text-ink">
              {review.clientName}
            </p>
            <p className="mt-1 truncate text-[12.5px] text-ink-mute">{review.clientTitle}</p>
          </figcaption>
        </div>

        <StarRating
          rating={review.rating}
          size={15}
          labelText={`Rating by ${review.clientName}`}
          className="shrink-0"
        />
      </div>

      <blockquote className="mt-4 flex-1 text-[14.5px] leading-relaxed whitespace-pre-wrap text-ink-soft">
        “{review.comment}”
      </blockquote>

      <p className="mt-4 border-t border-line pt-4 text-[12px] text-ink-mute">
        <time dateTime={review.createdAt}>{formatReviewDate(review.createdAt)}</time>
        {review.source ? ` · via ${review.source}` : ''}
      </p>
    </figure>
  );
}

/**
 * Public "client reviews of Cynbit" section (Home page).
 *
 * Shows the company's overall average rating plus every approved customer
 * review entered through the prototype admin panel. Renders nothing when
 * the section is switched off in admin settings, and never displays
 * fabricated ratings — empty datasets get an honest empty state.
 */
export function ClientReviewsSection() {
  const { settings } = useSettings();
  const { reviews, summary, loading, error, refresh } = useClientReviews();

  if (!settings.clientReviewsEnabled) return null;

  const hasData = summary.totalReviews > 0;

  return (
    <section aria-labelledby="client-reviews-title" className="border-b border-line bg-surface">
      <div className="mx-auto max-w-[1240px] px-5 py-16 sm:px-8 lg:py-24">
        {/* Section head + overall rating */}
        <div className="flex flex-wrap items-end justify-between gap-8">
          <div className="max-w-xl">
            <p className="eyebrow">
              <span className="eyebrow-dot" aria-hidden="true" />
              Client reviews
            </p>
            <h2
              id="client-reviews-title"
              className="mt-5 font-display text-[clamp(1.9rem,4.2vw,2.9rem)] leading-[1.06] font-extrabold tracking-[-0.04em] text-ink"
            >
              Rated by the teams
              <br />
              we build for.
            </h2>
            <p className="mt-3.5 text-[15.5px] leading-relaxed text-ink-soft">
              Real ratings and written feedback from customers of Cynbit Technologies, curated by
              our team and published only once approved.
            </p>
          </div>

          {/* Overall roll-up — derived from approved reviews only */}
          <div className="card flex items-center gap-5 px-6 py-5">
            <div className="flex h-[72px] w-[72px] shrink-0 flex-col items-center justify-center rounded-2xl border border-line bg-canvas">
              <span className="font-display text-[26px] leading-none font-extrabold text-ink tabular-nums">
                {formatAverage(summary.averageRating, summary.totalReviews)}
              </span>
              <span className="mt-1 text-[9.5px] font-extrabold tracking-[0.12em] text-ink-mute uppercase">
                {hasData ? 'out of 5' : 'no data'}
              </span>
            </div>
            <div>
              <StarRating
                rating={summary.averageRating}
                size={18}
                labelText="Cynbit Technologies average rating"
              />
              <p className="mt-2 text-[14px] font-semibold text-ink-soft">
                {hasData ? (
                  <>
                    Based on{' '}
                    <span className="font-extrabold text-ink">{summary.totalReviews}</span>{' '}
                    {summary.totalReviews === 1 ? 'client review' : 'client reviews'}
                  </>
                ) : (
                  <span className="text-ink-mute">No client reviews yet</span>
                )}
              </p>
              <p className="mt-0.5 flex items-center gap-1.5 text-[12px] text-ink-mute">
                <Star size={12} className="text-sand-500" fill="currentColor" aria-hidden="true" />
                Approved reviews only
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="mt-11">
          {loading && (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
              {Array.from({ length: 3 }, (_, index) => (
                <div key={index} className="card animate-pulse p-6">
                  <div className="flex items-center gap-3.5">
                    <Skeleton variant="circle" className="h-11 w-11" />
                    <div className="flex-1 space-y-3">
                      <Skeleton className="h-3.5 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <div className="mt-5 space-y-2.5">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-[90%]" />
                    <Skeleton className="h-3 w-[60%]" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && error && (
            <div role="alert" className="card border-[#f3c2c6] bg-[#fffafa] p-8 text-center">
              <AlertTriangle size={26} className="mx-auto text-[#d1434d]" />
              <p className="mt-4 font-display text-[17px] font-extrabold text-ink">
                Client reviews are unavailable right now
              </p>
              <p className="mx-auto mt-2 max-w-md text-[14.5px] leading-relaxed text-ink-soft">
                {error}
              </p>
              <div className="mt-5 flex justify-center">
                <Button
                  variant="outline"
                  onClick={() => void refresh()}
                  icon={<RotateCw size={15} strokeWidth={2.2} />}
                >
                  Try again
                </Button>
              </div>
            </div>
          )}

          {!loading && !error && reviews.length === 0 && (
            <div className="card p-10 text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                <Inbox size={26} strokeWidth={1.8} />
              </span>
              <p className="mx-auto mt-5 max-w-md font-display text-[17.5px] leading-snug font-extrabold text-ink">
                No client reviews yet
              </p>
              <p className="mx-auto mt-2.5 max-w-md text-[14.5px] leading-relaxed text-ink-mute">
                Verified customer reviews of Cynbit Technologies will appear here as soon as they
                are approved. No ratings or testimonials are ever invented — this prototype starts
                empty by design.
              </p>
            </div>
          )}

          {!loading && !error && reviews.length > 0 && (
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {reviews.map((review) => (
                <li key={review.id}>
                  <ClientReviewCard review={review} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

export default ClientReviewsSection;
