import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Quote } from 'lucide-react';

import Icon from '../components/ui/Icon';
import Button from '../components/ui/Button';
import SectionHeading from '../components/ui/SectionHeading';
import CtaBanner from '../components/CtaBanner';
import ClientReviewsSection from '../components/sections/ClientReviewsSection';
import { products } from '../data/products';
import { cn } from '../utils/cn';

const ROTATING_PHRASES = ['AI automation.', 'SaaS platforms.', 'software systems.'] as const;

function useRotatingPhrase(phrases: readonly string[], intervalMs = 2600) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion || phrases.length < 2) return undefined;

    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % phrases.length);
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [phrases.length, intervalMs]);

  return phrases[index];
}

/* ------------------------------- Hero ------------------------------- */

function Hero() {
  const phrase = useRotatingPhrase(ROTATING_PHRASES);

  return (
    <section className="relative overflow-hidden border-b border-line bg-canvas">
      <span
        className="absolute inset-0 dot-grid opacity-70 [mask-image:radial-gradient(ellipse_at_top_right,black,transparent_65%)]"
        aria-hidden="true"
      />
      <span
        className="absolute -top-40 -left-32 h-[420px] w-[420px] rounded-full bg-brand-100/60 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto grid max-w-[1240px] gap-12 px-5 pt-14 pb-16 sm:px-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-center lg:pt-20 lg:pb-24">
        <div>
          <p className="eyebrow">
            <span className="eyebrow-dot" aria-hidden="true" />
            The optimistic architect
          </p>

          <h1 className="mt-7 font-display text-[clamp(2.5rem,6.6vw,4.6rem)] leading-[1.02] font-extrabold tracking-[-0.05em] text-ink">
            Architecting the future with
            <br />
            <span className="italic text-brand-500">{phrase}</span>
          </h1>

          <p className="mt-7 max-w-2xl text-[17.5px] leading-relaxed text-ink-soft">
            Cynbit Technologies architects the digital future with{' '}
            <Link to="/products" className="font-semibold text-brand-600 hover:underline">
              autonomous AI agents
            </Link>
            , custom software development, and scalable business platforms. Based in Jaipur,
            Rajasthan, we bridge the gap between technical precision and global business growth.
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <Button to="/contact" icon={<ArrowRight size={15} strokeWidth={2.4} />}>
              Start discovery
            </Button>
            <Button variant="outline" to="/case-studies">
              View work
            </Button>
          </div>
        </div>

        {/* Product console visual */}
        <div className="relative">
          <div className="card relative overflow-hidden p-6 shadow-[0_40px_80px_-50px_rgba(2,43,47,0.8)]">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <span className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-brand-500" aria-hidden="true" />
                <span className="h-2.5 w-2.5 rounded-full bg-sand-400" aria-hidden="true" />
                <span className="h-2.5 w-2.5 rounded-full bg-line-strong" aria-hidden="true" />
              </span>
              <span className="font-mono text-[11.5px] tracking-wide text-ink-mute">
                cynbit.ecosystem
              </span>
            </div>

            <ul className="mt-5 grid gap-3">
              {products.map((product, index) => (
                <li
                  key={product.id}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-line bg-canvas px-4 py-3.5"
                >
                  <span className="flex items-center gap-3">
                    <span
                      className={cn(
                        'flex h-9 w-9 items-center justify-center rounded-xl text-[12.5px] font-extrabold text-white',
                        index === 0 && 'bg-brand-600',
                        index === 1 && 'bg-sand-500',
                        index === 2 && 'bg-brand-800',
                      )}
                      aria-hidden="true"
                    >
                      {product.monogram}
                    </span>
                    <span>
                      <span className="block text-[14.5px] leading-tight font-extrabold text-ink">
                        {product.name}
                      </span>
                      <span className="text-[12px] text-ink-mute">{product.flag}</span>
                    </span>
                  </span>
                  <span className="rounded-full bg-brand-50 px-3 py-1 text-[11px] font-extrabold tracking-wide text-brand-700 uppercase">
                    Live
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-canvas px-4 py-3.5">
                <p className="text-[10.5px] font-extrabold tracking-[0.14em] text-ink-mute uppercase">
                  Automation
                </p>
                <p className="mt-1 font-display text-[20px] font-extrabold text-ink tabular-nums">
                  95%
                </p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line">
                  <div className="h-full w-[95%] rounded-full bg-brand-600" />
                </div>
              </div>
              <div className="rounded-2xl bg-canvas px-4 py-3.5">
                <p className="text-[10.5px] font-extrabold tracking-[0.14em] text-ink-mute uppercase">
                  Runtime
                </p>
                <p className="mt-1 flex items-center gap-2 font-display text-[20px] font-extrabold text-ink">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-brand-500" aria-hidden="true" />
                  Active
                </p>
                <p className="mt-2 text-[11.5px] text-ink-mute">all systems nominal</p>
              </div>
            </div>
          </div>

          <span className="absolute -top-5 -left-4 hidden rounded-2xl border border-line bg-surface px-4 py-3 shadow-lg sm:block">
            <span className="block text-[10.5px] font-extrabold tracking-[0.14em] text-ink-mute uppercase">
              Efficiency
            </span>
            <span className="font-display text-[16px] font-extrabold text-ink">95%</span>
          </span>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------- Ecosystem ---------------------------- */

const ECOSYSTEM = [
  {
    icon: 'settings_suggest',
    title: 'Custom IT infrastructure',
    body: 'Specialized software architecture and secure cloud foundations. We engineer scalable growth engines designed to accelerate technical maturity.',
    chips: ['AI automation', 'Software Dev', 'Cloud Systems', 'Technical SEO'],
    href: 'https://www.cynbit.in/services',
    cta: 'Explore services',
  },
  {
    icon: 'inventory_2',
    title: 'Proprietary SaaS suite',
    body: 'Bespoke digital ecosystems engineered for specific market challenges and organizational excellence.',
    products: true,
    href: '/products',
    cta: 'Open product suite',
  },
  {
    icon: 'volunteer_activism',
    title: 'Human-centric impact',
    body: 'Beyond code, we invest in human potential. Through our partnership with Manav Seva Trust, we provide Computer and IT teaching to rural areas and government schools, bridging the digital divide wherever we can.',
    chips: ['Manav Seva Trust', 'Rural IT education'],
    href: 'https://www.cynbit.in/impact',
    cta: 'Explore our mission',
  },
] as const;

function EcosystemSection() {
  return (
    <section className="border-b border-line bg-surface">
      <div className="mx-auto max-w-[1240px] px-5 py-16 sm:px-8 lg:py-24">
        <SectionHeading
          eyebrow="Our Ecosystem"
          eyebrowIcon="hub"
          title={
            <>
              Foundational
              <br />
              pillars.
            </>
          }
          description="Integrated excellence across AI technology, full-stack software development, and social responsibility."
        />

        <div className="mt-11 grid gap-6 lg:grid-cols-3">
          {ECOSYSTEM.map((card) => (
            <article key={card.title} className="card flex flex-col p-7 transition-colors hover:border-brand-300">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                <Icon name={card.icon} size={22} />
              </span>

              <h3 className="mt-5 font-display text-[20px] leading-tight font-extrabold tracking-[-0.02em] text-ink">
                {card.title}
              </h3>
              <p className="mt-3 text-[14.5px] leading-relaxed text-ink-soft">{card.body}</p>

              {'products' in card && card.products ? (
                <ul className="mt-5 grid gap-2.5">
                  {products.map((product) => (
                    <li key={product.id}>
                      <Link
                        to="/products"
                        className="flex items-center justify-between gap-3 rounded-xl border border-line bg-canvas px-4 py-3 text-[14px] font-bold text-ink transition-colors hover:border-brand-400 hover:bg-brand-50"
                      >
                        <span className="flex items-center gap-2.5">
                          <span className="text-[11px] font-extrabold tracking-wider text-brand-600">
                            {product.monogram}
                          </span>
                          {product.name}
                        </span>
                        <ArrowUpRight size={15} className="text-ink-mute" aria-hidden="true" />
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <ul className="mt-5 flex flex-wrap gap-2">
                  {'chips' in card &&
                    card.chips.map((chip) => (
                      <li
                        key={chip}
                        className="rounded-full border border-line bg-canvas px-3.5 py-1.5 text-[12.5px] font-bold text-ink-soft"
                      >
                        {chip}
                      </li>
                    ))}
                </ul>
              )}

              <div className="mt-auto pt-6">
                {card.href.startsWith('http') ? (
                  <a
                    href={card.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-2 text-[13px] font-extrabold tracking-[0.08em] text-brand-700 uppercase hover:text-brand-800"
                  >
                    {card.cta}
                    <ArrowRight size={15} strokeWidth={2.4} />
                  </a>
                ) : (
                  <Link
                    to={card.href}
                    className="inline-flex items-center gap-2 text-[13px] font-extrabold tracking-[0.08em] text-brand-700 uppercase hover:text-brand-800"
                  >
                    {card.cta}
                    <ArrowRight size={15} strokeWidth={2.4} />
                  </Link>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------- BitElevate ---------------------------- */

const BITELEVATE_FEATURES = [
  { icon: 'verified', title: 'Global Certification', body: 'Industry-standard credentials accepted by top firms worldwide.' },
  { icon: 'groups', title: 'Expert Mentorship', body: 'Learn directly from senior architects and tech leaders.' },
  { icon: 'architecture', title: 'Industry Projects', body: 'Build real-world systems with professional-grade rigor.' },
  { icon: 'work_history', title: 'Career Placement', body: 'Dedicated support to land roles in premium tech companies.' },
] as const;

function BitElevateSection() {
  return (
    <section className="border-b border-line bg-canvas">
      <div className="mx-auto grid max-w-[1240px] gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] lg:gap-16 lg:py-24">
        <div>
          <p className="eyebrow">
            <span className="eyebrow-dot" aria-hidden="true" />
            Empowering careers
          </p>

          <h2 className="mt-6 font-display text-[clamp(2rem,4.6vw,3.1rem)] leading-[1.05] font-extrabold tracking-[-0.04em] text-ink">
            BitElevate.
          </h2>

          <p className="mt-5 max-w-xl text-[16.5px] leading-relaxed text-ink-soft">
            A globally recognized training program designed to bridge the gap between academic
            learning and industry mastery. We prepare you for the high-demand world of modern
            architectural engineering.
          </p>

          <ul className="mt-9 grid gap-5 sm:grid-cols-2">
            {BITELEVATE_FEATURES.map((feature) => (
              <li key={feature.title} className="flex gap-3.5">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                  <Icon name={feature.icon} size={17} />
                </span>
                <span>
                  <span className="block font-display text-[15.5px] font-extrabold text-ink">
                    {feature.title}
                  </span>
                  <span className="mt-1 block text-[14px] leading-relaxed text-ink-soft">
                    {feature.body}
                  </span>
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-9">
            <Button href="https://www.cynbit.in/bitelevate">Join the program</Button>
          </div>
        </div>

        <div className="grid content-start gap-5">
          <div className="rounded-[2rem] bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500 p-8 dot-grid">
            <p className="font-display text-[clamp(2.6rem,6vw,3.6rem)] leading-none font-extrabold text-white tabular-nums">
              1000+
            </p>
            <p className="mt-3 text-[13px] font-extrabold tracking-[0.16em] text-brand-100 uppercase">
              Certified architects
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
            <div className="card p-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sand-100 text-sand-700">
                <Icon name="workspace_premium" size={19} />
              </span>
              <p className="mt-4 font-display text-[16.5px] leading-tight font-extrabold text-ink">
                Certified Software Architect
              </p>
              <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1.5 text-[12px] font-extrabold tracking-wide text-brand-700 uppercase">
                <Icon name="verified" size={13} />
                Verified — industry ready
              </p>
            </div>

            <div className="card p-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                <Icon name="analytics" size={19} />
              </span>
              <p className="mt-4 font-display text-[16.5px] leading-tight font-extrabold text-ink">
                Competency: Full-Stack Dev
              </p>
              <p className="mt-2 text-[13.5px] text-ink-mute">Measured through AI-evaluated missions</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ Edge -------------------------------- */

const EDGE = [
  { icon: 'bolt', title: 'Startup speed', body: 'Rapid execution without bureaucracy.' },
  { icon: 'psychology', title: 'AI-first thinking', body: 'Systems designed with automation first.' },
  { icon: 'terminal', title: 'End-to-end dev', body: 'Full ownership from design to deploy.' },
  { icon: 'trending_up', title: 'ROI engineering', body: 'We build for business outcomes and scale.' },
] as const;

const DOMAINS = [
  { icon: 'analytics', title: 'Software engineering', body: 'Secure full-stack development and cloud migration foundations.' },
  { icon: 'campaign', title: 'Digital marketing & SEO', body: 'Data-driven ROI engines merging technical SEO with creative precision.' },
  { icon: 'psychology', title: 'AI automation', body: 'Custom LLMs and autonomous agents designed for cognitive operations.' },
  { icon: 'cloud_done', title: 'Cloud infrastructure', body: 'Zero-trust deployment across AWS and Azure for global business scale.' },
] as const;

const DOMAIN_STATS = [
  { value: '98%', label: 'Retention' },
  { value: '24/7', label: 'Support' },
  { value: '3x', label: 'ROI Uplift' },
  { value: '6+', label: 'Global Reach' },
] as const;

function EdgeAndDomainSection() {
  return (
    <>
      <section className="border-b border-line bg-surface">
        <div className="mx-auto max-w-[1240px] px-5 py-16 sm:px-8 lg:py-24">
          <SectionHeading
            eyebrow="The Cynbit edge"
            eyebrowIcon="bolt"
            title={
              <>
                The speed of a startup.
                <br />
                The rigor of an enterprise.
              </>
            }
            description="We combine technical agility with structured execution to deliver outcomes that scale with your ambitions."
          />

          <div className="mt-11 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {EDGE.map((item) => (
              <div key={item.title} className="card p-6 transition-colors hover:border-brand-300">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                  <Icon name={item.icon} size={20} />
                </span>
                <h3 className="mt-5 font-display text-[17px] leading-tight font-extrabold text-ink">
                  {item.title}
                </h3>
                <p className="mt-2 text-[14.5px] leading-relaxed text-ink-soft">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-line bg-canvas">
        <div className="mx-auto max-w-[1240px] px-5 py-16 sm:px-8 lg:py-24">
          <SectionHeading
            eyebrow="Domain Mastery"
            eyebrowIcon="auto_graph"
            title="Architectural mastery across four domains."
          />

          <div className="mt-11 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {DOMAINS.map((domain) => (
              <div key={domain.title} className="card p-6 transition-colors hover:border-brand-300">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-600 text-white">
                  <Icon name={domain.icon} size={20} />
                </span>
                <h3 className="mt-5 font-display text-[17px] leading-tight font-extrabold text-ink">
                  {domain.title}
                </h3>
                <p className="mt-2 text-[14.5px] leading-relaxed text-ink-soft">{domain.body}</p>
              </div>
            ))}
          </div>

          <dl className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {DOMAIN_STATS.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-line bg-surface px-5 py-5 text-center">
                <dd className="font-display text-[clamp(1.6rem,3vw,2.1rem)] leading-none font-extrabold text-brand-600 tabular-nums">
                  {stat.value}
                </dd>
                <dt className="mt-2 text-[12px] font-extrabold tracking-[0.14em] text-ink-mute uppercase">
                  {stat.label}
                </dt>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </>
  );
}

/* ----------------------------- Process ------------------------------ */

const PROCESS = [
  { step: '01', title: 'Discovery & audit', body: 'We deep-dive into your existing workflows and technical debt to identify invisible friction points.' },
  { step: '02', title: 'Strategy & blueprinting', body: 'A custom architectural roadmap mapping the logic, AI integration, and scalability modules.' },
  { step: '03', title: 'High-fidelity design', body: 'Cinematic, user-centric systems designed to turn complex technical logic into seamless human experiences.' },
  { step: '04', title: 'Technical implementation', body: 'Deployment of robust technical engines and clean, resilient codebases built for enterprise stability.' },
  { step: '05', title: 'Quality & integrity check', body: 'Rigorous stress-testing and security audits to ensure your ecosystem is production-ready.' },
  { step: '06', title: 'Deployment & evolution', body: 'Live launch followed by ROI-driven optimization and proactive system scaling.' },
] as const;

function ProcessSection() {
  return (
    <section className="border-b border-line bg-surface">
      <div className="mx-auto max-w-[1240px] px-5 py-16 sm:px-8 lg:py-24">
        <SectionHeading
          eyebrow="Architectural lifecycle"
          eyebrowIcon="route"
          title={
            <>
              How we construct
              <br />
              digital success.
            </>
          }
          description="Our process is a structured sequence of precision and empathy, designed to maximize scalability and minimize friction."
        />

        <ol className="mt-11 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PROCESS.map((item) => (
            <li key={item.step} className="card relative overflow-hidden p-7 transition-colors hover:border-brand-300">
              <span className="absolute top-4 right-5 font-display text-[42px] leading-none font-extrabold text-brand-50 tabular-nums select-none">
                {item.step}
              </span>
              <h3 className="relative font-display text-[18px] leading-tight font-extrabold text-ink">
                {item.title}
              </h3>
              <p className="relative mt-3 text-[14.5px] leading-relaxed text-ink-soft">{item.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ------------------------- Client outcomes -------------------------- */

const CLIENT_NAMES = [
  'Marketing Addict',
  'Evento',
  'Urban Wardrobe',
  'Cloudy Tales',
  'EContentPrep',
  'Sofiasa',
  'Wild basil',
  'Pragya Healths',
  'WizHealth',
];

const CLIENT_QUOTES = [
  {
    metric: '+40% Growth',
    quote:
      'Cynbit transformed our technical infrastructure, resulting in a 40% increase in organic leads. Their approach is revolutionary.',
    client: 'Marketing Addict',
    category: 'Strategic Partner',
  },
  {
    metric: '50k+ Users',
    quote:
      'The AI automation handled 50k+ users without a single flicker of latency. True engineering rigor.',
    client: 'Evento',
    category: 'Enterprise SaaS',
  },
  {
    metric: '99.9% Uptime',
    quote:
      "Cynbit's cloud architecture gave us the global stability we needed to expand our digital footprint rapidly.",
    client: 'Urban Wardrobe',
    category: 'Global Retail',
  },
  {
    metric: '100% Success',
    quote:
      'From the first blueprint to final deployment, the Cynbit team acted as true architects of our story.',
    client: 'Cloudy Tales',
    category: 'Creative Studio',
  },
] as const;

function VoicesSection() {
  const names = useMemo(() => [...CLIENT_NAMES], []);

  return (
    <section className="border-b border-line bg-canvas">
      <div className="mx-auto max-w-[1240px] px-5 py-16 sm:px-8 lg:py-24">
        <SectionHeading
          eyebrow="Validation & impact"
          eyebrowIcon="thumb_up"
          align="center"
          title="Architecting success for visionaries."
        />

        {/* Client wall */}
        <ul className="mt-9 flex flex-wrap justify-center gap-2.5">
          {names.map((name) => (
            <li
              key={name}
              className="rounded-full border border-line bg-surface px-4 py-2 text-[13px] font-bold text-ink-soft"
            >
              {name}
            </li>
          ))}
        </ul>

        {/* Published client quotes (content from the public site — no star ratings) */}
        <div className="mt-11 grid gap-6 sm:grid-cols-2">
          {CLIENT_QUOTES.map((item) => (
            <figure key={item.client} className="card flex flex-col p-7 transition-colors hover:border-brand-300">
              <div className="flex items-center justify-between gap-4">
                <span className="rounded-full bg-sand-200 px-3.5 py-1.5 text-[12px] font-extrabold tracking-wide text-ink">
                  {item.metric}
                </span>
                <Quote size={22} className="text-brand-500" fill="currentColor" aria-hidden="true" />
              </div>

              <blockquote className="mt-5 text-[15.5px] leading-relaxed text-ink-soft">
                “{item.quote}”
              </blockquote>

              <figcaption className="mt-6 flex items-center gap-3 border-t border-line pt-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 font-display text-[13px] font-extrabold text-white">
                  {item.client.slice(0, 1)}
                </span>
                <span>
                  <span className="block font-display text-[15px] font-extrabold text-ink">
                    {item.client}
                  </span>
                  <span className="text-[12.5px] text-ink-mute">{item.category}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ Page ------------------------------- */

export default function HomePage() {
  return (
    <>
      <Hero />
      <EcosystemSection />
      <BitElevateSection />
      <EdgeAndDomainSection />
      <ProcessSection />
      <VoicesSection />
      <ClientReviewsSection />
      <CtaBanner
        title={
          <>
            Ready to build your
            <br />
            digital future?
          </>
        }
        description="Let's discuss how our AI automation and custom software development expertise can transform your business vision into a reality."
        primary={{ label: 'Start discovery phase', to: '/contact' }}
        secondary={{ label: 'View our work', to: '/case-studies' }}
      />
    </>
  );
}

/** Exported for reuse: small icon+text link used across sections. */
export function TextLink({
  to,
  children,
  className,
}: {
  to: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      to={to}
      className={cn(
        'inline-flex items-center gap-2 text-[13px] font-extrabold tracking-[0.08em] text-brand-700 uppercase hover:text-brand-800',
        className,
      )}
    >
      {children}
      <ArrowRight size={15} strokeWidth={2.4} />
    </Link>
  );
}
