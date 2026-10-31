import type { AdminStatusFilter, ReviewStatus } from '../../types';
import { cn } from '../../utils/cn';

const STATUS_STYLES: Record<ReviewStatus, { label: string; className: string }> = {
  pending: {
    label: 'Pending',
    className: 'bg-sand-100 text-sand-700 border-sand-300',
  },
  approved: {
    label: 'Approved',
    className: 'bg-brand-50 text-brand-700 border-brand-200',
  },
  rejected: {
    label: 'Rejected',
    className: 'bg-[#fff5f5] text-[#a32b34] border-[#f3c2c6]',
  },
};

/** Colour pill for a review's moderation status. */
export function StatusBadge({ status }: { status: ReviewStatus }) {
  const style = STATUS_STYLES[status];
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-extrabold tracking-[0.08em] uppercase',
        style.className,
      )}
    >
      {style.label}
    </span>
  );
}

export default StatusBadge;

const FILTER_LABELS: Record<AdminStatusFilter, string> = {
  all: 'All',
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
};

/** Radio-group of status filters for the admin moderation lists. */
export function StatusFilter({
  value,
  onChange,
  counts,
  disabled = false,
}: {
  value: AdminStatusFilter;
  onChange: (filter: AdminStatusFilter) => void;
  /** Optional per-status counts rendered inside each chip. */
  counts?: Partial<Record<AdminStatusFilter, number>>;
  disabled?: boolean;
}) {
  const options: AdminStatusFilter[] = ['all', 'pending', 'approved', 'rejected'];

  return (
    <div
      role="radiogroup"
      aria-label="Filter by status"
      className="inline-flex flex-wrap items-center gap-1 rounded-full border border-line bg-canvas p-1"
    >
      {options.map((option) => {
        const isActive = option === value;
        const count = counts?.[option];
        return (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={isActive}
            disabled={disabled}
            onClick={() => onChange(option)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[12.5px] font-extrabold transition-colors',
              'disabled:cursor-not-allowed disabled:opacity-60',
              isActive
                ? 'bg-brand-600 text-white shadow-[0_6px_18px_-10px_rgba(0,96,103,0.9)]'
                : 'text-ink-soft hover:bg-surface hover:text-ink',
            )}
          >
            {FILTER_LABELS[option]}
            {count !== undefined && (
              <span
                className={cn(
                  'rounded-full px-1.5 text-[11px] font-extrabold tabular-nums',
                  isActive ? 'bg-white/20 text-white' : 'bg-line text-ink-mute',
                )}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
