'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useI18n } from '@/components/providers/I18nProvider';
import { Price } from '@/components/ui/Price';
import { Rating } from '@/components/ui/Rating';
import { SmartImage } from '@/components/ui/SmartImage';
import { formatNumber } from '@/lib/format';
import type { Product } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useUi } from '@/store/ui';
import { ProductBadges } from './ProductBadges';
import { WishlistButton } from './WishlistButton';

const MAX_SWATCHES = 5;

interface ProductCardProps {
  product: Product;
  brandName: string;
  priority?: boolean;
  sizes?: string;
}

export function ProductCard({
  product,
  brandName,
  priority,
  sizes = '(min-width: 1280px) 20vw, (min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw',
}: ProductCardProps) {
  const { t, l, href, locale } = useI18n();
  const openQuickLook = useUi((state) => state.openQuickLook);
  const [imageIndex, setImageIndex] = useState(0);
  const name = l(product.name);
  const url = href(`/p/${product.slug}`);
  const hoverImage = product.images[1] ?? product.images[0];
  const extraShades = product.shades.length - MAX_SWATCHES;

  return (
    <article className="group relative flex h-full flex-col">
      <div className="relative aspect-[4/5] overflow-hidden rounded bg-canvas-muted">
        <Link href={url} tabIndex={-1} aria-hidden className="absolute inset-0">
          <SmartImage
            src={product.images[imageIndex]}
            alt=""
            fill
            sizes={sizes}
            priority={priority}
            className="object-cover transition-transform duration-700 ease-luxe group-hover:scale-[1.03]"
          />
          {imageIndex === 0 && hoverImage !== product.images[0] && (
            <SmartImage
              src={hoverImage}
              alt=""
              fill
              sizes={sizes}
              loading="lazy"
              className="object-cover !opacity-0 transition-opacity duration-500 ease-luxe group-hover:!opacity-100"
            />
          )}
        </Link>

        <ProductBadges product={product} className="pointer-events-none absolute start-2.5 top-2.5" />
        <WishlistButton productId={product.id} productName={name} className="absolute end-2.5 top-2.5 z-10" />

        <button
          type="button"
          onClick={() => openQuickLook(product, brandName)}
          aria-label={t('product.quickLookOf', { name })}
          className="absolute inset-x-2.5 bottom-2.5 z-10 hidden h-10 translate-y-2 items-center justify-center rounded bg-canvas/95 text-xs font-semibold opacity-0 shadow-sm backdrop-blur transition-all duration-300 ease-luxe hover:bg-ink hover:text-canvas focus-visible:translate-y-0 focus-visible:opacity-100 group-hover:translate-y-0 group-hover:opacity-100 md:flex"
        >
          {t('product.quickLook')}
        </button>
      </div>

      <div className="flex flex-1 flex-col pt-3">
        <p className="text-2xs font-semibold uppercase tracking-wider text-ink-muted">{brandName}</p>
        <h3 className="mt-1 line-clamp-2 text-sm leading-snug">
          <Link href={url} className="after:absolute after:inset-0 after:content-[''] hover:underline focus-visible:outline-none">
            {name}
          </Link>
        </h3>
        <Rating
          value={product.rating}
          label={t('product.ratingLabel', { rating: product.rating })}
          count={`(${formatNumber(product.reviewCount, locale)})`}
          className="mt-1.5"
        />
        <Price price={product.price} salePrice={product.salePrice} className="mt-1.5" />

        {product.shades.length > 1 && (
          <div className="relative z-10 mt-2.5 flex items-center gap-1.5">
            {product.shades.slice(0, MAX_SWATCHES).map((shade) => (
              <button
                key={shade.id}
                type="button"
                onMouseEnter={() => setImageIndex(shade.imageIndex)}
                onFocus={() => setImageIndex(shade.imageIndex)}
                onMouseLeave={() => setImageIndex(0)}
                onBlur={() => setImageIndex(0)}
                aria-label={l(shade.name)}
                title={l(shade.name)}
                className={cn(
                  'size-4 rounded-full border border-black/10 ring-offset-2 transition-shadow hover:ring-1 hover:ring-ink',
                )}
                style={{ backgroundColor: shade.hex }}
              />
            ))}
            {extraShades > 0 && <span className="text-2xs text-ink-muted">+{extraShades}</span>}
          </div>
        )}
      </div>
    </article>
  );
}
