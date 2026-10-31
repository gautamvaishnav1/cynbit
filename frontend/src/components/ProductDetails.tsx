import { ArrowUpRight, Quote } from 'lucide-react';

import type { Product } from '../types';
import { cn } from '../utils/cn';
import Icon from './ui/Icon';
import Button from './ui/Button';

const ACCENT_TILE: Record<Product['accent'], string> = {
  brand: 'bg-gradient-to-br from-brand-600 via-brand-500 to-brand-300 text-white',
  sand: 'bg-gradient-to-br from-sand-500 via-sand-400 to-sand-200 text-[#3d2609]',
  ink: 'bg-gradient-to-br from-brand-900 via-brand-700 to-brand-500 text-white',
};

const ACCENT_CHIP: Record<Product['accent'], string> = {
  brand: 'bg-brand-50 text-brand-700 border-brand-100',
  sand: 'bg-sand-100 text-sand-700 border-sand-200',
  ink: 'bg-brand-50 text-brand-800 border-brand-100',
};

interface ProductDetailsProps {
  product: Product;
}

/**
 * Full product block: hero, feature groups, differentiator pillars, pull
 * quote and stats. Content is driven entirely by the data layer, so the three
 * products share one implementation while keeping their own accent colour.
 */
export default function ProductDetails({ product }: ProductDetailsProps) {
  return (
    <section id={product.id} className="scroll-mt-24 border-t border-line">
      <div className="mx-auto max-w-[1240px] px-5 py-20 sm:px-8 lg:py-24">
        {/* Hero */}
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <p className="eyebrow eyebrow-plain !pl-0">{product.eyebrow}</p>

            <h2 className="mt-4 font-display text-[clamp(2.1rem,5vw,3.4rem)] leading-[1.03] font-extrabold tracking-[-0.04em] text-ink">
              {product.name}
            </h2>

            <p className="mt-4 max-w-2xl font-display text-[clamp(1.1rem,2.2vw,1.4rem)] leading-snug font-extrabold text-brand-700">
              {product.tagline}
            </p>

            <p className="mt-5 max-w-2xl text-[16.5px] leading-relaxed text-ink-soft">
              {product.description}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button href="#inquiry" icon={<ArrowUpRight size={15} strokeWidth={2.4} />}>
                {product.ctaLabel}
              </Button>
              <Button variant="outline" href={`#${product.id}-reviews`}>
                Read reviews
              </Button>
            </div>
          </div>

          {/* Monogram tile */}
          <div
            className={cn(
              'relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-[2rem] dot-grid lg:aspect-square',
              ACCENT_TILE[product.accent],
            )}
          >
            <span className="absolute inset-4 rounded-[1.5rem] border border-white/25" aria-hidden="true" />
            <span className="text-center">
              <span className="block font-display text-[clamp(3rem,7vw,4.5rem)] leading-none font-extrabold tracking-[-0.05em]">
                {product.monogram}
              </span>
              <span className="mt-3 block text-[10.5px] font-extrabold tracking-[0.3em] uppercase opacity-85">
                {product.flag}
              </span>
            </span>
            <span
              className="absolute -right-8 -bottom-8 h-32 w-32 rounded-full bg-white/15"
              aria-hidden="true"
            />
          </div>
        </div>

        {/* Feature groups */}
        <div className="mt-16 grid gap-10 lg:grid-cols-2">
          {product.featureGroups.map((group) => (
            <div key={group.heading} className="card p-7 sm:p-8">
              <p className="text-[11px] font-extrabold tracking-[0.16em] text-ink-soft uppercase">
                {group.eyebrow}
              </p>
              <h3 className="mt-3 font-display text-[clamp(1.25rem,2.4vw,1.6rem)] leading-tight font-extrabold tracking-[-0.025em] text-ink">
                {group.heading}
              </h3>
              {group.body && (
                <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">{group.body}</p>
              )}

              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {group.features.map((feature) => (
                  <li
                    key={feature.title}
                    className="flex items-start gap-3 rounded-2xl border border-line bg-canvas p-4"
                  >
                    <span
                      className={cn(
                        'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border',
                        ACCENT_CHIP[product.accent],
                      )}
                      aria-hidden="true"
                    >
                      <Icon name={feature.icon} size={17} />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[14.5px] leading-tight font-extrabold text-ink">
                        {feature.title}
                      </span>
                      <span className="mt-1 block text-[13px] leading-snug text-ink-mute">
                        {feature.subtitle}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Differentiator pillars */}
        <div className="mt-14">
          <h3 className="font-display text-[11px] font-extrabold tracking-[0.18em] text-ink-soft uppercase">
            Why it stands out
          </h3>
          <ul className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {product.pillars.map((pillar) => (
              <li
                key={pillar.code + pillar.title}
                className="card p-6 transition-colors hover:border-brand-300"
              >
                <span className="font-display text-[11.5px] font-extrabold tracking-[0.16em] text-brand-600 uppercase">
                  {pillar.code}
                </span>
                <p className="mt-3 font-display text-[17px] leading-tight font-extrabold text-ink">
                  {pillar.title}
                </p>
                <p className="mt-2.5 text-[14.5px] leading-relaxed text-ink-soft">{pillar.body}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* Stats */}
        <div className="mt-12 flex flex-wrap gap-3">
          {product.stats.map((stat) => (
            <span
              key={stat.label}
              className="inline-flex items-center gap-2.5 rounded-full border border-line bg-canvas px-5 py-3"
            >
              <span className="font-display text-[15px] font-extrabold text-ink">{stat.value}</span>
              <span className="text-[12.5px] font-semibold text-ink-mute">{stat.label}</span>
            </span>
          ))}
        </div>

        {/* Pull quote */}
        {product.quote && (
          <figure className="mt-14 rounded-[2rem] border border-line bg-gradient-to-br from-canvas to-brand-50 p-8 sm:p-11">
            <Quote size={30} className="text-brand-500" fill="currentColor" aria-hidden="true" />
            <blockquote className="mt-5 max-w-3xl font-display text-[clamp(1.15rem,2.6vw,1.65rem)] leading-snug font-extrabold tracking-[-0.02em] text-ink">
              {product.quote}
            </blockquote>
            <figcaption className="mt-5 flex items-center gap-2 text-[13px] font-bold tracking-[0.08em] text-ink-soft uppercase">
              {product.name}
              <span className="h-1 w-1 rounded-full bg-ink-mute" aria-hidden="true" />
              {product.eyebrow}
            </figcaption>
          </figure>
        )}
      </div>
    </section>
  );
}
