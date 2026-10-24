'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useI18n } from '@/components/providers/I18nProvider';
import { Dialog } from '@/components/ui/Dialog';
import { Rating } from '@/components/ui/Rating';
import { SmartImage } from '@/components/ui/SmartImage';
import { formatNumber } from '@/lib/format';
import type { Product } from '@/lib/types';
import { useUi } from '@/store/ui';
import { PurchasePanel } from './PurchasePanel';

/** Single Quick Look modal mounted once in the layout and driven by the UI store. */
export function QuickLook() {
  const { t, l } = useI18n();
  const quickLook = useUi((state) => state.quickLook);
  const close = useUi((state) => state.closeQuickLook);

  return (
    <Dialog
      open={!!quickLook}
      onClose={close}
      title={quickLook ? t('product.quickLookOf', { name: l(quickLook.product.name) }) : ''}
      hideHeader
      className="max-w-4xl"
    >
      {quickLook && <QuickLookBody key={quickLook.product.id} product={quickLook.product} brandName={quickLook.brandName} onNavigate={close} />}
    </Dialog>
  );
}

function QuickLookBody({ product, brandName, onNavigate }: { product: Product; brandName: string; onNavigate: () => void }) {
  const { t, l, href, locale } = useI18n();
  const [imageIndex, setImageIndex] = useState(product.shades[0]?.imageIndex ?? 0);
  const name = l(product.name);

  return (
    <div className="grid md:grid-cols-2">
      <div className="relative aspect-square bg-canvas-muted md:aspect-auto md:min-h-[520px]">
        <SmartImage src={product.images[imageIndex]} alt={name} fill sizes="(min-width: 768px) 448px, 100vw" className="object-cover" />
      </div>
      <div className="space-y-5 p-6 md:p-8">
        <div>
          <p className="eyebrow">{brandName}</p>
          <p className="mt-2 text-xl font-semibold leading-snug">{name}</p>
          <Rating
            value={product.rating}
            label={t('product.ratingLabel', { rating: product.rating })}
            count={t('product.reviewCount', { count: formatNumber(product.reviewCount, locale) })}
            className="mt-2"
          />
        </div>
        <PurchasePanel product={product} brandName={brandName} onShadeChange={(shade) => setImageIndex(shade.imageIndex)} compact />
        <Link href={href(`/p/${product.slug}`)} onClick={onNavigate} className="inline-block text-sm font-semibold link-underline">
          {t('product.viewDetails')}
        </Link>
      </div>
    </div>
  );
}
