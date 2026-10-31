import { useState } from 'react';
import { AlertTriangle, Check, Loader2, RotateCcw } from 'lucide-react';

import type { ReviewSectionSettings } from '../../types';
import { useSettings } from '../../hooks/useSettings';
import reviewService from '../../services/reviewService';
import clientReviewService from '../../services/clientReviewService';
import settingsService from '../../services/settingsService';
import Button from '../ui/Button';
import { cn } from '../../utils/cn';

interface SettingRowProps {
  title: string;
  description: string;
  checked: boolean;
  busy: boolean;
  onChange: (checked: boolean) => void;
}

/** Accessible switch row — flips a section setting immediately on click. */
function SettingRow({ title, description, checked, busy, onChange }: SettingRowProps) {
  return (
    <div className="flex items-start justify-between gap-6 border-b border-line px-6 py-5 last:border-b-0">
      <div className="min-w-0">
        <p className="font-display text-[15.5px] font-extrabold text-ink">{title}</p>
        <p className="mt-1 max-w-xl text-[13.5px] leading-relaxed text-ink-soft">{description}</p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={title}
        disabled={busy}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative mt-0.5 inline-flex h-7 w-[52px] shrink-0 items-center rounded-full border transition-colors disabled:opacity-60',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600',
          checked ? 'border-brand-600 bg-brand-600' : 'border-line-strong bg-line',
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            'inline-flex h-5 w-5 items-center justify-center rounded-full bg-white shadow transition-transform',
            checked ? 'translate-x-[26px]' : 'translate-x-[3px]',
          )}
        >
          {busy ? (
            <Loader2 size={11} className="animate-spin text-ink-mute" />
          ) : checked ? (
            <Check size={11} strokeWidth={3} className="text-brand-700" />
          ) : null}
        </span>
      </button>
    </div>
  );
}

/**
 * Admin: section settings.
 * Controls which review sections the public site renders and whether new
 * submissions are moderated before publishing, plus a prototype data reset.
 */
export function AdminSettingsPanel() {
  const { settings, saving, error, updateSettings } = useSettings();
  const [resetArmed, setResetArmed] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  const handleReset = async () => {
    setResetting(true);
    try {
      reviewService.resetReviews();
      clientReviewService.resetClientReviews();
      await settingsService.resetSettings();
      setResetDone(true);
      window.setTimeout(() => setResetDone(false), 4000);
    } finally {
      setResetting(false);
      setResetArmed(false);
    }
  };

  const rows: Array<{
    key: keyof ReviewSectionSettings;
    title: string;
    description: string;
  }> = [
    {
      key: 'productReviewsEnabled',
      title: 'Product reviews & ratings (Products page)',
      description:
        'Show the per-product review sections — average stars, 5→1 distribution, review list and the “Write a review” form — on the Products page.',
    },
    {
      key: 'clientReviewsEnabled',
      title: 'Client reviews of Cynbit (Home page)',
      description:
        'Show the client reviews section on the Home page with the company’s overall average rating and approved customer reviews.',
    },
    {
      key: 'autoApproveSubmissions',
      title: 'Auto-approve new submissions',
      description:
        'When off (recommended), public review submissions are held as “pending” and only appear after you approve them in the moderation tab. When on, they publish immediately — handy for demos.',
    },
  ];

  return (
    <div className="grid gap-6">
      {error && (
        <div role="alert" className="flex items-start gap-3 rounded-2xl border border-[#f3c2c6] bg-[#fffafa] px-4 py-3.5">
          <AlertTriangle size={18} className="mt-0.5 shrink-0 text-[#d1434d]" />
          <p className="text-[13.5px] leading-relaxed font-semibold text-[#a32b34]">{error}</p>
        </div>
      )}

      <section className="card overflow-hidden">
        <header className="border-b border-line px-6 py-5">
          <h3 className="font-display text-[17px] font-extrabold text-ink">Public site sections</h3>
          <p className="mt-1 text-[13.5px] text-ink-soft">
            Changes apply immediately across the public pages — no reload needed.
          </p>
        </header>

        {rows.map((row) => (
          <SettingRow
            key={row.key}
            title={row.title}
            description={row.description}
            checked={settings[row.key]}
            busy={saving}
            onChange={(checked) => void updateSettings({ [row.key]: checked })}
          />
        ))}
      </section>

      <p aria-live="polite" className="min-h-5 text-[13px] font-bold text-brand-700">
        {saving ? 'Saving…' : resetDone ? 'Prototype data reset.' : ''}
      </p>

      <section className="card overflow-hidden border-[#f3c2c6]">
        <header className="border-b border-[#f3c2c6] bg-[#fffafa] px-6 py-5">
          <h3 className="font-display text-[17px] font-extrabold text-[#a32b34]">Reset prototype data</h3>
          <p className="mt-1 max-w-2xl text-[13.5px] leading-relaxed text-[#a32b34]/90">
            Deletes every locally stored product review and client review (all statuses) and
            restores the default section settings. This cannot be undone, but nothing real is lost —
            the prototype ships with empty datasets anyway.
          </p>
        </header>
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-5">
          <p className="text-[13px] text-ink-mute">
            Stored locally in this browser (localStorage).
          </p>
          {resetArmed ? (
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => setResetArmed(false)} disabled={resetting}>
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={resetting}
                onClick={() => void handleReset()}
                className="!bg-[#d1434d] hover:!bg-[#a32b34]"
              >
                {resetting ? 'Resetting…' : 'Yes, delete everything'}
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setResetArmed(true)}
              icon={<RotateCcw size={14} strokeWidth={2.2} />}
            >
              Reset all data
            </Button>
          )}
        </div>
      </section>
    </div>
  );
}

export default AdminSettingsPanel;
