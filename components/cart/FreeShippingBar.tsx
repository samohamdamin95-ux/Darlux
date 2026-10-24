'use client';

import { Truck } from 'lucide-react';
import { useI18n } from '@/components/providers/I18nProvider';
import { useFormatPrice } from '@/components/ui/Price';
import { cn } from '@/lib/utils';

export function FreeShippingBar({
  remaining,
  progress,
  className,
}: {
  remaining: number;
  progress: number;
  className?: string;
}) {
  const { t } = useI18n();
  const format = useFormatPrice();
  const unlocked = remaining <= 0;

  return (
    <div className={cn('space-y-2', className)}>
      <p className="flex items-center gap-2 text-xs font-medium" aria-live="polite">
        <Truck className={cn('size-4', unlocked ? 'text-success' : 'text-ink')} aria-hidden />
        {unlocked
          ? t('cart.freeShippingUnlocked')
          : t('cart.freeShippingRemaining', { amount: format(remaining) })}
      </p>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress * 100)}
        aria-label={t('cart.shipping')}
        className="h-1 overflow-hidden rounded-full bg-canvas-muted"
      >
        <div
          className={cn('h-full rounded-full transition-[width] duration-500 ease-luxe', unlocked ? 'bg-success' : 'bg-accent')}
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </div>
  );
}
