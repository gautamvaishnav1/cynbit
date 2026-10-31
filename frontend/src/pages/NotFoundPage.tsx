import { Link } from 'react-router-dom';
import { ArrowLeft, Compass, Search } from 'lucide-react';

import CtaBanner from '../components/CtaBanner';

const SUGGESTED = [
  { label: 'Home', to: '/' },
  { label: 'Products', to: '/products' },
  { label: 'Case Studies', to: '/case-studies' },
  { label: 'Contact', to: '/contact' },
];

/** Route fallback — lists the pages this prototype actually implements. */
export default function NotFoundPage() {
  return (
    <>
      <section className="border-b border-line bg-canvas">
        <div className="mx-auto flex max-w-[1240px] flex-col items-start px-5 py-20 sm:px-8 lg:py-28">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
            <Compass size={26} strokeWidth={1.8} aria-hidden="true" />
          </span>

          <p className="eyebrow mt-7">
            <span className="eyebrow-dot" aria-hidden="true" />
            404 — page not in this prototype
          </p>

          <h1 className="mt-6 max-w-3xl font-display text-[clamp(2rem,5vw,3.2rem)] leading-[1.05] font-extrabold tracking-[-0.04em] text-ink">
            This route isn't part of the recreated frontend.
          </h1>

          <p className="mt-5 max-w-xl text-[16.5px] leading-relaxed text-ink-soft">
            This independent prototype recreates four pages of the public Cynbit website: Home,
            Products, Case Studies and Contact. Other navigation entries point back to the live
            site and are not reproduced here.
          </p>

          <nav aria-label="Available pages" className="mt-9 flex flex-wrap gap-3">
            {SUGGESTED.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="btn btn-outline"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <a
            href="https://www.cynbit.in/"
            target="_blank"
            rel="noreferrer noopener"
            className="mt-7 inline-flex items-center gap-2 text-[13.5px] font-extrabold tracking-[0.06em] text-brand-700 uppercase hover:text-brand-800"
          >
            <Search size={15} strokeWidth={2.4} aria-hidden="true" />
            Visit the live site
            <ArrowLeft size={15} strokeWidth={2.4} className="rotate-180" aria-hidden="true" />
          </a>
        </div>
      </section>

      <CtaBanner
        title={
          <>
            Ready to construct?
            <br />
            Let's talk.
          </>
        }
        primary={{ label: 'Contact us', to: '/contact' }}
        secondary={{ label: 'View products', to: '/products' }}
      />
    </>
  );
}
