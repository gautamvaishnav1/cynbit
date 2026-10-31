import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, LineChart, Timer, Zap, Gauge } from 'lucide-react';

import { caseStudies, caseStudyCategories } from '../data/site';
import type { CaseStudyCategory } from '../types';
import CtaBanner from '../components/CtaBanner';
import { cn } from '../utils/cn';

type Filter = (typeof caseStudyCategories)[number];

const FILTER_LABELS: Record<Filter, string> = {
  'All Success Stories': 'All Success Stories',
  'Software Dev': 'Software Dev',
  'Cloud Strategy': 'Cloud Strategy',
  'Digital Marketing': 'Digital Marketing',
};

const OUTCOME_STATS = [
  { icon: Gauge, value: '99.9%', label: 'Uptime' },
  { icon: LineChart, value: '2.4x', label: 'Growth' },
  { icon: Zap, value: '100%', label: 'Agile' },
  { icon: Timer, value: '0.8s', label: 'Precision' },
] as const;

function CaseStudyCard({
  slug,
  client,
  category,
  title,
  metrics,
  palette,
  initials,
}: (typeof caseStudies)[number]) {
  return (
    <Link
      to={`/case-studies/${slug}`}
      className="group card flex flex-col overflow-hidden transition-all hover:-translate-y-1 hover:border-brand-300 hover:shadow-[0_30px_60px_-40px_rgba(2,43,47,0.7)]"
    >
      {/* Deterministic brand gradient stands in for stock photography */}
      <div
        className="relative flex aspect-[16/10] items-center justify-center overflow-hidden"
        style={{ backgroundImage: `linear-gradient(135deg, ${palette[0]}, ${palette[1]})` }}
      >
        <span
          className="absolute inset-0 opacity-25 [background-image:radial-gradient(circle_at_20%_20%,white_1px,transparent_1px)] [background-size:16px_16px]"
          aria-hidden="true"
        />
        <span className="relative font-display text-[clamp(2.4rem,5vw,3.4rem)] leading-none font-extrabold tracking-[-0.05em] text-white/90">
          {initials}
        </span>

        <span className="absolute top-4 left-4 rounded-full bg-black/25 px-3 py-1.5 text-[11px] font-extrabold tracking-[0.1em] text-white uppercase backdrop-blur-sm">
          {category}
        </span>

        <span className="absolute right-4 bottom-4 flex gap-2">
          <span className="rounded-lg bg-white/92 px-2.5 py-1.5 text-[11.5px] font-extrabold text-ink">
            {metrics[0]} {metrics[1]}
          </span>
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <p className="flex flex-wrap items-center gap-2 text-[12px] font-extrabold tracking-[0.1em] text-ink-mute uppercase">
          {client}
          <span className="h-1 w-1 rounded-full bg-line-strong" aria-hidden="true" />
          <span className="text-brand-600">{category}</span>
        </p>

        <h3 className="mt-3 font-display text-[19px] leading-snug font-extrabold tracking-[-0.02em] text-ink">
          {title}
        </h3>

        <span className="mt-auto inline-flex items-center gap-2 pt-5 text-[13.5px] font-extrabold text-brand-700">
          Read Full Study
          <ArrowRight
            size={15}
            strokeWidth={2.4}
            className="transition-transform group-hover:translate-x-1"
          />
        </span>
      </div>
    </Link>
  );
}

/**
 * Case studies index — public success stories with a working category filter.
 */
