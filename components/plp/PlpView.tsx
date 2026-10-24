'use client';

import { SlidersHorizontal, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useId, useMemo, useState } from 'react';
import { ProductCard } from '@/components/product/ProductCard';
import { useI18n } from '@/components/providers/I18nProvider';
import { Button } from '@/components/ui/Button';
import { useFormatPrice } from '@/components/ui/Price';
import { Dialog } from '@/components/ui/Dialog';
import { PLP_PAGE_SIZE } from '@/lib/constants';
import {
  applyFilters,
  countActiveFilters,
  EMPTY_FILTERS,
  filtersToParams,
  getFacets,
  parseFilters,
  parseSort,
  SORT_KEYS,
} from '@/lib/filters';
import type { Product, ProductFilters, SortKey, Subcategory } from '@/lib/types';
import { sortProducts } from '@/lib/filters';
import { cn } from '@/lib/utils';
import { FilterPanel } from './FilterPanel';

interface PlpViewProps {
  products: Product[];
  brandNames: Record<string, string>;
  subcategories?: Subcategory[];
  /** Facets to hide (e.g. the brand facet on a brand page). */
  hideBrandFilter?: boolean;
}

/**
 * Client-side listing: filters, sort and the active subcategory live in the
 * URL (shareable, back-button friendly); results render instantly.
 */
