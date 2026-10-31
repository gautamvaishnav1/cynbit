import { useMemo, useRef, useState } from 'react';
import { MessageSquare, SlidersHorizontal, Star } from 'lucide-react';

import { useAllReviews } from '../hooks/useReviews';
import { useAllClientReviews } from '../hooks/useClientReviews';
import { computeClientRatingSummary, formatAverage } from '../utils/rating';
import AdminProductReviews from '../components/admin/AdminProductReviews';
import AdminClientReviews from '../components/admin/AdminClientReviews';
import AdminSettingsPanel from '../components/admin/AdminSettingsPanel';
import { cn } from '../utils/cn';

type TabId = 'product' | 'client' | 'settings';

const TABS: Array<{ id: TabId; label: string; icon: typeof MessageSquare }> = [
  { id: 'product', label: 'Product reviews', icon: MessageSquare },
  { id: 'client', label: 'Client reviews', icon: Star },
  { id: 'settings', label: 'Section settings', icon: SlidersHorizontal },
];

/* ------------------------------- stats ------------------------------- */

function StatCard({
  label,
  value,
  sub,
  tone = 'brand',
}: {
  label: string;
  value: string;
  sub: string;
  tone?: 'brand' | 'sand' | 'ink';
}) {
  return (
    <div className="card p-6">
      <p className="text-[10.5px] font-extrabold tracking-[0.14em] text-ink-mute uppercase">
        {label}
      </p>
      <p
        className={cn(
          'mt-2 font-display text-[30px] leading-none font-extrabold tabular-nums',
          tone === 'brand' && 'text-brand-600',
          tone === 'sand' && 'text-sand-600',
          tone === 'ink' && 'text-ink',
        )}
      >
        {value}
      </p>
      <p className="mt-2 text-[12.5px] text-ink-mute">{sub}</p>
    </div>
  );
}

/* ------------------------------ dashboard ----------------------------- */

/**
 * Review admin dashboard: moderation for product & client reviews plus
 * the section settings that decide what the public site shows.
 */
export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<TabId>('product');
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const { reviews } = useAllReviews();
  const { reviews: clientReviews } = useAllClientReviews();

  const stats = useMemo(() => {
    const pending =
      reviews.filter((review) => review.status === 'pending').length +
      clientReviews.filter((review) => review.status === 'pending').length;
    const publishedProducts = reviews.filter((review) => review.status === 'approved').length;
    const publishedClients = clientReviews.filter((review) => review.status === 'approved').length;
    const companySummary = computeClientRatingSummary(clientReviews);

    return { pending, publishedProducts, publishedClients, companySummary };
  }, [reviews, clientReviews]);

  const handleTabKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex: number | null = null;
    if (event.key === 'ArrowRight') nextIndex = (index + 1) % TABS.length;
    if (event.key === 'ArrowLeft') nextIndex = (index - 1 + TABS.length) % TABS.length;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = TABS.length - 1;
    if (nextIndex === null) return;

    event.preventDefault();
    const nextTab = TABS[nextIndex];
    setActiveTab(nextTab.id);
    tabRefs.current[nextIndex]?.focus();
  };

  return (
    <div className="mx-auto max-w-[1240px] px-5 py-10 sm:px-8">
      {/* Page head */}
      <p className="eyebrow">
        <span className="eyebrow-dot" aria-hidden="true" />
        Reviews & ratings
      </p>
      <h1 className="mt-6 font-display text-[clamp(1.9rem,4.4vw,2.8rem)] leading-[1.05] font-extrabold tracking-[-0.04em] text-ink">
        Review admin panel
      </h1>
      <p className="mt-3 max-w-2xl text-[15.5px] leading-relaxed text-ink-soft">
        Moderate product reviews, manage the client reviews shown on the Home page, and control
        which review sections the public site displays. Only approved reviews appear publicly.
      </p>

      {/* Stat cards */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Awaiting moderation"
          value={String(stats.pending)}
          sub={stats.pending === 0 ? 'Nothing in the queue' : 'Review them in the tabs below'}
          tone={stats.pending > 0 ? 'sand' : 'ink'}
        />
        <StatCard
          label="Published product reviews"
          value={String(stats.publishedProducts)}
          sub="Visible on the Products page"
        />
        <StatCard
          label="Published client reviews"
          value={String(stats.publishedClients)}
          sub="Visible in the Home page section"
        />
        <StatCard
          label="Company rating"
          value={
            stats.companySummary.totalReviews > 0
              ? `${formatAverage(stats.companySummary.averageRating, stats.companySummary.totalReviews)}★`
              : '—'
          }
          sub={
            stats.companySummary.totalReviews > 0
              ? `From ${stats.companySummary.totalReviews} approved client ${
                  stats.companySummary.totalReviews === 1 ? 'review' : 'reviews'
                }`
              : 'No approved client reviews yet'
          }
        />
      </div>

      {/* Tabs */}
      <div
        role="tablist"
        aria-label="Admin sections"
        className="mt-10 flex flex-wrap gap-2 border-b border-line"
      >
        {TABS.map((tab, index) => {
          const isActive = tab.id === activeTab;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              ref={(node) => {
                tabRefs.current[index] = node;
              }}
              type="button"
              role="tab"
              id={`admin-tab-${tab.id}`}
              aria-selected={isActive}
              aria-controls={`admin-panel-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setActiveTab(tab.id)}
              onKeyDown={(event) => handleTabKeyDown(event, index)}
              className={cn(
                '-mb-px inline-flex items-center gap-2 border-b-2 px-5 py-3.5 text-[13.5px] font-extrabold transition-colors',
                isActive
                  ? 'border-brand-600 text-brand-700'
                  : 'border-transparent text-ink-mute hover:text-ink',
              )}
            >
              <Icon size={15} strokeWidth={2.2} aria-hidden="true" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Panels */}
      <div className="mt-8">
        <div
          role="tabpanel"
          id="admin-panel-product"
          aria-labelledby="admin-tab-product"
          hidden={activeTab !== 'product'}
        >
          {activeTab === 'product' && <AdminProductReviews />}
        </div>
        <div
          role="tabpanel"
          id="admin-panel-client"
          aria-labelledby="admin-tab-client"
          hidden={activeTab !== 'client'}
        >
          {activeTab === 'client' && <AdminClientReviews />}
        </div>
        <div
          role="tabpanel"
          id="admin-panel-settings"
          aria-labelledby="admin-tab-settings"
          hidden={activeTab !== 'settings'}
        >
          {activeTab === 'settings' && <AdminSettingsPanel />}
        </div>
      </div>
    </div>
  );
}
