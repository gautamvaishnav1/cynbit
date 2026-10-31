import { cn } from '../utils/cn';

interface LogoProps {
  className?: string;
  /** Wordmark text colour override (defaults to brand). */
  tone?: 'brand' | 'ink' | 'inverse';
  /** Hide the wordmark and render the mark alone (compact contexts). */
  markOnly?: boolean;
}

const TONE_CLASSES: Record<NonNullable<LogoProps['tone']>, string> = {
  brand: 'text-brand-600',
  ink: 'text-ink',
  inverse: 'text-white',
};

/**
 * Cynbit identity lockup: lemniscate mark + wordmark.
 * Drawn inline so it inherits colour from its container.
 */
export function Logo({ className, tone = 'brand', markOnly = false }: LogoProps) {
  return (
    <span
      className={cn('inline-flex items-center gap-2.5 select-none', TONE_CLASSES[tone], className)}
    >
      <svg
        viewBox="0 0 36 24"
        className="h-[26px] w-[38px] shrink-0"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M18 12C18 7.6 21.4 4 25.5 4C29.6 4 33 7.6 33 12C33 16.4 29.6 20 25.5 20C21.4 20 18 16.4 18 12C18 16.4 14.6 20 10.5 20C6.4 20 3 16.4 3 12C3 7.6 6.4 4 10.5 4C14.6 4 18 7.6 18 12Z" />
      </svg>
      {!markOnly && (
        <span className="font-display text-[21px] leading-none font-extrabold tracking-[-0.02em]">
          CYNBIT
        </span>
      )}
      <span className="sr-only">Cynbit Technologies — home</span>
    </span>
  );
}

export default Logo;