export function PlpView({ products, brandNames, subcategories = [], hideBrandFilter }: PlpViewProps) {
  const { t, l } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const sortId = useId();
  const format = useFormatPrice();

  const filters = useMemo(() => parseFilters(searchParams), [searchParams]);
  const sort = parseSort(searchParams);
  const sub = searchParams.get('sub');
  const [visible, setVisible] = useState(PLP_PAGE_SIZE);
  const [sheetOpen, setSheetOpen] = useState(false);

  const scoped = useMemo(() => (sub ? products.filter((product) => product.subcategory === sub) : products), [products, sub]);
  const facets = useMemo(() => {
    const result = getFacets(scoped);
    return hideBrandFilter ? { ...result, brands: [] } : result;
  }, [scoped, hideBrandFilter]);
  const results = useMemo(() => sortProducts(applyFilters(scoped, filters), sort), [scoped, filters, sort]);
  const activeCount = countActiveFilters(filters);

  useEffect(() => setVisible(PLP_PAGE_SIZE), [searchParams]);

  const update = (nextFilters: ProductFilters, nextSort: SortKey = sort) => {
    const params = filtersToParams(new URLSearchParams(searchParams.toString()), nextFilters, nextSort);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const subHref = (slug: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (slug) params.set('sub', slug);
    else params.delete('sub');
    const query = params.toString();
    return query ? `${pathname}?${query}` : pathname;
  };

  /* Active filter chips */
  const chips: { key: string; label: string; remove: () => void }[] = [
    ...filters.brands.map((value) => ({
      key: `brand-${value}`,
      label: brandNames[value] ?? value,
      remove: () => update({ ...filters, brands: filters.brands.filter((item) => item !== value) }),
    })),
    ...(filters.priceMin !== null || filters.priceMax !== null
      ? [
          {
            key: 'price',
            label: `${filters.priceMin !== null ? format(filters.priceMin) : '…'} – ${filters.priceMax !== null ? format(filters.priceMax) : '…'}`,
            remove: () => update({ ...filters, priceMin: null, priceMax: null }),
          },
        ]
      : []),
    ...(filters.rating !== null
      ? [{ key: 'rating', label: t('plp.ratingUp', { n: filters.rating }), remove: () => update({ ...filters, rating: null }) }]
      : []),
    ...filters.skinTypes.map((value) => ({
      key: `skin-${value}`,
      label: t(`values.skinTypes.${value}`),
      remove: () => update({ ...filters, skinTypes: filters.skinTypes.filter((item) => item !== value) }),
    })),
    ...filters.concerns.map((value) => ({
      key: `concern-${value}`,
      label: t(`values.concerns.${value}`),
      remove: () => update({ ...filters, concerns: filters.concerns.filter((item) => item !== value) }),
    })),
    ...filters.finishes.map((value) => ({
      key: `finish-${value}`,
      label: t(`values.finishes.${value}`),
      remove: () => update({ ...filters, finishes: filters.finishes.filter((item) => item !== value) }),
    })),
    ...filters.colors.map((value) => ({
      key: `color-${value}`,
      label: t(`values.colors.${value}`),
      remove: () => update({ ...filters, colors: filters.colors.filter((item) => item !== value) }),
    })),
  ];

  const panel = <FilterPanel facets={facets} filters={filters} brandNames={brandNames} onChange={(next) => update(next)} />;

  return (
    <div>
      {subcategories.length > 0 && (
        <nav aria-label={t('plp.subcategories')} className="-mx-4 mb-6 overflow-x-auto px-4 no-scrollbar md:mx-0 md:px-0">
          <ul className="flex gap-2">
            <li>
              <Link
                href={subHref(null)}
                scroll={false}
                aria-current={!sub ? 'page' : undefined}
                className={cn(
                  'block whitespace-nowrap rounded-full border px-4 py-2 text-xs font-semibold transition-colors',
                  !sub ? 'border-ink bg-ink text-canvas' : 'border-line-strong hover:border-ink',
                )}
              >
                {t('reviews.all')}
              </Link>
            </li>
            {subcategories.map((item) => (
              <li key={item.slug}>
                <Link
                  href={subHref(item.slug)}
                  scroll={false}
                  aria-current={sub === item.slug ? 'page' : undefined}
                  className={cn(
                    'block whitespace-nowrap rounded-full border px-4 py-2 text-xs font-semibold transition-colors',
                    sub === item.slug ? 'border-ink bg-ink text-canvas' : 'border-line-strong hover:border-ink',
                  )}
                >
                  {l(item.name)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}

      <div className="sticky top-[121px] z-30 -mx-4 mb-6 flex items-center justify-between gap-3 border-y border-line bg-canvas/95 px-4 py-3 backdrop-blur md:top-[81px] md:mx-0 md:px-0 lg:static lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
        <p className="text-sm text-ink-muted" aria-live="polite">
          {t('plp.productCount', { count: results.length })}
        </p>
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            className="flex h-10 items-center gap-2 rounded border border-line-strong px-4 text-sm font-semibold lg:hidden"
          >
            <SlidersHorizontal className="size-4" aria-hidden />
            {activeCount ? t('plp.filtersCount', { count: activeCount }) : t('plp.filters')}
          </button>
          <label htmlFor={sortId} className="sr-only lg:not-sr-only lg:text-sm lg:text-ink-muted">
            {t('plp.sortBy')}
          </label>
          <select
            id={sortId}
            value={sort}
            onChange={(event) => update(filters, event.target.value as SortKey)}
            className="h-10 w-36 min-w-0 rounded border border-line-strong bg-canvas pe-8 ps-3 text-sm font-medium focus:border-ink focus:outline-none sm:w-auto"
          >
            {SORT_KEYS.map((key) => (
              <option key={key} value={key}>
                {t(`plp.sort.${key}`)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="lg:grid lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-10">
        <aside aria-label={t('plp.filters')} className="hidden lg:block">
          <div className="sticky top-36 max-h-[calc(100vh-10rem)] overflow-y-auto pe-2">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h2 className="text-sm font-semibold">{t('plp.filters')}</h2>
              {activeCount > 0 && (
                <button type="button" onClick={() => update(EMPTY_FILTERS)} className="text-xs link-underline">
                  {t('common.clearAll')}
                </button>
              )}
            </div>
            {panel}
          </div>
        </aside>

        <div>
          {chips.length > 0 && (
            <div className="mb-6 flex flex-wrap items-center gap-2">
              <h2 className="sr-only">{t('plp.activeFilters')}</h2>
              {chips.map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  onClick={chip.remove}
                  aria-label={t('plp.removeFilter', { label: chip.label })}
                  className="flex items-center gap-1.5 rounded-full bg-canvas-muted px-3 py-1.5 text-xs font-medium transition-colors hover:bg-line"
                >
                  {chip.label}
                  <X className="size-3" aria-hidden />
                </button>
              ))}
              <button type="button" onClick={() => update(EMPTY_FILTERS)} className="ms-1 text-xs link-underline">
                {t('common.clearAll')}
              </button>
            </div>
          )}

          {results.length === 0 ? (
            <div className="rounded border border-dashed border-line-strong px-6 py-20 text-center">
              <p className="text-lg font-semibold">{t('plp.noResults')}</p>
              <p className="mt-2 text-sm text-ink-muted">{t('plp.noResultsText')}</p>
              {activeCount > 0 && (
                <Button variant="outline" className="mt-6" onClick={() => update(EMPTY_FILTERS)}>
                  {t('plp.clearFilters')}
                </Button>
              )}
            </div>
          ) : (
            <>
              <ul className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 xl:grid-cols-4">
                {results.slice(0, visible).map((product, index) => (
                  <li key={product.id}>
                    <ProductCard
                      product={product}
                      brandName={brandNames[product.brand] ?? product.brand}
                      priority={index < 4}
                      sizes="(min-width: 1280px) 20vw, (min-width: 768px) 30vw, 50vw"
                    />
                  </li>
                ))}
              </ul>
              {results.length > PLP_PAGE_SIZE && (
                <div className="mt-14 flex flex-col items-center gap-4">
                  <p className="text-xs text-ink-muted">
                    {t('plp.showing', { shown: Math.min(visible, results.length), total: results.length })}
                  </p>
                  <div className="h-0.5 w-48 overflow-hidden rounded-full bg-canvas-muted">
                    <div className="h-full bg-ink transition-all" style={{ width: `${(Math.min(visible, results.length) / results.length) * 100}%` }} />
                  </div>
                  {visible < results.length && (
                    <Button variant="outline" onClick={() => setVisible((count) => count + PLP_PAGE_SIZE)}>
                      {t('plp.loadMore')}
                    </Button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Dialog
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        side="bottom"
        title={t('plp.filters')}
        footer={
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => update(EMPTY_FILTERS)} disabled={activeCount === 0}>
              {t('common.clearAll')}
            </Button>
            <Button className="flex-[2]" onClick={() => setSheetOpen(false)}>
              {t('plp.showResults', { count: results.length })}
            </Button>
          </div>
        }
      >
        <div className="px-5 pb-4">{panel}</div>
      </Dialog>
    </div>
  );
}
