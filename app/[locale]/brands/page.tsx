import type { Metadata } from 'next';
import Link from 'next/link';
import { PlpHeader } from '@/components/plp/PlpHeader';
import type { Locale } from '@/i18n/config';
import { getI18n } from '@/i18n/server';
import { getBrands, getProducts } from '@/lib/catalog';
import { buildMetadata } from '@/lib/seo';

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const { t } = getI18n(locale);
  const brands = await getBrands();
  return buildMetadata({
    locale,
    title: t('meta.brandsTitle'),
    description: t('brands.subtitle', { count: brands.length }),
    path: '/brands',
  });
}

export default async function BrandsPage({ params }: Props) {
  const { locale } = await params;
  const { t, l, href } = getI18n(locale);
  const [brands, products] = await Promise.all([getBrands(), getProducts()]);

  const groups = brands.reduce<Record<string, typeof brands>>((acc, brand) => {
    const letter = brand.name[0].toUpperCase();
    (acc[letter] ??= []).push(brand);
    return acc;
  }, {});
  const letters = Object.keys(groups).sort();

  return (
    <div className="container py-8 md:py-12">
      <PlpHeader
        breadcrumbLabel={t('common.breadcrumb')}
        crumbs={[{ label: t('common.home'), href: href('/') }, { label: t('header.brands') }]}
        title={t('brands.title')}
        description={t('brands.subtitle', { count: brands.length })}
      />

      <nav aria-label={t('brands.title')} className="mb-10 flex flex-wrap gap-2" dir="ltr">
        {letters.map((letter) => (
          <a
            key={letter}
            href={`#letter-${letter}`}
            className="flex size-10 items-center justify-center rounded-full border border-line-strong text-sm font-semibold transition-colors hover:border-ink hover:bg-ink hover:text-canvas"
          >
            {letter}
          </a>
        ))}
      </nav>

      <div className="space-y-12">
        {letters.map((letter) => (
          <section key={letter} id={`letter-${letter}`} aria-labelledby={`heading-${letter}`} className="scroll-mt-40 border-t border-line pt-6">
            <h2 id={`heading-${letter}`} className="text-3xl font-light" dir="ltr">
              {letter}
            </h2>
            <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {groups[letter].map((brand) => (
                <li key={brand.slug}>
                  <Link href={href(`/brands/${brand.slug}`)} className="group block">
                    <span className="block text-lg font-semibold group-hover:text-accent">{brand.name}</span>
                    <span className="block text-sm text-ink-muted">{l(brand.tagline)}</span>
                    <span className="mt-1 block text-xs text-ink-subtle">
                      {t('brands.products', { count: products.filter((product) => product.brand === brand.slug).length })}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
