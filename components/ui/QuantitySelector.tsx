'use client';

import { Minus, Plus } from 'lucide-react';
import { useI18n } from '@/components/providers/I18nProvider';
import { MAX_QUANTITY } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface QuantitySelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  size?: 'sm' | 'md';
  label?: string;
  className?: string;
}

export function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = MAX_QUANTITY,
  size = 'md',
  label,
  className,
}: QuantitySelectorProps) {
  const { t } = useI18n();
  const box = size === 'sm' ? 'h-9' : 'h-12';
  const btn = size === 'sm' ? 'w-8' : 'w-11';

  return (
    <div
      role="group"
      aria-label={label ?? t('product.quantity')}
      className={cn('inline-flex items-stretch rounded border border-line-strong', box, className)}
    >
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label={t('product.decrease')}
        className={cn('flex items-center justify-center text-ink transition-colors hover:bg-canvas-muted disabled:opacity-30', btn)}
      >
        <Minus className="size-3.5" aria-hidden />
      </button>
      <output aria-live="polite" className="flex min-w-8 items-center justify-center text-sm font-semibold tabular-nums">
        {value}
      </output>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label={t('product.increase')}
        className={cn('flex items-center justify-center text-ink transition-colors hover:bg-canvas-muted disabled:opacity-30', btn)}
      >
        <Plus className="size-3.5" aria-hidden />
      </button>
    </div>
  );
}
