import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { PlpHeader } from '@/components/plp/PlpHeader';
import { PlpView } from '@/components/plp/PlpView';
import { ProductGridSkeleton } from '@/components/ui/Skeleton';
import { locales, type Locale } from '@/i18n/config';
import { getI18n } from '@/i18n/server';
import { getBrand, getBrands, getProductsByBrand } from '@/lib/catalog';
import { getBrandNames } from '@/lib/page-helpers';
import { buildMetadata } from '@/lib/seo';

type Props = { params: Promise<{ locale: Locale; brand: string }> };

export const dynamicParams = false;

export async function generateStaticParams() {
  const brands = await getBrands();
  return locales.flatMap((locale) => brands.map((brand) => ({ locale, brand: brand.slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, brand: slug } = await params;
  const brand = await getBrand(slug);
  if (!brand) return {};
  const { l } = getI18n(locale);
  return buildMetadata({ locale, title: brand.name, description: `${brand.name} — ${l(brand.tagline)}`, path: `/brands/${slug}` });
}

export default async function BrandPage({ params }: Props) {
  const { locale, brand: slug } = await params;
  const brand = await getBrand(slug);
  if (!brand) notFound();

  const { t, l, href } = getI18n(locale);
  const [products, brandNames] = await Promise.all([getProductsByBrand(slug), getBrandNames()]);

  return (
    <div className="container py-8 md:py-12">
      <PlpHeader
        breadcrumbLabel={t('common.breadcrumb')}
        crumbs={[
          { label: t('common.home'), href: href('/') },
          { label: t('header.brands'), href: href('/brands') },
          { label: brand.name },
        ]}
        title={brand.name}
        description={l(brand.tagline)}
      />
      <Suspense fallback={<ProductGridSkeleton />}>
        <PlpView products={products} brandNames={brandNames} hideBrandFilter />
      </Suspense>
    </div>
  );
}
