'use client';

import { ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState, type FocusEvent, type KeyboardEvent } from 'react';
import { useI18n } from '@/components/providers/I18nProvider';
import { SmartImage } from '@/components/ui/SmartImage';
import type { Brand, Category } from '@/lib/types';
import { cn } from '@/lib/utils';

interface MegaMenuProps {
  categories: Category[];
  brands: Brand[];
  /** Brand slugs that have products in each category. */
  categoryBrands: Record<string, string[]>;
}

const OPEN_DELAY = 120;
const CLOSE_DELAY = 160;

/**
 * Desktop navigation. Each top-level item is a real link plus a disclosure
 * button (aria-expanded) so the panel is reachable by mouse, keyboard and
 * screen readers. Escape closes the open panel and returns focus.
 */
export function MegaMenu({ categories, brands, categoryBrands }: MegaMenuProps) {
  const { t, l, href } = useI18n();
  const pathname = usePathname();
  const [openId, setOpenId] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggerRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => setOpenId(null), [pathname]);
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const schedule = (id: string | null, delay: number) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpenId(id), delay);
  };

  const onKeyDown = (event: KeyboardEvent, id: string) => {
    if (event.key === 'Escape' && openId) {
      setOpenId(null);
      triggerRefs.current[id]?.focus();
    }
  };

  const onBlur = (event: FocusEvent<HTMLLIElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node)) setOpenId(null);
  };

  const items = [
    ...categories.map((category) => ({ id: category.slug, label: l(category.name), href: `/c/${category.slug}`, category })),
    { id: 'brands', label: t('header.brands'), href: '/brands', category: null },
  ];

  return (
    <nav aria-label={t('header.mainNav')} className="relative hidden border-t border-line lg:block">
      <ul className="container flex items-center justify-center gap-1">
        <li>
          <Link href={href('/c/new')} className="block px-3 py-3.5 text-sm font-medium transition-colors hover:text-accent">
            {t('header.new')}
          </Link>
        </li>
        {items.map((item) => {
          const open = openId === item.id;
          const panelId = `mega-${item.id}`;
          return (
            <li
              key={item.id}
              className="flex items-center"
              onMouseEnter={() => schedule(item.id, OPEN_DELAY)}
              onMouseLeave={() => schedule(null, CLOSE_DELAY)}
              onKeyDown={(event) => onKeyDown(event, item.id)}
              onBlur={onBlur}
            >
              <Link
                href={href(item.href)}
                className={cn(
                  'block py-3.5 ps-3 text-sm font-medium transition-colors hover:text-accent',
                  open && 'text-accent',
                )}
              >
                {item.label}
              </Link>
              <button
                type="button"
                ref={(element) => {
                  triggerRefs.current[item.id] = element;
                }}
                aria-expanded={open}
                aria-controls={panelId}
                aria-label={t('header.shopAll', { name: item.label })}
                onClick={() => setOpenId(open ? null : item.id)}
                className="px-1.5 py-3.5 text-ink-muted hover:text-ink"
              >
                <ChevronDown aria-hidden className={cn('size-3.5 transition-transform duration-200', open && 'rotate-180')} />
              </button>

              <div
                id={panelId}
                hidden={!open}
                className="absolute inset-x-0 top-full z-40 border-t border-line bg-canvas shadow-pop animate-fade-in"
              >
                <div className="container grid grid-cols-12 gap-8 py-10">
                  {item.category ? (
                    <>
                      <div className="col-span-3">
                        <p className="eyebrow mb-4">{t('plp.subcategories')}</p>
                        <ul className="space-y-3">
                          {item.category.subcategories.map((sub) => (
                            <li key={sub.slug}>
                              <Link
                                href={href(`/c/${item.category!.slug}?sub=${sub.slug}`)}
                                className="text-sm text-ink-soft transition-colors hover:text-accent"
                              >
                                {l(sub.name)}
                              </Link>
                            </li>
                          ))}
                          <li className="pt-2">
                            <Link href={href(item.href)} className="text-sm font-semibold link-underline">
                              {t('header.shopAll', { name: item.label })}
                            </Link>
                          </li>
                        </ul>
                      </div>
                      <div className="col-span-4">
                        <p className="eyebrow mb-4">{t('header.brands')}</p>
                        <ul className="grid grid-cols-2 gap-3">
                          {brands
                            .filter((brand) => categoryBrands[item.id]?.includes(brand.slug))
                            .map((brand) => (
                            <li key={brand.slug}>
                              <Link href={href(`/brands/${brand.slug}`)} className="text-sm text-ink-soft hover:text-accent">
                                {brand.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <Link href={href(item.category.featured.href)} className="group col-span-5 block">
                        <span className="relative block aspect-[16/9] overflow-hidden rounded bg-canvas-muted">
                          <SmartImage
                            src={item.category.featured.image}
                            alt=""
                            fill
                            sizes="(min-width: 1024px) 40vw, 100vw"
                            className="object-cover transition-transform duration-700 ease-luxe group-hover:scale-105"
                          />
                        </span>
                        <span className="eyebrow mt-4 block">{t('header.featured')}</span>
                        <span className="mt-1 block text-base font-semibold group-hover:text-accent">
                          {l(item.category.featured.title)}
                        </span>
                      </Link>
                    </>
                  ) : (
                    <div className="col-span-12">
                      <ul className="grid grid-cols-5 gap-x-8 gap-y-4">
                        {brands.map((brand) => (
                          <li key={brand.slug}>
                            <Link href={href(`/brands/${brand.slug}`)} className="group block">
                              <span className="block text-sm font-semibold group-hover:text-accent">{brand.name}</span>
                              <span className="block text-xs text-ink-muted">{l(brand.tagline)}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                      <Link href={href('/brands')} className="mt-8 inline-block text-sm font-semibold link-underline">
                        {t('header.allBrands')}
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </li>
          );
        })}
        <li>
          <Link href={href('/c/sale')} className="block px-3 py-3.5 text-sm font-semibold text-accent hover:text-accent-hover">
            {t('header.sale')}
          </Link>
        </li>
      </ul>
    </nav>
  );
}
