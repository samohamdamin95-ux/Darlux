'use client';

import { Lock, ShoppingBag } from 'lucide-react';
import { useI18n } from '@/components/providers/I18nProvider';
import { ButtonLink } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { computeTotals } from '@/lib/cart-totals';
import { useCart } from '@/store/cart';
import { useHydrated } from '@/store/ui';
import { CartLineItem } from './CartLineItem';
import { FreeShippingBar } from './FreeShippingBar';
import { OrderSummary } from './OrderSummary';
import { PromoCodeField } from './PromoCodeField';

export function CartPageView() {
  const { t, href } = useI18n();
  const hydrated = useHydrated();
  const lines = useCart((state) => state.lines);
  const promoCode = useCart((state) => state.promoCode);
  const totals = computeTotals(lines, promoCode);

  if (!hydrated) {
    return (
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_380px]" aria-busy="true">
        <div className="space-y-6">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="size-24 md:size-32" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-9 w-28" />
              </div>
            </div>
          ))}
        </div>
        <Skeleton className="h-80" />
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="flex flex-col items-center rounded border border-dashed border-line-strong px-6 py-24 text-center">
        <ShoppingBag className="size-12 text-ink-subtle" aria-hidden />
        <h2 className="mt-5 text-xl font-semibold">{t('cart.empty')}</h2>
        <p className="mt-2 text-sm text-ink-muted">{t('cart.emptyText')}</p>
        <ButtonLink href={href('/c/new')} className="mt-8" size="lg">
          {t('cart.continueShopping')}
        </ButtonLink>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
      <div>
        <FreeShippingBar remaining={totals.remainingForFreeShipping} progress={totals.freeShippingProgress} className="rounded bg-canvas-soft p-4" />
        <ul className="divide-y divide-line border-b border-line">
          {lines.map((line) => (
            <CartLineItem key={line.key} line={line} />
          ))}
        </ul>
      </div>

      <OrderSummary totals={totals} className="lg:sticky lg:top-40">
        <PromoCodeField />
        <ButtonLink href={href('/checkout')} size="lg" className="w-full">
          <Lock className="size-4" aria-hidden />
          {t('cart.checkout')}
        </ButtonLink>
        <ButtonLink href={href('/c/new')} variant="ghost" className="w-full">
          {t('cart.continueShopping')}
        </ButtonLink>
      </OrderSummary>
    </div>
  );
}
