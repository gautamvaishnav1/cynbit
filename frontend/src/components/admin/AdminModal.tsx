import { useEffect, useId, useRef, type ReactNode, type MouseEvent } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

interface AdminModalProps {
  open: boolean;
  onClose: () => void;
  /** Small uppercase kicker rendered above the title. */
  eyebrow?: string;
  /** Dialog heading, referenced by aria-labelledby. */
  title: string;
  /** Optional sub-heading rendered under the title. */
  subtitle?: string;
  children: ReactNode;
}

/**
 * Generic admin dialog.
 * Portalled to <body> with backdrop dismiss, Escape handling, focus
 * trapping, focus restoration and background scroll locking.
 */
export function AdminModal({
  open,
  onClose,
  eyebrow = 'Admin',
  title,
  subtitle,
  children,
}: AdminModalProps) {
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
            <p className="eyebrow eyebrow-plain !pl-0">{eyebrow}</p>
            <h2
              id={titleId}
              className="mt-2 font-display text-[clamp(1.3rem,3vw,1.6rem)] leading-tight font-extrabold tracking-[-0.02em] text-ink"
            >
              {title}
            </h2>
            {subtitle && <p className="mt-1.5 text-[14px] text-ink-soft">{subtitle}</p>}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-canvas text-ink-soft transition-colors hover:bg-line hover:text-ink"
          >
            <X size={18} strokeWidth={2.2} />
          </button>
        </header>

        <div className="px-6 pt-5 pb-7 sm:px-8">{children}</div>
      </div>
    </div>,
    document.body,
  );
}

export default AdminModal;
