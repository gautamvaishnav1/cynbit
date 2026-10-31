import { useId, useState, type FormEvent } from 'react';
import { ArrowRight, Check, Clock, Globe2, Loader2, Rocket, AlertTriangle } from 'lucide-react';

import type { ProductId } from '../types';
import { products } from '../data/products';
import Button from './ui/Button';
import SectionHeading from './ui/SectionHeading';
import { cn } from '../utils/cn';

interface DemoRequestSectionProps {
  /** Product preselected when the section is opened from a product block. */
  initialProductId?: ProductId;
}

interface FormState {
  productId: ProductId;
  fullName: string;
  workEmail: string;
  companyName: string;
  message: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const DEFAULT_VALUES: FormState = {
  productId: 'cynbit-studio',
  fullName: '',
  workEmail: '',
  companyName: '',
  message: '',
};

function validate(state: FormState): Partial<Record<keyof FormState, string>> {
  const errors: Partial<Record<keyof FormState, string>> = {};
  if (!state.fullName.trim()) errors.fullName = 'Please enter your full name.';
  if (!state.workEmail.trim()) errors.workEmail = 'Please enter your work email.';
  else if (!EMAIL_PATTERN.test(state.workEmail.trim()))
    errors.workEmail = 'Enter a valid email address.';
  if (!state.message.trim()) errors.message = 'Tell us briefly what you need.';
  else if (state.message.trim().length < 15)
    errors.message = 'Please add a little more detail (15 characters or more).';
  return errors;
}

/**
 * "Schedule a Demo" conversion block — mirrors the interaction on the live
 * Products page.
 *
 * FRONT-END ONLY: submitting validates the fields, shows a pending state and
 * then a confirmation. No request is transmitted anywhere.
 */
export default function DemoRequestSection({ initialProductId }: DemoRequestSectionProps) {
  const uid = useId();
  const [state, setState] = useState<FormState>({
    ...DEFAULT_VALUES,
    productId: initialProductId ?? DEFAULT_VALUES.productId,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  const id = (key: keyof FormState) => `${uid}-${key}`;
  const errId = (key: keyof FormState) => `${uid}-${key}-error`;

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setState((current) => {
      const next: FormState = { ...current };
      next[key] = value;
      return next;
    });
    if (errors[key]) {
      setErrors((current) => ({ ...current, [key]: undefined }));
    }
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validation = validate(state);
    setErrors(validation);
    if (Object.keys(validation).length > 0) {
      const first = Object.keys(validation)[0] as keyof FormState;
      document.getElementById(id(first))?.focus();
      return;
    }

    setStatus('submitting');
    // Simulated round-trip so the pending state is genuine UI feedback.
    window.setTimeout(() => setStatus('success'), 850);
  };

  if (status === 'success') {
    return (
      <section id="inquiry" className="scroll-mt-24 border-t border-line bg-canvas">
        <div className="mx-auto max-w-[1240px] px-5 py-20 sm:px-8 lg:py-24">
          <div className="mx-auto max-w-xl rounded-[2rem] border border-brand-200 bg-surface p-9 text-center sm:p-11">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-600 text-white">
              <Check size={30} strokeWidth={2.6} />
            </span>
            <h2 className="mt-6 font-display text-[clamp(1.5rem,3.4vw,2rem)] leading-tight font-extrabold tracking-[-0.03em] text-ink">
              Demo request received
            </h2>
            <p className="mt-3.5 text-[15.5px] leading-relaxed text-ink-soft">
              Thanks, {state.fullName.trim().split(' ')[0] || 'there'} — this frontend prototype
              validated your request and simulated a successful response.{' '}
              <strong className="font-extrabold text-ink">
                Nothing was sent to a server
              </strong>{' '}
              and your details were not stored.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Button
                onClick={() => {
                  setState({ ...DEFAULT_VALUES, productId: state.productId });
                  setErrors({});
                  setStatus('idle');
                }}
              >
                Request another demo
              </Button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="inquiry" className="scroll-mt-24 border-t border-line bg-canvas">
      <div className="mx-auto max-w-[1240px] px-5 py-20 sm:px-8 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16">
          {/* Intro */}
          <div>
            <SectionHeading
              eyebrow="Schedule a Demo"
              eyebrowIcon="rocket"
              title={
                <>
                  See the product
                  <br />
                  in action.
                </>
              }
              description="Select a product and our team will prepare a specialized showcase for your business."
            />

            <ul className="mt-9 grid gap-4">
              <li className="flex items-start gap-3.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                  <Clock size={18} aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-[14.5px] font-extrabold text-ink">24 H response sync</span>
                  <span className="text-[13.5px] text-ink-mute">
                    An architect replies within one working day.
                  </span>
                </span>
              </li>
              <li className="flex items-start gap-3.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                  <Globe2 size={18} aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-[14.5px] font-extrabold text-ink">Global delivery hub</span>
                  <span className="text-[13.5px] text-ink-mute">
                    Distributed teams supporting enterprises worldwide.
                  </span>
                </span>
              </li>
              <li className="flex items-start gap-3.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sand-100 text-sand-700">
                  <Rocket size={18} aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-[14.5px] font-extrabold text-ink">
                    Tailored showcase
                  </span>
                  <span className="text-[13.5px] text-ink-mute">
                    Demo configured around your use case, not a generic tour.
                  </span>
                </span>
              </li>
            </ul>
          </div>

          {/* Form */}
          <div className="card p-7 sm:p-9">
            <form onSubmit={onSubmit} noValidate className="grid gap-5">
              {/* Product selection */}
              <fieldset>
                <legend className="field-label">Select a product</legend>
                <div className="flex flex-wrap gap-2.5" role="radiogroup" aria-label="Select a product">
                  {products.map((product) => {
                    const active = state.productId === product.id;
                    return (
                      <button
                        key={product.id}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => update('productId', product.id)}
                        className={cn(
                          'inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-[13.5px] font-extrabold transition-colors',
                          active
                            ? 'border-brand-600 bg-brand-600 text-white'
                            : 'border-line bg-canvas text-ink-soft hover:border-brand-300 hover:text-ink',
                        )}
                      >
                        {active && <Check size={14} strokeWidth={3} aria-hidden="true" />}
                        {product.name}
                      </button>
                    );
                  })}
                </div>
              </fieldset>

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
                  <label htmlFor={id('workEmail')} className="field-label">
                    Work Email <span className="text-[#d1434d]">*</span>
                  </label>
                  <input
                    id={id('workEmail')}
                    name="workEmail"
                    type="email"
                    autoComplete="email"
                    placeholder="name@company.com"
                    value={state.workEmail}
                    onChange={(event) => update('workEmail', event.target.value)}
                    aria-invalid={errors.workEmail ? true : undefined}
                    aria-describedby={errors.workEmail ? errId('workEmail') : undefined}
                    className="field-input"
                  />
                  {errors.workEmail && (
                    <p id={errId('workEmail')} className="field-error" role="alert">
                      {errors.workEmail}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor={id('companyName')} className="field-label">
                  Company Name <span className="normal-case text-ink-mute">(optional)</span>
                </label>
                <input
                  id={id('companyName')}
                  name="companyName"
                  type="text"
                  autoComplete="organization"
                  placeholder="Where you work"
                  value={state.companyName}
                  onChange={(event) => update('companyName', event.target.value)}
                  className="field-input"
                />
              </div>

              <div>
                <label htmlFor={id('message')} className="field-label">
                  How can we help? <span className="text-[#d1434d]">*</span>
                </label>
                <textarea
                  id={id('message')}
                  name="message"
                  rows={4}
                  placeholder="Tell us about your product, users and the outcome you want."
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
                <AlertTriangle size={16} className="mt-0.5 shrink-0 text-sand-700" />
                <p className="text-[12.5px] leading-relaxed text-sand-700">
                  <strong className="font-extrabold">Prototype only.</strong> This demo form does
                  not send or store your details — it simulates the submission flow for review.
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
                      Request Studio Demo
                      <ArrowRight size={15} strokeWidth={2.4} aria-hidden="true" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
