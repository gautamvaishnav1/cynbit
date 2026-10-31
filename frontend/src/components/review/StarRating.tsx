import { useState } from 'react';
import { Star } from 'lucide-react';

import { cn } from '../../utils/cn';

interface StarRatingProps {
  /** Current rating, 0–5. Fractional values render partial fills when read-only. */
  rating: number;
  /** Star edge size in px. */
  size?: number;
  /** Accessible group label, e.g. "TenantEase rating". */
  labelText?: string;
  /** Provide to enable interactive selection (1–5). */
  onChange?: (rating: number) => void;
  /** Disable selection (e.g. while submitting). */
  disabled?: boolean;
  className?: string;
}

const STAR_LEVELS = [1, 2, 3, 4, 5] as const;

/** One star rendered with an exact fill fraction (0–1). */
function FractionStar({ size, fill }: { size: number; fill: number }) {
  const clamped = Math.min(1, Math.max(0, fill));
  return (
    <span
      className="relative inline-block shrink-0 align-middle"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <Star
        size={size}
        strokeWidth={1.6}
        className="absolute inset-0 text-line-strong"
        fill="none"
      />
      <span
        className="absolute inset-y-0 left-0 overflow-hidden"
        style={{ width: `${clamped * 100}%` }}
      >
        <Star
          size={size}
          strokeWidth={1.6}
          className="block text-sand-500"
          fill="currentColor"
        />
      </span>
    </span>
  );
}

/**
 * Star rating control.
 * Read-only mode renders fractional fills and announces the value to screen
 * readers. Interactive mode renders five keyboard-focusable buttons.
 */
export function StarRating({
  rating,
  size = 18,
  labelText = 'Rating',
  onChange,
  disabled = false,
  className,
}: StarRatingProps) {
  const [hovered, setHovered] = useState(0);

  if (!onChange) {
    const rounded = Math.round(rating);
    return (
      <span
        role="img"
        aria-label={`${labelText}: ${rating.toFixed(1)} out of 5 stars`}
        className={cn('inline-flex items-center gap-[3px]', className)}
      >
        {STAR_LEVELS.map((level) => (
          <FractionStar key={level} size={size} fill={rating - (level - 1)} />
        ))}
        <span className="sr-only">{rounded}</span>
      </span>
    );
  }

  const preview = hovered > 0 ? hovered : rating;

  return (
    <span
      role="radiogroup"
      aria-label={labelText}
      className={cn('inline-flex items-center gap-1', className)}
      onMouseLeave={() => setHovered(0)}
    >
      {STAR_LEVELS.map((level) => {
        const isActive = level <= preview;
        return (
          <button
            key={level}
            type="button"
            role="radio"
            aria-checked={rating === level}
            aria-label={`${level} star${level > 1 ? 's' : ''}`}
            disabled={disabled}
            onMouseEnter={() => setHovered(level)}
            onFocus={() => setHovered(level)}
            onBlur={() => setHovered(0)}
            onClick={() => onChange(level)}
            className={cn(
              'rounded-md p-0.5 transition-transform disabled:cursor-not-allowed disabled:opacity-60',
              'hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600',
            )}
          >
            <Star
              size={size}
              strokeWidth={1.6}
              className={cn('transition-colors', isActive ? 'text-sand-500' : 'text-line-strong')}
              fill={isActive ? 'currentColor' : 'none'}
            />
          </button>
        );
      })}
      <span className="ml-1.5 text-[13px] font-bold text-ink-soft" aria-live="polite">
        {rating > 0 ? `${rating}/5` : 'Select'}
      </span>
    </span>
  );
}

export default StarRating;
