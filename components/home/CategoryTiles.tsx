import Link from 'next/link';
import { SmartImage } from '@/components/ui/SmartImage';
import { SectionHeader } from '@/components/ui/SectionHeader';
import type { Category } from '@/lib/types';

interface CategoryTilesProps {
  title: string;
  categories: Category[];
  sale: { label: string; tagline: string; href: string };
  getName: (category: Category) => string;
  getHref: (path: string) => string;
}

/** Round tiles on mobile (swipeable), a 7-up grid on desktop. */
export function CategoryTiles({ title, categories, sale, getName, getHref }: CategoryTilesProps) {
  return (
    <section aria-labelledby="shop-by-category" className="container py-12 md:py-16">
      <SectionHeader id="shop-by-category" title={title} className="justify-center text-center" />
      <ul className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 no-scrollbar md:mx-0 md:grid md:grid-cols-7 md:gap-6 md:overflow-visible md:px-0">
        {categories.map((category) => (
          <li key={category.slug} className="w-24 shrink-0 snap-start md:w-auto">
            <Link href={getHref(`/c/${category.slug}`)} className="group block text-center">
              <span className="relative block aspect-square overflow-hidden rounded-full bg-canvas-muted ring-1 ring-line transition-all duration-500 ease-luxe group-hover:ring-ink">
                <SmartImage
                  src={category.image}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 14vw, 96px"
                  className="object-cover transition-transform duration-700 ease-luxe group-hover:scale-110"
                />
              </span>
              <span className="mt-3 block text-xs font-semibold md:text-sm">{getName(category)}</span>
            </Link>
          </li>
        ))}
        <li className="w-24 shrink-0 snap-start md:w-auto">
          <Link href={getHref(sale.href)} className="group block text-center">
            <span className="flex aspect-square items-center justify-center rounded-full bg-accent text-center text-accent-contrast ring-1 ring-accent transition-all duration-500 group-hover:bg-accent-hover">
              <span className="px-2 text-sm font-semibold md:text-lg">{sale.label}</span>
            </span>
            <span className="mt-3 block text-xs font-semibold text-accent md:text-sm">{sale.tagline}</span>
          </Link>
        </li>
      </ul>
    </section>
  );
}
