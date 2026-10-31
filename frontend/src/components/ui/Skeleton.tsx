import { cn } from '../../utils/cn';

interface SkeletonProps {
  className?: string;
  /** Renders a circle instead of a bar (avatar placeholder). */
  variant?: 'block' | 'circle';
}

/** Neutral loading placeholder. Decorative only — hidden from assistive tech. */
export function Skeleton({ className, variant = 'block' }: SkeletonProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'block animate-pulse bg-line',
        variant === 'circle' ? 'rounded-full' : 'rounded-xl',
        className,
      )}
    />
  );
}

/** Shimmering skeleton that approximates a single review card. */
export function ReviewCardSkeleton() {
  return (
    <div className="card animate-pulse p-6" aria-hidden="true">
      <div className="flex items-start gap-4">
        <Skeleton variant="circle" className="h-11 w-11" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-3.5 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <div className="mt-5 space-y-2.5">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-[92%]" />
        <Skeleton className="h-3 w-[64%]" />
      </div>
    </div>
  );
}

/** Grid of review skeletons used while the list is loading. */
export function ReviewListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-5">
      {Array.from({ length: count }, (_, index) => (
        <ReviewCardSkeleton key={index} />
      ))}
    </div>
  );
}

export default Skeleton;
