'use client';

import { ShoppingBag } from 'lucide-react';
import { useI18n } from '@/components/providers/I18nProvider';
import { ButtonLink } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { Money } from '@/components/ui/Price';
import { computeTotals } from '@/lib/cart-totals';
import { useCart } from '@/store/cart';
import { useUi } from '@/store/ui';
import { CartLineItem } from './CartLineItem';
import { FreeShippingBar } from './FreeShippingBar';

/** Slide-out basket opened by the header icon and after "Add to basket". */
export function MiniCart() {
  const { t, href } = useI18n();
  const open = useUi((state) => state.miniCartOpen);
  const close = useUi((state) => state.closeMiniCart);
  const lines = useCart((state) => state.lines);
  const promoCode = useCart((state) => state.promoCode);
  const totals = computeTotals(lines, promoCode);

  return (
    <Dialog
      open={open}
      onClose={close}
      side="end"
      title={t('cart.miniTitle', { count: totals.itemCount })}
      footer={
        lines.length > 0 ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span>{t('cart.subtotal')}</span>
              <Money amount={totals.subtotal} className="font-semibold" />
            </div>
            <p className="text-xs text-ink-muted">{t('cart.taxNote')}</p>
            <div className="grid grid-cols-2 gap-3">
              <ButtonLink href={href('/cart')} variant="outline" onClick={close}>
                {t('cart.viewBasket')}
              </ButtonLink>
              <ButtonLink href={href('/checkout')} onClick={close}>
                {t('cart.checkout')}
              </ButtonLink>
            </div>
          </div>
        ) : undefined
      }
    >
      {lines.length === 0 ? (
        <div className="flex flex-col items-center px-6 py-16 text-center">
          <ShoppingBag className="size-10 text-ink-subtle" aria-hidden />
          <p className="mt-4 font-semibold">{t('cart.empty')}</p>
          <p className="mt-1 text-sm text-ink-muted">{t('cart.emptyText')}</p>
          <ButtonLink href={href('/c/new')} className="mt-6" onClick={close}>
            {t('cart.continueShopping')}
          </ButtonLink>
        </div>
      ) : (
        <div className="px-5">
          <FreeShippingBar
            remaining={totals.remainingForFreeShipping}
            progress={totals.freeShippingProgress}
            className="border-b border-line py-4"
          />
          <ul className="divide-y divide-line">
            {lines.map((line) => (
              <CartLineItem key={line.key} line={line} compact />
            ))}
          </ul>
        </div>
      )}
    </Dialog>
  );
}