export default function CaseStudiesPage() {
  const [filter, setFilter] = useState<Filter>('All Success Stories');

  const visible = useMemo(
    () =>
      filter === 'All Success Stories'
        ? caseStudies
        : caseStudies.filter((study) => study.category === (filter as CaseStudyCategory)),
    [filter],
  );

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-line bg-canvas">
        <span
          className="absolute inset-0 dot-grid opacity-60 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]"
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-[1240px] px-5 pt-16 pb-14 sm:px-8 lg:pt-20 lg:pb-16">
          <p className="eyebrow">
            <span className="eyebrow-dot" aria-hidden="true" />
            Success blueprints
          </p>

          <h1 className="mt-6 max-w-4xl font-display text-[clamp(2.3rem,6vw,4.25rem)] leading-[1.02] font-extrabold tracking-[-0.045em] text-ink">
            From Challenge to{' '}
            <span className="text-brand-600">Scalable Solutions</span>
          </h1>

          <p className="mt-6 max-w-2xl text-[17px] leading-relaxed text-ink-soft">
            Explore our library of technical precision and human-centric design. Real impact,
            delivered for global visionaries through digital engineering.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-2.5 rounded-full border border-line bg-surface px-5 py-3">
              <span className="text-[11px] font-extrabold tracking-[0.14em] text-ink-mute uppercase">
                Uptime
              </span>
              <span className="font-display text-[15px] font-extrabold text-brand-700 tabular-nums">
                99.99%
              </span>
            </span>
            <span className="inline-flex items-center gap-2.5 rounded-full border border-line bg-surface px-5 py-3">
              <span className="text-[11px] font-extrabold tracking-[0.14em] text-ink-mute uppercase">
                Growth
              </span>
              <span className="font-display text-[15px] font-extrabold text-brand-700 tabular-nums">
                +140%
              </span>
            </span>
          </div>
        </div>
      </section>

      {/* Filter + grid */}
      <section className="border-b border-line bg-surface">
        <div className="mx-auto max-w-[1240px] px-5 py-14 sm:px-8 lg:py-16">
          <div
            role="tablist"
            aria-label="Filter case studies by category"
            className="flex flex-wrap gap-2.5"
          >
            {caseStudyCategories.map((category) => {
              const active = category === filter;
              return (
                <button
                  key={category}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  aria-controls="case-study-grid"
                  onClick={() => setFilter(category)}
                  className={cn(
                    'rounded-full border px-5 py-3 text-[13.5px] font-extrabold transition-colors',
                    active
                      ? 'border-brand-600 bg-brand-600 text-white'
                      : 'border-line bg-canvas text-ink-soft hover:border-brand-300 hover:text-ink',
                  )}
                >
                  {FILTER_LABELS[category]}
                </button>
              );
            })}
          </div>

          <div
            id="case-study-grid"
            role="tabpanel"
            className="mt-9 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {visible.map((study) => (
              <CaseStudyCard key={study.slug} {...study} />
            ))}
          </div>

          {visible.length === 0 && (
            <p className="mt-10 rounded-3xl border border-line bg-canvas p-10 text-center text-[15px] text-ink-soft">
              No case studies in this category yet.
            </p>
          )}

          <p className="mt-8 text-[13.5px] text-ink-mute" aria-live="polite">
            Showing {visible.length} of {caseStudies.length} success stories
          </p>
        </div>
      </section>

      {/* Outcomes */}
      <section className="border-b border-line bg-canvas">
        <div className="mx-auto grid max-w-[1240px] gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-center lg:py-20">
          <div>
            <p className="eyebrow">
              <span className="eyebrow-dot" aria-hidden="true" />
              Engineering global success
            </p>
            <h2 className="mt-6 font-display text-[clamp(1.9rem,4vw,2.75rem)] leading-[1.06] font-extrabold tracking-[-0.04em] text-ink">
              Our methodology isn't
              <br />
              just about code.
            </h2>
            <p className="mt-5 max-w-xl text-[16.5px] leading-relaxed text-ink-soft">
              It's about business resilience. We integrate with your vision to build ecosystems
              that outlast trends.
            </p>
            <Link
              to="/contact"
              className="mt-7 inline-flex items-center gap-2 text-[13.5px] font-extrabold tracking-[0.06em] text-brand-700 uppercase hover:text-brand-800"
            >
              Consult our experts
              <ArrowUpRight size={16} strokeWidth={2.4} />
            </Link>
          </div>

          <dl className="grid grid-cols-2 gap-5 sm:gap-6">
            {OUTCOME_STATS.map((stat) => (
              <div
                key={stat.label}
                className="card p-6 transition-colors hover:border-brand-300"
              >
                <stat.icon size={20} className="text-brand-600" aria-hidden="true" />
                <dt className="mt-4 text-[12px] font-extrabold tracking-[0.14em] text-ink-mute uppercase">
                  {stat.label}
                </dt>
                <dd className="mt-1 font-display text-[clamp(1.9rem,3.6vw,2.5rem)] leading-none font-extrabold tracking-[-0.04em] text-ink tabular-nums">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <CtaBanner
        title={
          <>
            Ready to write
            <br />
            success stories?
          </>
        }
        description="Our architects are ready to design the solution that moves your metrics."
        primary={{ label: 'Consult our experts', to: '/contact' }}
        secondary={{ label: 'Our services', href: 'https://www.cynbit.in/services' }}
      />
    </>
  );
}
