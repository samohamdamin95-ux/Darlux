import { getI18n } from '@/i18n/server';
import type { Locale } from '@/i18n/config';
import type { Brand, Category, SearchIndexEntry } from '@/lib/types';
import { HeaderActions } from './HeaderActions';
import { Logo } from './Logo';
import { MegaMenu } from './MegaMenu';
import { MobileNav } from './MobileNav';
import { SearchBar } from './SearchBar';

interface HeaderProps {
  locale: Locale;
  categories: Category[];
  brands: Brand[];
  categoryBrands: Record<string, string[]>;
  searchIndex: SearchIndexEntry[];
}

export function Header({ locale, categories, brands, categoryBrands, searchIndex }: HeaderProps) {
  const { t, href } = getI18n(locale);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-canvas/95 backdrop-blur supports-[backdrop-filter]:bg-canvas/85">
      <div className="container flex h-16 items-center gap-3 md:h-20 md:gap-6">
        <MobileNav categories={categories} brands={brands} />
        <Logo href={href('/')} label={`Darlux — ${t('common.home')}`} className="shrink-0" />
        <SearchBar index={searchIndex} className="mx-auto hidden w-full max-w-2xl md:block" />
        <div className="ms-auto md:ms-0">
          <HeaderActions />
        </div>
      </div>
      <div className="container pb-3 md:hidden">
        <SearchBar index={searchIndex} />
      </div>
      <MegaMenu categories={categories} brands={brands} categoryBrands={categoryBrands} />
    </header>
  );
}
