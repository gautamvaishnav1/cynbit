import type { ReactNode } from 'react';

import { cn } from '../../utils/cn';
import Icon from './Icon';

interface SectionHeadingProps {
  /** Warm pill label above the heading. */
  eyebrow?: string;
  /** Leading icon key rendered inside the eyebrow pill. */
  eyebrowIcon?: string;
  title: ReactNode;
  /** Optional supporting paragraph. */
  description?: ReactNode;
  align?: 'left' | 'center';
  className?: string;
  /** Heading level for correct document outline. */
  as?: 'h1' | 'h2' | 'h3';
  id?: string;
}

/** Shared section intro: eyebrow pill + display heading + optional copy. */
export function SectionHeading({
  eyebrow,
  eyebrowIcon,
  title,
  description,
  align = 'left',
  className,
  as: Heading = 'h2',
  id,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-5',
        align === 'center' && 'items-center text-center',
        className,
      )}
    >
      {eyebrow && (
        <p className="eyebrow">
          {eyebrowIcon ? (
            <Icon name={eyebrowIcon} size={15} className="text-brand-700" />
          ) : (
            <span className="eyebrow-dot" aria-hidden="true" />
          )}
          {eyebrow}
        </p>
      )}
      <Heading
        id={id}
        className={cn(
          'font-display font-extrabold tracking-[-0.035em] text-ink',
          align === 'center' ? 'text-[clamp(2rem,4.6vw,3.25rem)]' : 'text-[clamp(1.9rem,4vw,3rem)]',
          'leading-[1.06]',
        )}
      >
        {title}
      </Heading>
      {description && (
        <p
          className={cn(
            'max-w-2xl text-[16.5px] leading-relaxed text-ink-soft',
            align === 'center' && 'mx-auto',
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}

export default SectionHeading;
