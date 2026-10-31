import { useId, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  AtSign,
  Check,
  ChevronDown,
  Clock3,
  Globe2,
  Loader2,
  MapPin,
  Phone,
  School,
  Briefcase,
} from 'lucide-react';

import { contactFaqs } from '../data/site';
import CtaBanner from '../components/CtaBanner';
import Button from '../components/ui/Button';
import { cn } from '../utils/cn';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

interface InquiryFormState {
  fullName: string;
  email: string;
  company: string;
  industry: string;
  message: string;
}

const EMPTY: InquiryFormState = {
  fullName: '',
  email: '',
  company: '',
  industry: '',
  message: '',
};

function validate(state: InquiryFormState) {
  const errors: Partial<Record<keyof InquiryFormState, string>> = {};
  if (!state.fullName.trim()) errors.fullName = 'Please enter your full name.';
  if (!state.email.trim()) errors.email = 'Please enter your email address.';
  else if (!EMAIL_PATTERN.test(state.email.trim())) errors.email = 'Enter a valid email address.';
  if (!state.message.trim()) errors.message = 'Tell us a little about your project.';
  else if (state.message.trim().length < 15)
    errors.message = 'Please add a little more detail (15 characters or more).';
  return errors;
}

/** Inquiry form — validates, simulates a pending state, then confirms. */
function ContactForm() {
  const uid = useId();
  const [state, setState] = useState<InquiryFormState>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof InquiryFormState, string>>>({});
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  const id = (key: keyof InquiryFormState) => `${uid}-${key}`;
  const errId = (key: keyof InquiryFormState) => `${uid}-${key}-error`;

  const update = <K extends keyof InquiryFormState>(key: K, value: InquiryFormState[K]) => {
    setState((current) => {
      const next: InquiryFormState = { ...current };
      next[key] = value;
      return next;
    });
    if (errors[key]) setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validation = validate(state);
    setErrors(validation);
    const first = (Object.keys(validation) as Array<keyof InquiryFormState>)[0];
    if (first) {
      document.getElementById(id(first))?.focus();
      return;
    }
    setStatus('submitting');
    window.setTimeout(() => setStatus('success'), 850);
  };

  if (status === 'success') {
    return (
      <div className="rounded-3xl border border-brand-200 bg-surface p-8 sm:p-10">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-white">
          <Check size={26} strokeWidth={2.6} aria-hidden="true" />
        </span>
        <h3 className="mt-5 font-display text-[22px] font-extrabold tracking-[-0.02em] text-ink">
          Inquiry ready to send
        </h3>
        <p className="mt-3 max-w-lg text-[15.5px] leading-relaxed text-ink-soft">
          Your details passed validation and the prototype simulated a successful send.{' '}
          <strong className="font-extrabold text-ink">No data left this browser</strong> — for a
          real conversation, email us directly.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button href="mailto:opportunities@cynbit.in" icon={<ArrowRight size={15} />}>
            Email opportunities@cynbit.in
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              setState(EMPTY);
              setErrors({});
              setStatus('idle');
            }}
          >
            Write another
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor={id('fullName')} className="field-label">
            Full Name <span className="text-[#d1434d]">*</span>
          </label>
          <input
            id={id('fullName')}
            name="fullName"
            type="text"
            autoComplete="name"
            placeholder="Your full name"
            value={state.fullName}
            onChange={(event) => update('fullName', event.target.value)}
            aria-invalid={errors.fullName ? true : undefined}
            aria-describedby={errors.fullName ? errId('fullName') : undefined}
            className="field-input"
          />
          {errors.fullName && (
            <p id={errId('fullName')} className="field-error" role="alert">
              {errors.fullName}
            </p>
          )}
        </div>

        <div>
          <label htmlFor={id('email')} className="field-label">
            Email Address <span className="text-[#d1434d]">*</span>
          </label>
          <input
            id={id('email')}
            name="email"
            type="email"
            autoComplete="email"
            placeholder="name@company.com"
            value={state.email}
            onChange={(event) => update('email', event.target.value)}
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={errors.email ? errId('email') : undefined}
            className="field-input"
          />
          {errors.email && (
            <p id={errId('email')} className="field-error" role="alert">
              {errors.email}
            </p>
          )}
        </div>

        <div>
          <label htmlFor={id('company')} className="field-label">
            Company <span className="normal-case text-ink-mute">(optional)</span>
          </label>
          <input
            id={id('company')}
            name="company"
            type="text"
            autoComplete="organization"
            placeholder="Company name"
            value={state.company}
            onChange={(event) => update('company', event.target.value)}
            className="field-input"
          />
        </div>

        <div>
          <label htmlFor={id('industry')} className="field-label">
            Industry <span className="normal-case text-ink-mute">(optional)</span>
          </label>
          <input
            id={id('industry')}
            name="industry"
            type="text"
            placeholder="e.g. Healthcare, Retail"
            value={state.industry}
            onChange={(event) => update('industry', event.target.value)}
            className="field-input"
          />
        </div>
      </div>

      <div>
        <label htmlFor={id('message')} className="field-label">
          Your Message <span className="text-[#d1434d]">*</span>
        </label>
        <textarea
          id={id('message')}
          name="message"
          rows={5}
          placeholder="What are you building, automating or scaling?"
          value={state.message}
          onChange={(event) => update('message', event.target.value)}
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={errors.message ? errId('message') : undefined}
          className="field-input resize-y"
        />
        {errors.message && (
          <p id={errId('message')} className="field-error" role="alert">
            {errors.message}
          </p>
        )}
      </div>

      <div className="flex items-start gap-2.5 rounded-2xl border border-sand-300 bg-sand-100 px-4 py-3">
        <span className="mt-0.5 shrink-0 text-[12.5px] font-extrabold text-sand-700">i</span>
        <p className="text-[12.5px] leading-relaxed text-sand-700">
          <strong className="font-extrabold">Prototype demonstration.</strong> This form validates
          locally and simulates sending — nothing is transmitted or stored.
        </p>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={status === 'submitting'}>
          {status === 'submitting' ? (
            <>
              <Loader2 size={15} className="animate-spin" aria-hidden="true" />
              Sending…
            </>
          ) : (
            <>
              Send Inquiry
              <ArrowRight size={15} strokeWidth={2.4} aria-hidden="true" />
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

/** Accessible single-open FAQ accordion. */
function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="grid gap-3">
      {contactFaqs.map((item, index) => {
        const open = openIndex === index;
        const buttonId = `faq-button-${index}`;
        const panelId = `faq-panel-${index}`;

        return (
          <div key={item.question} className="card overflow-hidden">
            <h3>
              <button
                id={buttonId}
                type="button"
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpenIndex(open ? null : index)}
                className={cn(
                  'flex w-full items-center justify-between gap-5 px-6 py-5 text-left',
                  'font-display text-[16.5px] leading-snug font-extrabold transition-colors',
                  open ? 'text-brand-700' : 'text-ink hover:text-brand-700',
                )}
              >
                {item.question}
                <ChevronDown
                  size={19}
                  strokeWidth={2.3}
                  className={cn('shrink-0 transition-transform', open && 'rotate-180')}
                  aria-hidden="true"
                />
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              className={cn('px-6', open ? 'block pb-6' : 'hidden')}
            >
              <p className="text-[15px] leading-relaxed text-ink-soft">{item.answer}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

const CONTACT_CARDS = [
  {
    icon: AtSign,
    title: 'Mail us at',
    lines: [
      { label: 'opportunities@cynbit.in', href: 'mailto:opportunities@cynbit.in' },
      { label: 'support@cynbit.in', href: 'mailto:support@cynbit.in' },
    ],
  },
  {
    icon: Phone,
    title: 'Contact us at',
    lines: [
      { label: '+91 89479 62667', href: 'tel:+918947962667' },
      { label: '+91 78912 09777', href: 'tel:+917891209777' },
    ],
  },
] as const;

export default function ContactPage() {
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
            Inquiry Hub
          </p>

          <h1 className="mt-6 max-w-4xl font-display text-[clamp(2.3rem,6vw,4.25rem)] leading-[1.02] font-extrabold tracking-[-0.045em] text-ink">
            Start Your Next{' '}
            <span className="text-brand-600">Project With Us</span>
          </h1>

          <p className="mt-6 max-w-2xl text-[17px] leading-relaxed text-ink-soft">
            Whether you're building a product, automating operations, or scaling digitally, our
            architects are ready to design the solution that scales with your ambition.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button href="mailto:opportunities@cynbit.in" icon={<ArrowRight size={15} />}>
              Write us
            </Button>
            <Button href="tel:+918947962667" variant="outline">
              Secure Voice Line
            </Button>
          </div>
        </div>
      </section>

      {/* Blueprint form + trust chips */}
      <section className="border-b border-line bg-surface">
        <div className="mx-auto grid max-w-[1240px] gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16 lg:py-20">
          <div>
            <p className="eyebrow">
              <span className="eyebrow-dot" aria-hidden="true" />
              Project intelligence
            </p>
            <h2 className="mt-6 font-display text-[clamp(1.9rem,4vw,2.75rem)] leading-[1.06] font-extrabold tracking-[-0.04em] text-ink">
              The Blueprint.
            </h2>
            <p className="mt-5 text-[16.5px] leading-relaxed text-ink-soft">
              Tell us what you're building. Our team will analyze your requirements and prepare a
              tailored strategic overview before we connect.
            </p>

            <div className="mt-9 grid gap-4">
              <div className="flex items-center gap-4 rounded-2xl border border-line bg-canvas px-5 py-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                  <Clock3 size={18} aria-hidden="true" />
                </span>
                <span>
                  <span className="block font-display text-[16px] font-extrabold text-ink">24 H</span>
                  <span className="text-[13px] text-ink-mute">Response sync</span>
                </span>
              </div>
              <div className="flex items-center gap-4 rounded-2xl border border-line bg-canvas px-5 py-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                  <Globe2 size={18} aria-hidden="true" />
                </span>
                <span>
                  <span className="block font-display text-[16px] font-extrabold text-ink">Global</span>
                  <span className="text-[13px] text-ink-mute">Delivery hub</span>
                </span>
              </div>
            </div>
          </div>

          <div className="card p-7 sm:p-9">
            <h2 className="font-display text-[11px] font-extrabold tracking-[0.18em] text-ink-soft uppercase">
              The Blueprint — send your brief
            </h2>
            <div className="mt-6">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      {/* Contact details */}
      <section className="border-b border-line bg-canvas">
        <div className="mx-auto grid max-w-[1240px] gap-6 px-5 py-16 sm:px-8 lg:grid-cols-3 lg:py-20">
          {CONTACT_CARDS.map((card) => (
            <div key={card.title} className="card p-7">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 text-white">
                <card.icon size={19} aria-hidden="true" />
              </span>
              <h3 className="mt-5 text-[11px] font-extrabold tracking-[0.16em] text-ink-soft uppercase">
                {card.title}
              </h3>
              <ul className="mt-3 grid gap-2">
                {card.lines.map((line) => (
                  <li key={line.label}>
                    <a
                      href={line.href}
                      className="text-[15.5px] font-bold text-ink transition-colors hover:text-brand-700"
                    >
                      {line.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="card p-7">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 text-white">
              <MapPin size={19} aria-hidden="true" />
            </span>
            <h3 className="mt-5 text-[11px] font-extrabold tracking-[0.16em] text-ink-soft uppercase">
              Address
            </h3>
            <address className="mt-3 text-[15.5px] leading-relaxed font-bold text-ink not-italic">
              32/115 Pratap Nagar,
              <br />
              Jaipur, RJ 302033
            </address>
          </div>
        </div>

        {/* Specialized portals */}
        <div className="mx-auto max-w-[1240px] px-5 pb-16 sm:px-8 lg:pb-20">
          <div className="rounded-[2rem] border border-line bg-surface p-7 sm:p-9">
            <p className="text-[11px] font-extrabold tracking-[0.16em] text-ink-soft uppercase">
              Specialized portals
            </p>
            <p className="mt-2.5 text-[15.5px] text-ink-soft">
              Seeking educational paths or joining our engineering lab?
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Link
                to="/products"
                className="group flex items-center justify-between gap-4 rounded-2xl border border-line bg-canvas px-5 py-5 transition-colors hover:border-brand-400 hover:bg-brand-50"
              >
                <span className="flex items-center gap-3.5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                    <School size={18} aria-hidden="true" />
                  </span>
                  <span className="font-display text-[16px] font-extrabold text-ink">
                    BitElevate Program
                  </span>
                </span>
                <ArrowRight
                  size={17}
                  className="text-brand-600 transition-transform group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </Link>

              <Link
                to="/products"
                className="group flex items-center justify-between gap-4 rounded-2xl border border-line bg-canvas px-5 py-5 transition-colors hover:border-brand-400 hover:bg-brand-50"
              >
                <span className="flex items-center gap-3.5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sand-100 text-sand-700">
                    <Briefcase size={18} aria-hidden="true" />
                  </span>
                  <span className="font-display text-[16px] font-extrabold text-ink">
                    Join the Team
                  </span>
                </span>
                <ArrowRight
                  size={17}
                  className="text-brand-600 transition-transform group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-b border-line bg-surface">
        <div className="mx-auto grid max-w-[1240px] gap-9 px-5 py-16 sm:px-8 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] lg:gap-14 lg:py-20">
          <div>
            <p className="eyebrow">
              <span className="eyebrow-dot" aria-hidden="true" />
              Technical FAQ
            </p>
            <h2 className="mt-6 font-display text-[clamp(1.8rem,3.6vw,2.5rem)] leading-[1.06] font-extrabold tracking-[-0.04em] text-ink">
              Common Inquiries.
            </h2>
            <p className="mt-4 text-[16px] leading-relaxed text-ink-soft">
              Quick answers to the questions we hear most often.
            </p>
          </div>

          <FaqAccordion />
        </div>
      </section>

      <CtaBanner
        title={
          <>
            Ready to
            <br />
            construct?
          </>
        }
        description="Join the visionaries who trust Cynbit to architect their technical futures. Our engineering lab is ready for your challenge."
        primary={{ label: 'View products', to: '/products' }}
        secondary={{ label: 'Our impact', to: '/case-studies' }}
        className="!bg-surface"
      />
    </>
  );
}
