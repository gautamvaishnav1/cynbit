import { Fragment } from 'react';

import Icon from '../components/ui/Icon';
import { products } from '../data/products';
import ProductCard from '../components/ProductCard';
import ProductDetails from '../components/ProductDetails';
import ProductReviewSection from '../components/review/ProductReviewSection';
import DemoRequestSection from '../components/DemoRequestSection';
import CtaBanner from '../components/CtaBanner';
import { useSettings } from '../hooks/useSettings';

/**
 * Products page — priority page for this prototype.
 *
 * Layout mirrors the public cynbit.in/products structure: flagship index
 * strip, one block per product, and the "Schedule a Demo" inquiry section.
 *
 * NEW FEATURE: a product-specific reviews & ratings section is attached to
 * every product block. The sections can be hidden from the admin panel's
 * Section settings tab.
 */
export default function ProductsPage() {
  const { settings } = useSettings();

  return (
    <>
      {/* Page hero */}
      <section className="relative overflow-hidden border-b border-line bg-canvas">
        <span
          className="absolute inset-0 dot-grid opacity-60 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]"
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-[1240px] px-5 pt-16 pb-14 sm:px-8 lg:pt-20 lg:pb-16">
          <p className="eyebrow">
            <Icon name="inventory_2" size={15} className="text-brand-700" />
            Proprietary software suite
          </p>

          <h1 className="mt-6 max-w-4xl font-display text-[clamp(2.3rem,6vw,4.25rem)] leading-[1.02] font-extrabold tracking-[-0.045em] text-ink">
            The Cynbit Product{' '}
            <span className="text-brand-600">Ecosystem</span>
          </h1>

          <p className="mt-6 max-w-2xl text-[17px] leading-relaxed text-ink-soft">
            We build specialized SaaS ecosystems and AI-powered platforms designed to bridge the
            gap between individual potential and enterprise excellence.
          </p>

          {/* Anchor tabs */}
          <nav aria-label="Jump to product" className="mt-9 flex flex-wrap gap-2.5">
            {products.map((product) => (
              <a
                key={product.id}
                href={`#${product.id}`}
                className="group inline-flex items-center gap-2 rounded-full border border-line bg-surface px-5 py-3 text-[14px] font-extrabold text-ink transition-all hover:border-brand-600 hover:bg-brand-600 hover:text-white"
              >
                {product.name}
                <span
                  aria-hidden="true"
                  className="text-brand-600 transition-colors group-hover:text-white"
                >
                  ↓
                </span>
              </a>
            ))}
          </nav>
        </div>
      </section>

      {/* Flagship index cards */}
      <section className="border-b border-line bg-surface" aria-label="Flagship products">
        <div className="mx-auto grid max-w-[1240px] gap-5 px-5 py-10 sm:grid-cols-3 sm:px-8">
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index + 1} />
          ))}
        </div>
      </section>

      {/* Product blocks — each followed by its own review section (admin-toggleable) */}
      {products.map((product) => (
        <Fragment key={product.id}>
          <ProductDetails product={product} />
          {settings.productReviewsEnabled && <ProductReviewSection product={product} />}
        </Fragment>
      ))}

      <DemoRequestSection />

      <CtaBanner
        title={
          <>
            Ready to architect
            <br />
            your digital future?
          </>
        }
        description="Bring us the hard problem — our architects will map the platform, the automation and the roadmap."
        primary={{ label: 'Start discovery phase', to: '/contact' }}
        secondary={{ label: 'Speak to an architect', href: 'tel:+918947962667' }}
      />
    </>
  );
}
