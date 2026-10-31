import { useState, type FormEvent } from 'react';
import { ArrowRight, Mail, MapPin, Phone } from 'lucide-react';

import { Link } from 'react-router-dom';

import { cn } from '../utils/cn';
import Logo from './Logo';
import SocialLinks from './SocialLinks';

const EXPLORE_LINKS = [
  { label: 'About Us', to: '/story' },
  { label: 'Core Team', to: '/team' },
  { label: 'Our Services', to: '/services' },
  { label: 'Product Suite', to: '/products' },
];

const IMPACT_LINKS = [
  { label: 'Social Initiatives', to: '/impact' },
  { label: 'Expert Blog', to: '/blog' },
  { label: 'Privacy Policy', to: '/privacy' },
  { label: 'Contact Support', to: '/contact' },
];

const PROTOTYPE_LINKS = [
  { label: 'Review Admin (prototype)', to: '/admin' },
];

const PHONE_LINKS = [
  { label: '+91 89479 62667', href: 'tel:+918947962667' },
  { label: '+91 78912 09777', href: 'tel:+917891209777' },
  { label: '+91 83023 37367', href: 'tel:+918302337367' },
];

function LinkColumn({
  title,
  links,
}: {
  title: string;
  links: Array<{ label: string; to: string }>;
}) {
  return (
    <div>
      <h3 className="font-display text-[11px] font-extrabold tracking-[0.16em] text-ink uppercase">
        {title}
      </h3>
      <ul className="mt-4 grid gap-2.5">
        {links.map((link) => (
          <li key={link.to + link.label}>
            <Link
              to={link.to}
              className="text-[14.5px] font-medium text-ink-soft transition-colors hover:text-brand-700"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Newsletter sign-up — front-end demonstration only, no data leaves the page. */
function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'error' | 'success'>('idle');

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
    setStatus(valid ? 'success' : 'error');
    if (valid) setEmail('');
  };

  return (
    <div>
      <h3 className="font-display text-[11px] font-extrabold tracking-[0.16em] text-ink uppercase">
        Stay Connected
      </h3>
      <p className="mt-4 font-display text-[16.5px] leading-snug font-extrabold text-ink">
        Subscribe to our Briefing
      </p>
      <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-mute">
        Join 25k+ architects receiving our weekly technical and strategic deep-dives.
      </p>

      <form onSubmit={onSubmit} className="mt-4" noValidate>
        <label htmlFor="footer-newsletter-email" className="sr-only">
          Business email
        </label>
        <div className="flex items-center gap-2 rounded-full border border-line bg-surface p-1.5 pl-4 focus-within:border-brand-400">
          <Mail size={16} className="shrink-0 text-ink-mute" aria-hidden="true" />
          <input
            id="footer-newsletter-email"
            type="email"
            name="email"
            autoComplete="email"
            placeholder="architect@company.com"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              if (status !== 'idle') setStatus('idle');
            }}
            aria-invalid={status === 'error'}
            className="min-w-0 flex-1 bg-transparent py-2 text-[14.5px] text-ink outline-none placeholder:text-ink-mute"
          />
          <button
            type="submit"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white transition-colors hover:bg-brand-700"
            aria-label="Subscribe to the briefing"
          >
            <ArrowRight size={16} strokeWidth={2.4} />
          </button>
        </div>

        <p aria-live="polite" className="mt-2.5 text-[12.5px] font-semibold">
          {status === 'error' && <span className="text-[#d1434d]">Please enter a valid email address.</span>}
          {status === 'success' && (
            <span className="text-brand-700">
              Thanks! This is a front-end demo — no subscription was actually created.
            </span>
          )}
          {status === 'idle' && <span className="text-ink-mute">Secure &amp; private.</span>}
        </p>
      </form>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="border-t border-line bg-canvas">
      <div className="mx-auto max-w-[1240px] px-5 pt-16 pb-10 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.25fr_0.8fr_0.8fr_1.35fr]">
          {/* Brand column */}
          <div>
            <Link to="/" aria-label="Cynbit Technologies — home">
              <Logo />
            </Link>
            <SocialLinks className="mt-6" />

            <div className="mt-6 grid gap-3.5">
              <a
                href="mailto:opportunities@cynbit.in"
                className="flex items-center gap-3 text-[14.5px] font-medium text-ink-soft transition-colors hover:text-brand-700"
              >
                <Mail size={16} className="shrink-0 text-brand-600" aria-hidden="true" />
                opportunities@cynbit.in
              </a>

              <div className="flex items-start gap-3">
                <Phone size={16} className="mt-1 shrink-0 text-brand-600" aria-hidden="true" />
                <div className="grid gap-1">
                  {PHONE_LINKS.map((phone) => (
                    <a
                      key={phone.href}
                      href={phone.href}
                      className="text-[14.5px] font-medium text-ink-soft transition-colors hover:text-brand-700"
                    >
                      {phone.label}
                    </a>
                  ))}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin size={16} className="mt-1 shrink-0 text-brand-600" aria-hidden="true" />
                <address className="not-italic text-[14.5px] leading-relaxed font-medium text-ink-soft">
                  Headquarters
                  <br />
                  32/115 Pratap Nagar, Jaipur
                  <br />
                  Rajasthan, 302033
                </address>
              </div>
            </div>
          </div>

          <LinkColumn title="Explore" links={EXPLORE_LINKS} />
          <LinkColumn title="Impact" links={IMPACT_LINKS} />
          <NewsletterForm />
        </div>

        <div
          className={cn(
            'mt-14 flex flex-col gap-4 border-t border-line pt-7',
            'sm:flex-row sm:items-center sm:justify-between',
          )}
        >
          <p className="text-[13.5px] text-ink-mute">
            © 2026 Cynbit Technologies. Engineered for Optimism.
          </p>
          <nav aria-label="Prototype" className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {PROTOTYPE_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-[13.5px] font-semibold text-ink-soft transition-colors hover:text-brand-700"
              >
                {link.label}
              </Link>
            ))}
            {['Terms', 'Cookies', 'Navigation'].map((item) => (
              <a
                key={item}
                href="#"
                className="text-[13.5px] font-semibold text-ink-soft transition-colors hover:text-brand-700"
              >
                {item}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
