'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useI18n } from '@/components/providers/I18nProvider';
import { Rating } from '@/components/ui/Rating';
import { formatNumber } from '@/lib/format';
import type { Brand, Product } from '@/lib/types';
import { useRecentlyViewed } from '@/store/recently-viewed';
import { ProductBadges } from './ProductBadges';
import { ProductGallery } from './ProductGallery';
import { PurchasePanel } from './PurchasePanel';

/** Gallery + buy box. Selecting a shade swaps the main image. */
export function ProductHero({ product, brand }: { product: Product; brand: Brand }) {
  const { t, l, href, locale } = useI18n();
  const track = useRecentlyViewed((state) => state.track);
  const [imageIndex, setImageIndex] = useState(product.shades[0]?.imageIndex ?? 0);
  // `?shade=` deep links (e.g. from the basket) are read after mount so the page stays statically generated.
  const [initialShade, setInitialShade] = useState<string | null>(null);

  useEffect(() => {
    track(product.id);
    const shadeId = new URLSearchParams(window.location.search).get('shade');
    const shade = product.shades.find((item) => item.id === shadeId);
    if (shade) {
      setInitialShade(shade.id);
      setImageIndex(shade.imageIndex);
    }
  }, [product, track]);

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-14">
      <div className="lg:sticky lg:top-40 lg:self-start">
        <ProductGallery images={product.images} name={l(product.name)} activeIndex={imageIndex} onSelect={setImageIndex} />
      </div>

      <div>
        <ProductBadges product={product} className="mb-4 flex-row" />
        <Link href={href(`/brands/${brand.slug}`)} className="eyebrow hover:text-ink">
          {brand.name}
        </Link>
        <h1 className="mt-2 text-2xl font-semibold leading-tight tracking-tight md:text-3xl">{l(product.name)}</h1>
        <a href="#reviews" className="mt-3 inline-flex hover:opacity-80">
          <Rating
            value={product.rating}
            size="md"
            label={t('product.ratingLabel', { rating: product.rating })}
            count={`${product.rating.toFixed(1)} · ${t('product.reviewCount', { count: formatNumber(product.reviewCount, locale) })}`}
          />
        </a>
        <p className="mt-5 text-sm leading-relaxed text-ink-soft">{l(product.description)}</p>

        <div className="mt-6 border-t border-line pt-6">
          <PurchasePanel
            key={initialShade ?? 'default'}
            product={product}
            brandName={brand.name}
            initialShadeId={initialShade}
            onShadeChange={(shade) => setImageIndex(shade.imageIndex)}
          />
        </div>
      </div>
    </div>
  );
}
