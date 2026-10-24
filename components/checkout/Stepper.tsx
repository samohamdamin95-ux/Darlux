'use client';

import { Check } from 'lucide-react';
import { useI18n } from '@/components/providers/I18nProvider';
import { cn } from '@/lib/utils';

export const STEPS = ['shipping', 'delivery', 'payment', 'review'] as const;
export type Step = (typeof STEPS)[number];

export function Stepper({ current, onSelect }: { current: number; onSelect: (index: number) => void }) {
  const { t } = useI18n();
  return (
    <nav aria-label={t('checkout.title')}>
      <ol className="flex items-center gap-2">
        {STEPS.map((step, index) => {
          const done = index < current;
          const active = index === current;
          const content = (
            <>
              <span
                className={cn(
                  'flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-colors',
                  done && 'border-ink bg-ink text-canvas',
                  active && 'border-ink text-ink',
                  !done && !active && 'border-line-strong text-ink-subtle',
                )}
              >
                {done ? <Check className="size-3.5" aria-hidden /> : index + 1}
              </span>
              <span className={cn('hidden text-sm sm:inline', active ? 'font-semibold' : 'text-ink-muted')}>
                {t(`checkout.steps.${step}`)}
              </span>
            </>
          );
          return (
            <li key={step} className="flex flex-1 items-center gap-2 last:flex-none">
              {done ? (
                <button type="button" onClick={() => onSelect(index)} className="flex items-center gap-2 rounded hover:opacity-80">
                  {content}
                  <span className="sr-only">({t('common.edit')})</span>
                </button>
              ) : (
                <span className="flex items-center gap-2" aria-current={active ? 'step' : undefined}>
                  {content}
                  {!active && <span className="sr-only">{t(`checkout.steps.${step}`)}</span>}
                </span>
              )}
              {index < STEPS.length - 1 && (
                <span aria-hidden className={cn('h-px flex-1', done ? 'bg-ink' : 'bg-line-strong')} />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
