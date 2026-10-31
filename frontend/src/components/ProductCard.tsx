import { ArrowUpRight } from 'lucide-react';

import type { Product } from '../types';
import { cn } from '../utils/cn';
import Icon from './ui/Icon';

const ACCENT_TILE: Record<Product['accent'], string> = {
  brand: 'bg-gradient-to-br from-brand-600 to-brand-400 text-white',
  sand: 'bg-gradient-to-br from-sand-500 to-sand-300 text-[#3d2609]',
  ink: 'bg-gradient-to-br from-brand-900 to-brand-600 text-white',
};

const ACCENT_RULE: Record<Product['accent'], string> = {
  brand: 'bg-brand-600',
  sand: 'bg-sand-500',
  ink: 'bg-brand-800',
};

interface ProductCardProps {
  product: Product;
  /** Index shown on the flagship card, e.g. 01. */
  index?: number;
}

/** Anchor card used in the flagship strip near the top of the Products page. */
export default function ProductCard({ product, index }: ProductCardProps) {
  return (
    <a
      href={`#${product.id}`}
      className="group card relative overflow-hidden p-6 transition-all hover:-translate-y-1 hover:border-brand-300 hover:shadow-[0_28px_60px_-38px_rgba(2,43,47,0.65)]"
    >
      <span
        className={cn('absolute inset-x-0 top-0 h-1 transition-all group-hover:h-1.5', ACCENT_RULE[product.accent])}
        aria-hidden="true"
      />

      <div className="flex items-start justify-between gap-4">
        <span
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-2xl',
            ACCENT_TILE[product.accent],
          )}
          aria-hidden="true"
        >
          <Icon name={product.icon} size={22} />
        </span>

        <span className="text-[11px] font-extrabold tracking-[0.14em] text-ink-mute uppercase">
          {index !== undefined ? String(index).padStart(2, '0') : ''}
        </span>
      </div>

      <p className="mt-5 text-[11px] font-extrabold tracking-[0.16em] text-ink-soft uppercase">
        {product.flag}
      </p>

      <p className="mt-2 flex items-center gap-2 font-display text-[21px] leading-tight font-extrabold tracking-[-0.02em] text-ink">
        {product.name}
        <ArrowUpRight
          size={19}
          strokeWidth={2.4}
          className="text-brand-600 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        />
      </p>

      <p className="mt-2.5 line-clamp-2 text-[14px] leading-relaxed text-ink-mute">
        {product.summary}
      </p>
    </a>
  );
}
