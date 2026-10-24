'use client';

import { Heart, Menu, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, type MouseEvent } from 'react';
import { useI18n } from '@/components/providers/I18nProvider';
import { AccordionItem } from '@/components/ui/Accordion';
import { Dialog } from '@/components/ui/Dialog';
import type { Brand, Category } from '@/lib/types';
import { CurrencySelector } from './CurrencySelector';
import { LocaleSwitcher } from './LocaleSwitcher';

/** Hamburger button + slide-in drawer with accordion categories (mobile and tablet). */
export function MobileNav({ categories, brands }: { categories: Category[]; brands: Brand[] }) {
  const { t, l, href } = useI18n();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  // Close when any link inside the drawer is followed.
  const onClickCapture = (event: MouseEvent) => {
    if ((event.target as HTMLElement).closest('a')) setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t('header.openMenu')}
        aria-expanded={open}
        className="-ms-2 rounded-full p-2 transition-colors hover:bg-canvas-muted lg:hidden"
      >
        <Menu className="size-6" aria-hidden />
      </button>

      <Dialog open={open} onClose={() => setOpen(false)} title={t('header.mainNav')} side="start">
        <nav aria-label={t('header.mainNav')} onClickCapture={onClickCapture} className="px-5 pb-8">
          <ul className="border-b border-line py-2">
            <li>
              <Link href={href('/c/new')} className="block py-3 text-sm font-semibold">
                {t('header.new')}
              </Link>
            </li>
            <li>
              <Link href={href('/c/sale')} className="block py-3 text-sm font-semibold text-accent">
                {t('header.sale')}
              </Link>
            </li>
          </ul>

          {categories.map((category) => (
            <AccordionItem key={category.slug} title={l(category.name)}>
              <ul className="space-y-3">
                {category.subcategories.map((sub) => (
                  <li key={sub.slug}>
                    <Link href={href(`/c/${category.slug}?sub=${sub.slug}`)} className="block text-ink-soft">
                      {l(sub.name)}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link href={href(`/c/${category.slug}`)} className="block font-semibold text-ink">
                    {t('header.shopAll', { name: l(category.name) })}
                  </Link>
                </li>
              </ul>
            </AccordionItem>
          ))}

          <AccordionItem title={t('header.brands')}>
            <ul className="grid grid-cols-2 gap-3">
              {brands.map((brand) => (
                <li key={brand.slug}>
                  <Link href={href(`/brands/${brand.slug}`)} className="block text-ink-soft">
                    {brand.name}
                  </Link>
                </li>
              ))}
              <li className="col-span-2">
                <Link href={href('/brands')} className="font-semibold text-ink">
                  {t('header.allBrands')}
                </Link>
              </li>
            </ul>
          </AccordionItem>

          <ul className="mt-6 space-y-1">
            <li>
              <Link href={href('/account')} className="flex items-center gap-3 py-2.5 text-sm">
                <User className="size-5" aria-hidden />
                {t('header.account')}
              </Link>
            </li>
            <li>
              <Link href={href('/wishlist')} className="flex items-center gap-3 py-2.5 text-sm">
                <Heart className="size-5" aria-hidden />
                {t('header.wishlist')}
              </Link>
            </li>
          </ul>

          <div className="mt-6 space-y-4 border-t border-line pt-6">
            <LocaleSwitcher />
            <CurrencySelector />
          </div>
        </nav>
      </Dialog>
    </>
  );
}
