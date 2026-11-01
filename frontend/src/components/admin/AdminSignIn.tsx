import { useId, useState, type FormEvent } from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

import Logo from '../Logo';
import Button from '../ui/Button';
import { useAdminSession } from '../../hooks/useAdminSession';
import { cn } from '../../utils/cn';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Admin sign-in gate.
 *
 * With VITE_API_BASE_URL configured this authenticates against
 * POST /api/admin/auth/login and only the seeded admin account is
 * accepted. Without it (offline demo mode) any email/password opens the
 * demo dashboard — clearly labelled as a demo gate with no security.
 */
export function AdminSignIn() {
  const { signIn, realAuth } = useAdminSession();
  const uid = useId();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
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
    setFormError(null);
    if (next.email || next.password) {
      document.getElementById(next.email ? `${uid}-email` : `${uid}-password`)?.focus();
      return;
    }

    setSubmitting(true);
    try {
      await signIn(email.trim(), password);
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : 'Sign-in failed. Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
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
                {realAuth ? 'Admin' : 'Prototype'}
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
            {realAuth ? (
              <div className="mb-6 flex items-start gap-3 rounded-2xl border border-sand-300 bg-sand-100 px-4 py-3.5">
                <ShieldCheck size={17} className="mt-0.5 shrink-0 text-sand-700" />
                <p className="text-[13px] leading-relaxed text-sand-700">
                  <strong className="font-extrabold">Backend sign-in.</strong> Credentials are
                  verified by the API. Use the admin account configured in the backend{' '}
                  <code className="font-mono">.env</code>.
                </p>
              </div>
            ) : (
              <div className="mb-6 flex items-start gap-3 rounded-2xl border border-sand-300 bg-sand-100 px-4 py-3.5">
                <AlertTriangle size={17} className="mt-0.5 shrink-0 text-sand-700" />
                <p className="text-[13px] leading-relaxed text-sand-700">
                  <strong className="font-extrabold">Demo gate only.</strong> The backend is not
                  configured — any email and password will open the dashboard. Never use real
                  credentials.
                </p>
              </div>
            )}

            {formError && (
              <div
                role="alert"
                className="mb-5 rounded-2xl border border-[#f2c4c7] bg-[#fdf0f1] px-4 py-3.5 text-[13px] leading-relaxed text-[#a3272d]"
              >
                {formError}
              </div>
            )}

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

              <Button type="submit" className="mt-1 w-full" disabled={submitting}>
                {submitting ? 'Signing in…' : 'Open dashboard'}
              </Button>
            </form>
          </div>
        </div>

        <p className="mt-5 text-center text-[13px] text-ink-mute">
          {realAuth
            ? 'Admin sessions are issued by the backend and expire after 7 days.'
            : 'Data shown here is stored locally in this browser only.'}
        </p>
      </div>
    </div>
  );
}

export default AdminSignIn;
