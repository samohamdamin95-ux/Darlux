import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { PlpHeader } from '@/components/plp/PlpHeader';
import { PlpView } from '@/components/plp/PlpView';
import { ProductGridSkeleton } from '@/components/ui/Skeleton';
import { locales, type Locale } from '@/i18n/config';
import { getI18n } from '@/i18n/server';
import { COLLECTION_SLUGS, getCategory, getProductsByCollection, type CollectionSlug } from '@/lib/catalog';
import { getBrandNames } from '@/lib/page-helpers';
import { buildMetadata } from '@/lib/seo';

type Props = { params: Promise<{ locale: Locale; category: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.flatMap((locale) => COLLECTION_SLUGS.map((category) => ({ locale, category })));
}

async function resolveCollection(locale: Locale, slug: string) {
  if (!COLLECTION_SLUGS.includes(slug as CollectionSlug)) return null;
  const { t, l } = getI18n(locale);
  if (slug === 'sale') return { title: t('collections.sale'), description: t('collections.saleDescription'), category: null };
  if (slug === 'new') return { title: t('collections.new'), description: t('collections.newDescription'), category: null };
  const category = await getCategory(slug);
  if (!category) return null;
  return { title: l(category.name), description: l(category.description), category };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, category } = await params;
  const collection = await resolveCollection(locale, category);
  if (!collection) return {};
  return buildMetadata({
    locale,
    title: collection.title,
    description: collection.description,
    path: `/c/${category}`,
    image: collection.category?.image,
  });
}

export default async function CategoryPage({ params }: Props) {
  const { locale, category: slug } = await params;
  const collection = await resolveCollection(locale, slug);
  if (!collection) notFound();

  const { t, href } = getI18n(locale);
  const [products, brandNames] = await Promise.all([
    getProductsByCollection(slug as CollectionSlug),
    getBrandNames(),
  ]);

  return (
    <div className="container py-8 md:py-12">
      <PlpHeader
        breadcrumbLabel={t('common.breadcrumb')}
        crumbs={[{ label: t('common.home'), href: href('/') }, { label: collection.title }]}
        title={collection.title}
        description={collection.description}
      />
      <Suspense fallback={<ProductGridSkeleton />}>
        <PlpView products={products} brandNames={brandNames} subcategories={collection.category?.subcategories} />
      </Suspense>
    </div>
  );
}
