import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Info } from 'lucide-react';

import { caseStudies } from '../data/site';
import NotFoundPage from './NotFoundPage';
import CtaBanner from '../components/CtaBanner';

/**
 * Case study detail route.
 *
 * Only publishes facts that already exist in the public index (client,
 * category, title, headline metrics). The long-form narrative is NOT
 * reproduced — this prototype does not invent case study content.
 */
export default function CaseStudyDetailPage() {
  const { slug } = useParams();
  const study = caseStudies.find((item) => item.slug === slug);

  if (!study) return <NotFoundPage />;

  return (
    <>
      <section className="border-b border-line bg-canvas">
        <div className="mx-auto max-w-[1240px] px-5 pt-12 pb-14 sm:px-8">
          <Link
            to="/case-studies"
            className="inline-flex items-center gap-2 text-[13px] font-extrabold tracking-[0.08em] text-ink-soft uppercase hover:text-brand-700"
          >
            <ArrowLeft size={15} strokeWidth={2.4} />
            All success stories
          </Link>

          <div className="mt-8 grid gap-9 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start">
            <div>
              <p className="flex flex-wrap items-center gap-2.5 text-[12px] font-extrabold tracking-[0.12em] text-ink-mute uppercase">
                {study.client}
                <span className="h-1 w-1 rounded-full bg-line-strong" aria-hidden="true" />
                <span className="text-brand-600">{study.category}</span>
              </p>

              <h1 className="mt-4 max-w-3xl font-display text-[clamp(2rem,5vw,3.4rem)] leading-[1.05] font-extrabold tracking-[-0.04em] text-ink">
                {study.title}
              </h1>

              <dl className="mt-8 flex flex-wrap gap-3">
                {study.metrics.map((metric, index) => (
                  <div key={metric[0]} className="rounded-2xl border border-line bg-surface px-5 py-4">
                    <dt className="text-[11px] font-extrabold tracking-[0.14em] text-ink-mute uppercase">
                      {index === 0 ? 'Headline metric' : 'Supporting metric'}
                    </dt>
                    <dd className="mt-1.5 font-display text-[17px] font-extrabold text-ink">
                      {metric[0]}: {metric[1]}
                    </dd>
                  </div>
                ))}
              </dl>

              <div className="mt-8 flex max-w-2xl items-start gap-3 rounded-2xl border border-sand-300 bg-sand-100 px-4 py-3.5">
                <Info size={17} className="mt-0.5 shrink-0 text-sand-700" />
                <p className="text-[13.5px] leading-relaxed text-sand-700">
                  <strong className="font-extrabold">Prototype scope.</strong> This detail route
                  reproduces only the information published in the case study index. The full
                  write-up lives on Cynbit's live site and is intentionally not recreated here.
                </p>
              </div>
            </div>

            <div
              className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-[2rem] lg:aspect-square"
              style={{ backgroundImage: `linear-gradient(135deg, ${study.palette[0]}, ${study.palette[1]})` }}
            >
              <span
                className="absolute inset-0 opacity-25 [background-image:radial-gradient(circle_at_25%_25%,white_1px,transparent_1px)] [background-size:18px_18px]"
                aria-hidden="true"
              />
              <span className="relative font-display text-[clamp(3.5rem,8vw,5.5rem)] leading-none font-extrabold tracking-[-0.06em] text-white/90">
                {study.initials}
              </span>
            </div>
          </div>
        </div>
      </section>

      <CtaBanner
        title={
          <>
            Want results
            <br />
            like these?
          </>
        }
        description="Tell us the outcome you need and we'll architect the path to it."
        primary={{ label: 'Start discovery phase', to: '/contact' }}
        secondary={{ label: 'All case studies', to: '/case-studies' }}
      />
    </>
  );
}
