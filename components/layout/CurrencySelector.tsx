'use client';

import { useId } from 'react';
import { useI18n } from '@/components/providers/I18nProvider';
import { CURRENCIES, type CurrencyCode } from '@/lib/format';
import { cn } from '@/lib/utils';
import { usePreferences } from '@/store/preferences';

export function CurrencySelector({ tone = 'light', className }: { tone?: 'light' | 'dark'; className?: string }) {
  const { t } = useI18n();
  const id = useId();
  const currency = usePreferences((state) => state.currency);
  const setCurrency = usePreferences((state) => state.setCurrency);

  return (
    <div className={cn('flex items-center gap-2 text-sm', className)}>
      <label htmlFor={id} className={tone === 'dark' ? 'text-white/70' : 'text-ink-muted'}>
        {t('common.currency')}
      </label>
      <select
        id={id}
        value={currency}
        onChange={(event) => setCurrency(event.target.value as CurrencyCode)}
        className={cn(
          'rounded border bg-transparent px-2 py-1 text-sm focus:outline-none focus-visible:ring-2',
          tone === 'dark' ? 'border-white/20 text-white [&>option]:text-ink' : 'border-line-strong text-ink',
        )}
      >
        {(Object.keys(CURRENCIES) as CurrencyCode[]).map((code) => (
          <option key={code} value={code}>
            {CURRENCIES[code].label}
          </option>
        ))}
      </select>
    </div>
  );
}
