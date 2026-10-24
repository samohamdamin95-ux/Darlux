import Link from 'next/link';
import { SectionHeader } from '@/components/ui/SectionHeader';
import type { Brand } from '@/lib/types';
import { cn } from '@/lib/utils';

const WORDMARK: Record<Brand['wordmark'], string> = {
  caps: 'text-sm font-semibold uppercase tracking-[0.3em]',
  light: 'text-xl font-light tracking-wide',
  italic: 'text-xl font-medium italic',
  bold: 'text-lg font-extrabold uppercase tracking-tight',
};

/** Typographic wordmarks for the fictional brands (no image logos needed). */
export function BrandsStrip({
  title,
  subtitle,
  brands,
  getHref,
  action,
}: {
  title: string;
  subtitle: string;
  brands: Brand[];
  getHref: (path: string) => string;
  action: { label: string; href: string };
}) {
  return (
    <section aria-labelledby="brands-strip" className="border-y border-line bg-canvas-soft py-12 md:py-16">
      <div className="container">
        <SectionHeader id="brands-strip" title={title} eyebrow={subtitle} action={action} />
        <ul className="grid grid-cols-2 gap-px overflow-hidden rounded border border-line bg-line sm:grid-cols-3 lg:grid-cols-5">
          {brands.map((brand) => (
            <li key={brand.slug}>
              <Link
                href={getHref(`/brands/${brand.slug}`)}
                className="flex h-24 items-center justify-center bg-canvas px-4 text-center transition-colors duration-300 hover:bg-ink hover:text-canvas md:h-28"
                dir="ltr"
              >
                <span className={cn(WORDMARK[brand.wordmark])}>{brand.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
