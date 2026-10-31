import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Optional label used in the fallback copy, e.g. "the admin panel". */
  scope?: string;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * Top-level React error boundary.
 *
 * Catches render/lifecycle/hook errors so a crash shows a friendly recovery
 * screen instead of a blank white page. This is the last line of defence —
 * individual async data failures are still handled by each section's own
 * error state (review lists, client reviews, forms, etc.).
 *
 * Note: error boundaries cannot catch errors thrown in event handlers,
 * async code (promises/timeouts) or SSR — those need separate handling
 * (e.g. window.onerror / unhandledrejection listeners) which is out of
 * scope for this client-only prototype.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Surface the error for developers; a production build should also ship
    // this to an error-monitoring service (Sentry, etc.).
    // eslint-disable-next-line no-console
    console.error('Unhandled UI error:', error, info.componentStack);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    // Full navigation resets the router + module state cleanly.
    window.location.assign('/');
  };

  render() {
    const { error } = this.state;
    const { children, scope = 'this page' } = this.props;

    if (!error) return children;

    return (
      <div className="flex min-h-dvh items-center justify-center bg-canvas px-5 py-14">
        <div className="w-full max-w-[520px]">
          <div className="card overflow-hidden shadow-[0_36px_80px_-50px_rgba(2,43,47,0.6)]">
            <div className="px-8 py-9">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#fff5f5] text-[#d1434d]">
                <AlertTriangle size={26} strokeWidth={2} aria-hidden="true" />
              </span>

              <h1 className="mt-6 font-display text-[26px] leading-tight font-extrabold tracking-[-0.03em] text-ink">
                Something went wrong
              </h1>
              <p className="mt-2.5 text-[14.5px] leading-relaxed text-ink-soft">
                {scope === 'this page'
                  ? 'An unexpected error stopped this page from loading.'
                  : `An unexpected error stopped ${scope} from loading.`}{' '}
                You can try reloading, or head back to the home page.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={this.handleReload}
                  className="btn-primary inline-flex items-center justify-center gap-2"
                >
                  <RefreshCw size={15} strokeWidth={2.4} aria-hidden="true" />
                  Reload the page
                </button>
                <button
                  type="button"
                  onClick={this.handleGoHome}
                  className="btn-outline inline-flex items-center justify-center gap-2"
                >
                  <Home size={15} strokeWidth={2.4} aria-hidden="true" />
                  Back to home
                </button>
              </div>

              {/* Collapsed technical detail — useful when reporting the issue. */}
              <details className="mt-7 rounded-2xl border border-line bg-canvas px-4 py-3">
                <summary className="cursor-pointer text-[12.5px] font-extrabold tracking-[0.06em] text-ink-mute uppercase select-none">
                  Technical details
                </summary>
                <pre className="mt-3 overflow-x-auto text-[12px] leading-relaxed whitespace-pre-wrap text-ink-soft">
                  {error.message || String(error)}
                </pre>
              </details>
            </div>
          </div>

          <p className="mt-5 text-center text-[13px] text-ink-mute">
            Cynbit Technologies — frontend prototype
          </p>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
