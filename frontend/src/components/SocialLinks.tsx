import type { ReactElement } from 'react';

import { cn } from '../utils/cn';

const ICONS: Record<string, ReactElement> = {
  linkedin: (
    <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.2h4V21H3V9.2Zm6.2 0h3.83v1.62h.05c.53-1 1.83-2.06 3.77-2.06 4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.4c0-1.29-.02-2.95-1.8-2.95-1.8 0-2.07 1.4-2.07 2.85V21h-4V9.2Z" />
  ),
  instagram: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="5.2" fill="none" stroke="currentColor" strokeWidth="1.9" />
      <circle cx="12" cy="12" r="3.9" fill="none" stroke="currentColor" strokeWidth="1.9" />
      <circle cx="17.2" cy="6.8" r="1.2" />
    </>
  ),
  facebook: (
    <path d="M13.6 21v-8.02h2.7l.4-3.13h-3.1V7.85c0-.9.25-1.52 1.55-1.52h1.66V3.54c-.29-.04-1.28-.13-2.44-.13-2.42 0-4.07 1.48-4.07 4.19v2.25H7.55v3.13h2.75V21h3.3Z" />
  ),
  x: (
    <path d="M17.53 3H20.5l-6.48 7.41L21.5 21h-5.9l-4.62-6.04L5.7 21H2.73l6.93-7.92L2.5 3h6.05l4.18 5.53L17.53 3Zm-1.04 16.2h1.64L7.6 4.7H5.84l10.65 14.5Z" />
  ),
};

type SocialKey = keyof typeof ICONS;

const LINKS: Array<{ key: SocialKey; href: string; label: string }> = [
  { key: 'linkedin', href: 'https://www.linkedin.com/company/cynbit-in/', label: 'Cynbit on LinkedIn' },
  { key: 'instagram', href: 'https://www.instagram.com/cynbit.in/', label: 'Cynbit on Instagram' },
  { key: 'facebook', href: 'https://www.facebook.com/people/Cynbit-Technologies/61557066036732/', label: 'Cynbit on Facebook' },
  { key: 'x', href: 'https://x.com/Cynbit_in', label: 'Cynbit on X' },
];

/** Inline brand glyphs (no icon-pack dependency for social marks). */
export function SocialLinks({ className }: { className?: string }) {
  return (
    <ul className={cn('flex flex-wrap items-center gap-2.5', className)}>
      {LINKS.map((link) => (
        <li key={link.key}>
          <a
            href={link.href}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={link.label}
            title={link.label}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface text-ink-soft transition-colors hover:border-brand-600 hover:bg-brand-600 hover:text-white"
          >
            <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden="true">
              {ICONS[link.key as SocialKey]}
            </svg>
          </a>
        </li>
      ))}
    </ul>
  );
}

export default SocialLinks;
