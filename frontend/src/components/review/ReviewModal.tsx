import { useEffect, useId, useRef, type ReactNode, type MouseEvent } from 'react';
import { createPortal } from 'react-dom';
import { Info, X } from 'lucide-react';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

interface ReviewModalProps {
  open: boolean;
  onClose: () => void;
  /** Dialog heading, referenced by aria-labelledby. */
  title: string;
  /** Optional sub-heading rendered under the title. */
  subtitle?: string;
  children: ReactNode;
}

/**
 * Review submission dialog.
 * Portalled to <body> with backdrop dismiss, Escape handling, focus trapping,
 * focus restoration and background scroll locking.
 */
export function ReviewModal({ open, onClose, title, subtitle, children }: ReviewModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);

  // Always call the latest callback without re-running the focus effect.
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return undefined;

    restoreFocusRef.current = document.activeElement as HTMLElement | null;

    const panel = panelRef.current;
    panel?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onCloseRef.current();
        return;
      }

      if (event.key !== 'Tab' || !panel) return;

      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (element) => element.offsetParent !== null,
      );
      if (items.length === 0) {
        event.preventDefault();
        return;
      }

      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && (active === first || active === panel)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
      restoreFocusRef.current?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  const handleBackdropClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) onClose();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[90] flex items-end justify-center overflow-y-auto bg-ink/45 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onMouseDown={handleBackdropClick}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="relative w-full max-w-2xl rounded-t-3xl bg-surface shadow-[0_40px_90px_-30px_rgba(2,43,47,0.55)] outline-none sm:rounded-3xl"
      >
        <header className="flex items-start justify-between gap-5 border-b border-line px-6 pt-6 pb-5 sm:px-8">
          <div className="min-w-0">
            <p className="eyebrow eyebrow-plain !pl-0">Customer review</p>
            <h2
              id={titleId}
              className="mt-2 font-display text-[clamp(1.35rem,3vw,1.7rem)] leading-tight font-extrabold tracking-[-0.02em] text-ink"
            >
              {title}
            </h2>
            {subtitle && <p className="mt-1.5 text-[14px] text-ink-soft">{subtitle}</p>}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close review dialog"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-canvas text-ink-soft transition-colors hover:bg-line hover:text-ink"
          >
            <X size={18} strokeWidth={2.2} />
          </button>
        </header>

        <div className="px-6 pt-5 pb-7 sm:px-8">
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-sand-300 bg-sand-100 px-4 py-3.5">
            <Info size={17} className="mt-0.5 shrink-0 text-sand-700" />
            <p className="text-[13px] leading-relaxed text-sand-700">
              {API_ENABLED ? (
                <>
                  <strong className="font-extrabold">Sent to the backend.</strong> Your review is
                  submitted to the Cynbit review API and stored server-side. It appears publicly
                  only after approval in the admin panel (unless auto-approve is enabled), and
                  your email is never shown publicly. No pre-filled or fake testimonials are used.
                </>
              ) : (
                <>
                  <strong className="font-extrabold">Prototype demonstration.</strong> This form
                  has no backend. Submitted reviews are kept in this browser only — they are not
                  sent to a server, database or Cynbit — and appear publicly only after approval
                  in the prototype admin panel (unless auto-approve is enabled). No real customer
                  testimonials are shown.
                </>
              )}
            </p>
          </div>

          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default ReviewModal;
