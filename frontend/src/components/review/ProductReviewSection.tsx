import { useMemo, useState } from 'react';
import { AlertTriangle, Inbox, MessageSquare, PenLine, RotateCw } from 'lucide-react';

import type { Product, ReviewInput, ReviewSortOption } from '../../types';
import { useProductReviews } from '../../hooks/useReviews';
import { useSettings } from '../../hooks/useSettings';
import { sortReviews } from '../../utils/rating';
import Button from '../ui/Button';
import { ReviewListSkeleton, Skeleton } from '../ui/Skeleton';
import RatingSummary from './RatingSummary';
import RatingDistribution from './RatingDistribution';
import ReviewCard from './ReviewCard';
import ReviewFilters from './ReviewFilters';
import ReviewForm from './ReviewForm';
import ReviewModal from './ReviewModal';

interface ProductReviewSectionProps {
  product: Product;
}

/**
 * Product-specific reviews block (e.g. "TenantEase Reviews").
 *
 * Composes the rating summary, distribution, sorting toolbar, review list,
 * empty/loading/error states and the submission dialog. All data flows in
 * through the reviews hook — no data is hard-coded in this component.
 */
export default function ProductReviewSection({ product }: ProductReviewSectionProps) {
  const { reviews, summary, loading, error, submitting, submitReview, refresh } =
    useProductReviews(product.id);
  const { settings } = useSettings();

  const [sort, setSort] = useState<ReviewSortOption>('all');
  const [modalOpen, setModalOpen] = useState(false);

  const sortedReviews = useMemo(() => sortReviews(reviews, sort), [reviews, sort]);

  const handleSubmit = async (input: ReviewInput) => {
    await submitReview(input);
  };

  const sectionId = `${product.id}-reviews`;

  return (
    <section
      id={sectionId}
      aria-labelledby={`${sectionId}-title`}
      className="scroll-mt-28 border-t border-line bg-surface"
    >
      <div className="mx-auto max-w-[1240px] px-5 py-20 sm:px-8 lg:py-24">
        {/* Section head */}
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-xl">
            <p className="eyebrow">
              <span className="eyebrow-dot" aria-hidden="true" />
              Customer reviews
            </p>
            <h2
              id={`${sectionId}-title`}
              className="mt-5 font-display text-[clamp(1.8rem,3.6vw,2.6rem)] leading-[1.08] font-extrabold tracking-[-0.035em] text-ink"
            >
              {product.name} Reviews
            </h2>
            <p className="mt-3 text-[15.5px] leading-relaxed text-ink-soft">
              Ratings and written feedback from customers using {product.name}. Only approved
              reviews are shown.
            </p>
          </div>

          <Button
            variant="outline"
            onClick={() => setModalOpen(true)}
            icon={<PenLine size={15} strokeWidth={2.2} />}
          >
            Write a review
          </Button>
        </div>

        {/* Body */}
        <div className="mt-10 grid gap-8 lg:grid-cols-[350px_minmax(0,1fr)]">
          {/* Summary + distribution */}
          <div className="card h-fit p-6 lg:sticky lg:top-28">
            {loading ? (
              <div aria-hidden="true" className="animate-pulse">
                <div className="flex items-center gap-5">
                  <Skeleton className="h-[76px] w-[76px] rounded-2xl" />
                  <div className="flex-1 space-y-3">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <div className="mt-7 space-y-3">
                  {Array.from({ length: 5 }, (_, index) => (
                    <Skeleton key={index} className="h-3 w-full" />
                  ))}
                </div>
              </div>
            ) : (
              <>
                <RatingSummary summary={summary} productName={product.name} />
                <div className="my-6 h-px bg-line" />
                <RatingDistribution summary={summary} />
              </>
            )}
          </div>

          {/* List */}
          <div className="min-w-0">
            <div className="flex flex-col gap-5">
              <ReviewFilters
                value={sort}
                onChange={setSort}
                resultCount={sortedReviews.length}
                disabled={loading}
              />
            </div>

            <div className="mt-6">
              {loading && <ReviewListSkeleton />}

              {!loading && error && (
                <div role="alert" className="card border-[#f3c2c6] bg-[#fffafa] p-8 text-center">
                  <AlertTriangle size={26} className="mx-auto text-[#d1434d]" />
                  <p className="mt-4 font-display text-[17px] font-extrabold text-ink">
                    Reviews are unavailable right now
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

              {!loading && !error && sortedReviews.length === 0 && (
                <div className="card p-10 text-center">
                  <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                    {reviews.length === 0 ? (
                      <Inbox size={26} strokeWidth={1.8} />
                    ) : (
                      <MessageSquare size={26} strokeWidth={1.8} />
                    )}
                  </span>
                  <p className="mx-auto mt-5 max-w-md font-display text-[17.5px] leading-snug font-extrabold text-ink">
                    No reviews yet. Be the first to share your experience.
                  </p>
                  <p className="mx-auto mt-2.5 max-w-md text-[14.5px] leading-relaxed text-ink-mute">
                    {settings.autoApproveSubmissions
                      ? 'Reviews you submit are published instantly in this prototype so you can explore the rating summary, distribution and sorting. Nothing is stored on a server.'
                      : 'Reviews you submit are held for moderation in this prototype — an administrator approves them from the Review Admin panel before they appear here. Nothing is stored on a server.'}
                  </p>
                  <div className="mt-6 flex flex-wrap justify-center gap-3">
                    <Button onClick={() => setModalOpen(true)}>Write the first review</Button>
                  </div>
                </div>
              )}

              {!loading && !error && sortedReviews.length > 0 && (
                <ul className="grid gap-5">
                  {sortedReviews.map((review) => (
                    <li key={review.id}>
                      <ReviewCard review={review} />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>

      <ReviewModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`Review ${product.name}`}
        subtitle="Your rating and written feedback help other teams evaluate this product."
      >
        <ReviewForm
          defaultProductId={product.id}
          submitting={submitting}
          onSubmit={handleSubmit}
          onCancel={() => setModalOpen(false)}
        />
      </ReviewModal>
    </section>
  );
}
