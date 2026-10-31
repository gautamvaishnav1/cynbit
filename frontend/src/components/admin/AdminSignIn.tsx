import { useId, useState, type FormEvent } from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

import Logo from '../Logo';
import Button from '../ui/Button';
import { useAdminSession } from '../../hooks/useAdminSession';
import { cn } from '../../utils/cn';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Mock admin sign-in gate.
 *
 * There is NO real authentication here (no backend, no password check) —
 * the form only validates its own input so the flow feels realistic. Any
 * email + password combination opens the demo dashboard. A real deployment
 * must authenticate server-side and authorise every admin endpoint.
 */
export function AdminSignIn() {
  const { signIn } = useAdminSession();
  const uid = useId();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const next: { email?: string; password?: string } = {};
    if (!email.trim()) {
      next.email = 'Please enter your email address.';
    } else if (!EMAIL_PATTERN.test(email.trim())) {
      next.email = 'Enter a valid email address, e.g. admin@cynbit.in.';
    }
    if (!password) {
      next.password = 'Please enter a password.';
    }

    setErrors(next);
    if (next.email || next.password) {
      document.getElementById(next.email ? `${uid}-email` : `${uid}-password`)?.focus();
      return;
    }

    signIn(email.trim());
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-canvas px-5 py-14">
      <div className="w-full max-w-[440px]">
        <div className="card overflow-hidden shadow-[0_36px_80px_-50px_rgba(2,43,47,0.6)]">
          <div className="border-b border-line bg-surface px-8 pt-8 pb-6">
            <div className="flex items-center justify-between gap-4">
              <Logo />
              <span className="inline-flex items-center gap-1.5 rounded-full bg-sand-200 px-3 py-1.5 text-[10.5px] font-extrabold tracking-[0.12em] text-ink uppercase">
                <ShieldCheck size={13} aria-hidden="true" />
                Prototype
              </span>
            </div>
            <h1 className="mt-7 font-display text-[26px] leading-tight font-extrabold tracking-[-0.03em] text-ink">
              Review admin panel
            </h1>
            <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
              Sign in to moderate product reviews, manage client reviews of the company and
              control which review sections the public site shows.
            </p>
          </div>

          <div className="px-8 py-7">
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-sand-300 bg-sand-100 px-4 py-3.5">
              <AlertTriangle size={17} className="mt-0.5 shrink-0 text-sand-700" />
              <p className="text-[13px] leading-relaxed text-sand-700">
                <strong className="font-extrabold">Demo gate only.</strong> This prototype has no
                backend or real authentication — any email and password will open the dashboard.
                Never use real credentials.
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="grid gap-5">
              <div>
                <label htmlFor={`${uid}-email`} className="field-label">
                  Admin email <span className="text-[#d1434d]">*</span>
                </label>
                <input
                  id={`${uid}-email`}
                  type="email"
                  autoComplete="username"
                  placeholder="admin@cynbit.in"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    if (errors.email) setErrors({});
                  }}
                  aria-invalid={errors.email ? true : undefined}
                  aria-describedby={errors.email ? `${uid}-email-error` : undefined}
                  className="field-input"
                />
                {errors.email && (
                  <p id={`${uid}-email-error`} className="field-error" role="alert">
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor={`${uid}-password`} className="field-label">
                  Password <span className="text-[#d1434d]">*</span>
                </label>
                <input
                  id={`${uid}-password`}
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    if (errors.password) setErrors({});
                  }}
                  aria-invalid={errors.password ? true : undefined}
                  aria-describedby={errors.password ? `${uid}-password-error` : undefined}
                  className={cn('field-input')}
                />
                {errors.password && (
                  <p id={`${uid}-password-error`} className="field-error" role="alert">
                    {errors.password}
                  </p>
                )}
              </div>

              <Button type="submit" className="mt-1 w-full">
                Open dashboard
              </Button>
            </form>
          </div>
        </div>

        <p className="mt-5 text-center text-[13px] text-ink-mute">
          Data shown here is stored locally in this browser only.
        </p>
      </div>
    </div>
  );
}

export default AdminSignIn;
