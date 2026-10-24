'use client';

import type { ReactNode } from 'react';
import { useI18n } from '@/components/providers/I18nProvider';
import { Money } from '@/components/ui/Price';
import type { CartTotals } from '@/lib/cart-totals';
import { cn } from '@/lib/utils';

export function OrderSummary({ totals, children, className }: { totals: CartTotals; children?: ReactNode; className?: string }) {
  const { t } = useI18n();

  return (
    <section aria-labelledby="order-summary" className={cn('rounded bg-canvas-soft p-6', className)}>
      <h2 id="order-summary" className="text-lg font-semibold">
        {t('cart.orderSummary')}
      </h2>
      <dl className="mt-5 space-y-3 text-sm">
        <div className="flex justify-between">
          <dt>
            {t('cart.subtotal')} <span className="text-ink-muted">({t('cart.items', { count: totals.itemCount })})</span>
          </dt>
          <dd>
            <Money amount={totals.subtotal} />
          </dd>
        </div>
        {totals.discount > 0 && (
          <div className="flex justify-between text-accent">
            <dt>{t('cart.discount')}</dt>
            <dd>
              −<Money amount={totals.discount} />
            </dd>
          </div>
        )}
        <div className="flex justify-between">
          <dt>{t('cart.shipping')}</dt>
          <dd>
            {totals.shipping === null ? (
              totals.qualifiesForFreeShipping ? (
                t('cart.free')
              ) : (
                <span className="text-ink-muted">{t('cart.shippingCalculated')}</span>
              )
            ) : totals.shipping === 0 ? (
              t('cart.free')
            ) : (
              <Money amount={totals.shipping} />
            )}
          </dd>
        </div>
        <div className="flex justify-between border-t border-line pt-4 text-base font-semibold">
          <dt>{t('cart.total')}</dt>
          <dd>
            <Money amount={totals.total} />
          </dd>
        </div>
      </dl>
      <p className="mt-2 text-xs text-ink-muted">{t('cart.taxNote')}</p>
      {children && <div className="mt-6 space-y-4">{children}</div>}
    </section>
  );
}
