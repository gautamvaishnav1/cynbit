import type { ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';

import Button, { type ButtonVariant } from './ui/Button';
import { cn } from '../utils/cn';

export interface CtaAction {
  label: string;
  to?: string;
  href?: string;
  variant?: ButtonVariant;
}

interface CtaBannerProps {
  title: ReactNode;
  description?: string;
  primary: CtaAction;
  secondary?: CtaAction;
  className?: string;
}

/**
 * Closing call-to-action panel used at the end of every page.
 * Dark brand gradient with dot texture, consistent with the site's identity.
 */
export default function CtaBanner({
  title,
  description,
  primary,
  secondary,
  className,
}: CtaBannerProps) {
  return (
    <section className={cn('bg-canvas', className)}>
      <div className="mx-auto max-w-[1240px] px-5 pb-20 sm:px-8 lg:pb-24">
        <div className="relative overflow-hidden rounded-[2.25rem] bg-gradient-to-br from-brand-800 via-brand-700 to-brand-600 px-7 py-14 dot-grid sm:px-12 sm:py-16">
          <span
            className="absolute -top-24 -right-16 h-72 w-72 rounded-full bg-brand-500/35 blur-2xl"
            aria-hidden="true"
          />
          <span
            className="absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-sand-500/15 blur-2xl"
            aria-hidden="true"
          />

          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <h2 className="font-display text-[clamp(1.8rem,4.2vw,3rem)] leading-[1.05] font-extrabold tracking-[-0.04em] text-white">
                {title}
              </h2>
              {description && (
                <p className="mt-4 max-w-xl text-[16px] leading-relaxed text-brand-100">
                  {description}
                </p>
              )}
            </div>

            <div className="flex shrink-0 flex-wrap gap-3">
              <Button
                to={primary.to}
                href={primary.href}
                className={cn(
                  primary.variant === 'outline' && 'border-white/45 !text-white hover:!bg-white/10 hover:!border-white',
                  primary.variant === undefined && 'bg-white !text-brand-800 hover:!bg-brand-50',
                )}
                icon={<ArrowRight size={15} strokeWidth={2.4} />}
              >
                {primary.label}
              </Button>

              {secondary && (
                <Button
                  to={secondary.to}
                  href={secondary.href}
                  className="border border-white/35 !text-white hover:!border-white hover:!bg-white/10"
                >
                  {secondary.label}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
