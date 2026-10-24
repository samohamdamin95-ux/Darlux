'use client';

import { Check } from 'lucide-react';
import { useEffect, useId, useState, type FormEvent, type ReactNode } from 'react';
import { useI18n } from '@/components/providers/I18nProvider';
import { AccordionItem } from '@/components/ui/Accordion';
import { Rating } from '@/components/ui/Rating';
import { COLOR_SWATCH, RATING_OPTIONS, type Facets } from '@/lib/filters';
import { CURRENCIES } from '@/lib/format';
import type { ProductFilters } from '@/lib/types';
import { cn } from '@/lib/utils';
import { usePreferences } from '@/store/preferences';

interface FilterPanelProps {
  facets: Facets;
  filters: ProductFilters;
  brandNames: Record<string, string>;
  onChange: (next: ProductFilters) => void;
}

type ListKey = 'brands' | 'skinTypes' | 'concerns' | 'finishes' | 'colors';

function toggle<T>(values: T[], value: T) {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

function CheckboxRow({
  checked,
  onChange,
  label,
  count,
  swatch,
}: {
  checked: boolean;
  onChange: () => void;
  label: ReactNode;
  count: number;
  swatch?: string;
}) {
  return (
    <label className="group flex cursor-pointer items-center gap-3 py-1.5 text-sm">
      <input type="checkbox" checked={checked} onChange={onChange} className="peer sr-only" />
      <span
        aria-hidden
        className="flex size-[18px] shrink-0 items-center justify-center rounded-sm border border-line-strong transition-colors group-hover:border-ink peer-checked:border-ink peer-checked:bg-ink peer-focus-visible:ring-2 peer-focus-visible:ring-accent peer-focus-visible:ring-offset-1"
      >
        <Check className={cn('size-3 text-canvas', !checked && 'invisible')} strokeWidth={3} />
      </span>
      {swatch && <span aria-hidden className="size-4 rounded-full border border-black/10" style={{ backgroundColor: swatch }} />}
      <span className="flex-1">{label}</span>
      <span className="text-xs text-ink-muted tabular-nums">{count}</span>
    </label>
  );
}

/** Filter controls shared by the desktop sidebar and the mobile bottom sheet. */
export function FilterPanel({ facets, filters, brandNames, onChange }: FilterPanelProps) {
  const { t } = useI18n();
  const id = useId();
  const currency = usePreferences((state) => state.currency);
  const rate = CURRENCIES[currency].rate;

  // Price inputs are shown in the shopper's currency and stored in the base currency.
  const toDisplay = (usd: number | null) => (usd === null ? '' : String(Math.round(usd * rate)));
  const [min, setMin] = useState(toDisplay(filters.priceMin));
  const [max, setMax] = useState(toDisplay(filters.priceMax));

  useEffect(() => {
    setMin(toDisplay(filters.priceMin));
    setMax(toDisplay(filters.priceMax));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.priceMin, filters.priceMax, rate]);

  const toggleList = <K extends ListKey>(key: K, value: ProductFilters[K][number]) =>
    onChange({ ...filters, [key]: toggle(filters[key] as ProductFilters[K][number][], value) });

  const applyPrice = (event: FormEvent) => {
    event.preventDefault();
    const parse = (value: string) => (value.trim() === '' || Number.isNaN(Number(value)) ? null : Math.max(0, Number(value) / rate));
    let low = parse(min);
    let high = parse(max);
    if (low !== null && high !== null && low > high) [low, high] = [high, low];
    onChange({ ...filters, priceMin: low, priceMax: high });
  };

  const sections: { key: ListKey; title: string; options: { value: string; label: string; count: number; swatch?: string }[] }[] = [
    {
      key: 'brands',
      title: t('plp.brand'),
      options: facets.brands.map((item) => ({ ...item, label: brandNames[item.value] ?? item.value })),
    },
    {
      key: 'skinTypes',
      title: t('plp.skinType'),
      options: facets.skinTypes.map((item) => ({ ...item, label: t(`values.skinTypes.${item.value}`) })),
    },
    {
      key: 'concerns',
      title: t('plp.concern'),
      options: facets.concerns.map((item) => ({ ...item, label: t(`values.concerns.${item.value}`) })),
    },
    {
      key: 'finishes',
      title: t('plp.finish'),
      options: facets.finishes.map((item) => ({ ...item, label: t(`values.finishes.${item.value}`) })),
    },
    {
      key: 'colors',
      title: t('plp.color'),
      options: facets.colors.map((item) => ({ ...item, label: t(`values.colors.${item.value}`), swatch: COLOR_SWATCH[item.value] })),
    },
  ];

  const [brandSection, ...attributeSections] = sections;
  const renderList = (section: (typeof sections)[number]) =>
    section.options.length > 0 && (
      <AccordionItem key={section.key} title={section.title} defaultOpen={section.key === 'brands' || (filters[section.key] as string[]).length > 0}>
        <fieldset>
          <legend className="sr-only">{section.title}</legend>
          {section.options.map((option) => (
            <CheckboxRow
              key={option.value}
              checked={(filters[section.key] as string[]).includes(option.value)}
              onChange={() => toggleList(section.key, option.value as never)}
              label={option.label}
              count={option.count}
              swatch={option.swatch}
            />
          ))}
        </fieldset>
      </AccordionItem>
    );

  return (
    <div>
      {renderList(brandSection)}

      <AccordionItem title={t('plp.price')} defaultOpen>
        <form onSubmit={applyPrice} className="flex items-end gap-2">
          <div className="flex-1">
            <label htmlFor={`${id}-min`} className="mb-1 block text-xs text-ink-muted">
              {t('plp.priceMin')} ({currency})
            </label>
            <input
              id={`${id}-min`}
              inputMode="numeric"
              value={min}
              onChange={(event) => setMin(event.target.value.replace(/[^\d]/g, ''))}
              placeholder={String(Math.floor(facets.priceRange[0] * rate))}
              className="field py-2"
            />
          </div>
          <span aria-hidden className="pb-2.5 text-ink-muted">–</span>
          <div className="flex-1">
            <label htmlFor={`${id}-max`} className="mb-1 block text-xs text-ink-muted">
              {t('plp.priceMax')} ({currency})
            </label>
            <input
              id={`${id}-max`}
              inputMode="numeric"
              value={max}
              onChange={(event) => setMax(event.target.value.replace(/[^\d]/g, ''))}
              placeholder={String(Math.ceil(facets.priceRange[1] * rate))}
              className="field py-2"
            />
          </div>
          <button type="submit" className="h-[38px] rounded border border-ink px-3 text-xs font-semibold hover:bg-ink hover:text-canvas">
            {t('common.apply')}
          </button>
        </form>
      </AccordionItem>

      <AccordionItem title={t('plp.rating')} defaultOpen={filters.rating !== null}>
        <fieldset className="space-y-1">
          <legend className="sr-only">{t('plp.rating')}</legend>
          {RATING_OPTIONS.map((value) => (
            <label key={value} className="flex cursor-pointer items-center gap-3 py-1.5 text-sm">
              <input
                type="radio"
                name={`${id}-rating`}
                checked={filters.rating === value}
                onChange={() => onChange({ ...filters, rating: value })}
                className="size-4 accent-ink"
              />
              <Rating value={value} label="" />
              <span>{t('plp.ratingUp', { n: value })}</span>
            </label>
          ))}
          {filters.rating !== null && (
            <button type="button" onClick={() => onChange({ ...filters, rating: null })} className="mt-1 text-xs link-underline">
              {t('common.clear')}
            </button>
          )}
        </fieldset>
      </AccordionItem>

      {attributeSections.map(renderList)}
    </div>
  );
}
