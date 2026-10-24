'use client';

import { useI18n } from '@/components/providers/I18nProvider';
import { formatPrice } from '@/lib/format';
import { cn } from '@/lib/utils';
import { usePreferences } from '@/store/preferences';

/** Formats a base-currency (USD) amount in the shopper's chosen currency. */
export function useFormatPrice() {
  const { locale } = useI18n();
  const currency = usePreferences((state) => state.currency);
  return (amount: number) => formatPrice(amount, currency, locale);
}

export function Money({ amount, className }: { amount: number; className?: string }) {
  const format = useFormatPrice();
  return <span className={cn('tabular-nums', className)}>{format(amount)}</span>;
}

interface PriceProps {
  price: number;
  salePrice: number | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Price({ price, salePrice, size = 'sm', className }: PriceProps) {
  const { t } = useI18n();
  const format = useFormatPrice();
  const onSale = salePrice !== null && salePrice < price;
  const text = { sm: 'text-sm', md: 'text-base', lg: 'text-xl md:text-2xl' }[size];

  if (!onSale) {
    return <p className={cn('font-semibold tabular-nums', text, className)}>{format(price)}</p>;
  }

  const percent = Math.round(((price - salePrice) / price) * 100);
  return (
    <p className={cn('flex flex-wrap items-baseline gap-x-2 tabular-nums', text, className)}>
      <span className="sr-only">{t('product.priceNow')}</span>
      <span className="font-semibold text-accent">{format(salePrice)}</span>
      <span className="sr-only">{t('product.priceWas')}</span>
      <s className="text-[0.85em] text-ink-muted">{format(price)}</s>
      {size !== 'sm' && (
        <span className="text-xs font-semibold text-accent">{t('product.save', { percent })}</span>
      )}
    </p>
  );
}
