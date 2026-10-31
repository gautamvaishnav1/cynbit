import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ArrowUpRight, ChevronDown, Menu, X } from 'lucide-react';

import { navGroups } from '../data/site';
import type { NavChild } from '../types';
import { cn } from '../utils/cn';
import Logo from './Logo';
import Icon from './ui/Icon';
import Button from './ui/Button';

const DIRECT_LINKS = [
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/contact' },
];

function navLinkClass({ isActive }: { isActive: boolean }) {
  return cn(
    'rounded-full px-3.5 py-2 text-[13.5px] font-bold tracking-[0.01em] transition-colors',
    isActive ? 'text-brand-700' : 'text-ink-soft hover:text-ink',
  );
}

function MenuPanelItem({ item }: { item: NavChild }) {
  return (
    <NavLink
      to={item.href}
      className="group flex items-start gap-3 rounded-2xl px-3 py-3 transition-colors hover:bg-brand-50"
    >
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700 transition-colors group-hover:bg-brand-600 group-hover:text-white">
        <Icon name={item.icon} size={17} />
      </span>
      <span className="min-w-0">
        <span className="block text-[14px] font-extrabold text-ink">{item.label}</span>
        <span className="block truncate text-[12.5px] text-ink-mute">{item.description}</span>
      </span>
    </NavLink>
  );
}

/**
 * Site header: sticky translucent bar, desktop mega-dropdowns (xl+), and a
 * full navigation drawer for smaller viewports.
 */
export default function Header() {
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerGroup, setDrawerGroup] = useState<string | null>(navGroups[0].label);

  const headerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const location = useLocation();

  // Any navigation closes every open surface.
  useEffect(() => {
    setOpenGroup(null);
    setDrawerOpen(false);
  }, [location.pathname]);

  // Escape closes surfaces; outside clicks close the desktop dropdown.
  useEffect(() => {
    if (!openGroup && !drawerOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (openGroup) {
        setOpenGroup(null);
        menuButtonRef.current?.focus();
      }
      setDrawerOpen(false);
    };

    const onPointerDown = (event: MouseEvent) => {
      if (!openGroup) return;
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setOpenGroup(null);
      }
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('mousedown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('mousedown', onPointerDown);
    };
  }, [openGroup, drawerOpen]);

  // Prevent background scroll while the drawer is open.
  useEffect(() => {
    if (!drawerOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [drawerOpen]);

  const toggleGroup = (label: string) => {
    setOpenGroup((current) => (current === label ? null : label));
  };

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-50 border-b border-line/90 bg-canvas/88 backdrop-blur-md"
    >
      <div className="mx-auto flex h-[74px] max-w-[1240px] items-center justify-between gap-6 px-5 sm:px-8">
        <Link to="/" aria-label="Cynbit Technologies — home" className="shrink-0">
          <Logo />
        </Link>

        {/* Desktop navigation (xl and up) */}
        <nav aria-label="Primary" className="hidden items-center gap-1 xl:flex">
          {navGroups.map((group) => {
            const isOpen = openGroup === group.label;
            const triggerId = `nav-trigger-${group.label.toLowerCase()}`;
            const panelId = `nav-panel-${group.label.toLowerCase()}`;
            return (
              <div
                key={group.label}
                className="relative"
                onMouseEnter={() => setOpenGroup(group.label)}
                onMouseLeave={() => setOpenGroup(null)}
              >
                <button
                  id={triggerId}
                  type="button"
                  className={cn(
                    'flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[13.5px] font-bold transition-colors',
                    isOpen ? 'text-brand-700' : 'text-ink-soft hover:text-ink',
                  )}
                  aria-expanded={isOpen}
                  aria-haspopup="true"
                  aria-controls={panelId}
                  onClick={() => toggleGroup(group.label)}
                  onKeyDown={(event) => {
                    if (event.key === 'Escape') setOpenGroup(null);
                  }}
                >
                  {group.label}
                  <ChevronDown
                    size={14}
                    strokeWidth={2.4}
                    className={cn('transition-transform', isOpen && 'rotate-180')}
                  />
                </button>

                <div
                  id={panelId}
                  role="group"
                  aria-label={group.label}
                  className={cn(
                    'absolute top-full left-1/2 w-[330px] -translate-x-1/2 pt-3 transition-all',
                    isOpen ? 'visible opacity-100' : 'invisible opacity-0',
                  )}
                >
                  <div className="card p-2.5 shadow-[0_24px_60px_-24px_rgba(2,43,47,0.35)]">
                    {group.children?.map((child) => (
                      <MenuPanelItem key={child.href + child.label} item={child} />
                    ))}
                  </div>
                </div>
              </div>
            );
          })}

          {DIRECT_LINKS.map((link) => (
            <NavLink key={link.href} to={link.href} className={navLinkClass}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Button to="/contact" className="hidden sm:inline-flex">
            Join Us
          </Button>

          <button
            ref={menuButtonRef}
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-line/70 text-ink transition-colors hover:bg-line xl:hidden"
            aria-expanded={drawerOpen}
            aria-controls="site-navigation-drawer"
            aria-label={drawerOpen ? 'Close navigation menu' : 'Open navigation menu'}
            onClick={() => setDrawerOpen((open) => !open)}
          >
            {drawerOpen ? <X size={20} strokeWidth={2.2} /> : <Menu size={20} strokeWidth={2.2} />}
          </button>
        </div>
      </div>

      {/* Navigation drawer for tablet & mobile */}
      <div
        id="site-navigation-drawer"
        className={cn(
          'overflow-y-auto border-t border-line bg-canvas xl:hidden',
          drawerOpen ? 'max-h-[calc(100dvh-74px)]' : 'hidden',
        )}
      >
        <nav aria-label="Mobile" className="mx-auto max-w-[1240px] px-5 py-6 sm:px-8">
          <div className="flex flex-col gap-6">
            {navGroups.map((group) => {
              const isOpen = drawerGroup === group.label;
              return (
                <section key={group.label}>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between rounded-xl py-2 text-left font-display text-[17px] font-extrabold text-ink"
                    aria-expanded={isOpen}
                    aria-controls={`drawer-${group.label.toLowerCase()}`}
                    onClick={() =>
                      setDrawerGroup((current) => (current === group.label ? null : group.label))
                    }
                  >
                    {group.label}
                    <ChevronDown
                      size={17}
                      strokeWidth={2.4}
                      className={cn('transition-transform', isOpen && 'rotate-180')}
                    />
                  </button>
                  <div
                    id={`drawer-${group.label.toLowerCase()}`}
                    className={cn('mt-1.5 grid gap-1', !isOpen && 'hidden')}
                  >
                    {group.children?.map((child) => (
                      <MenuPanelItem key={child.href + child.label} item={child} />
                    ))}
                  </div>
                </section>
              );
            })}

            <div className="flex flex-col gap-2 border-t border-line pt-5">
              {DIRECT_LINKS.map((link) => (
                <NavLink
                  key={link.href}
                  to={link.href}
                  className="flex items-center justify-between rounded-xl px-3 py-3 font-display text-[17px] font-extrabold text-ink transition-colors hover:bg-brand-50"
                >
                  {link.label}
                  <ArrowUpRight size={18} strokeWidth={2.2} className="text-brand-600" />
                </NavLink>
              ))}
            </div>

            <Button to="/contact" className="w-full">
              Join Us
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
}

