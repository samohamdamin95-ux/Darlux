import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProductCarousel } from '@/components/product/ProductCarousel';
import { ProductHero } from '@/components/product/ProductHero';
import { ProductInfoTabs } from '@/components/product/ProductInfoTabs';
import { RecentlyViewed } from '@/components/product/RecentlyViewed';
import { Reviews } from '@/components/product/Reviews';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { locales, type Locale } from '@/i18n/config';
import { getI18n } from '@/i18n/server';
import {
  getBrand,
  getCategory,
  getProductBySlug,
  getProducts,
  getRatingBreakdown,
  getRelatedProducts,
  getReviews,
} from '@/lib/catalog';
import { SITE_URL } from '@/lib/constants';
import { effectivePrice } from '@/lib/filters';
import { getBrandNames } from '@/lib/page-helpers';
import { buildMetadata } from '@/lib/seo';
import { localeHref } from '@/lib/utils';

type Props = { params: Promise<{ locale: Locale; slug: string }> };

export const dynamicParams = false;

export async function generateStaticParams() {
  const products = await getProducts();
  return locales.flatMap((locale) => products.map((product) => ({ locale, slug: product.slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  const { l } = getI18n(locale);
  const brand = await getBrand(product.brand);
  return buildMetadata({
    locale,
    title: `${l(product.name)} — ${brand?.name ?? ''}`,
    description: l(product.description),
    path: `/p/${slug}`,
    image: product.images[0],
  });
}

export default async function ProductPage({ params }: Props) {
  const { locale, slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const { t, l, href } = getI18n(locale);
  const [brand, category, related, reviews, breakdown, brandNames] = await Promise.all([
    getBrand(product.brand),
    getCategory(product.category),
    getRelatedProducts(product),
    getReviews(product),
    getRatingBreakdown(product),
    getBrandNames(),
  ]);
  if (!brand) notFound();

  // Structured data for rich results (price, availability, rating).
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    sku: product.id,
    name: l(product.name),
    description: l(product.description),
    image: product.images,
    brand: { '@type': 'Brand', name: brand.name },
    url: `${SITE_URL}${localeHref(locale, `/p/${product.slug}`)}`,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'USD',
      price: effectivePrice(product).toFixed(2),
      availability: 'https://schema.org/InStock',
    },
  };

  return (
    <div className="container py-6 md:py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />

      <Breadcrumbs
        label={t('common.breadcrumb')}
        className="mb-6"
        items={[
          { label: t('common.home'), href: href('/') },
          ...(category ? [{ label: l(category.name), href: href(`/c/${category.slug}`) }] : []),
          { label: l(product.name) },
        ]}
      />

      <ProductHero product={product} brand={brand} />

      <section className="mt-14 md:mt-20">
        <ProductInfoTabs product={product} />
      </section>

      <Reviews rating={product.rating} reviewCount={product.reviewCount} breakdown={breakdown} reviews={reviews} />

      <div className="-mx-4 md:-mx-6 lg:-mx-8">
        <ProductCarousel
          id="you-may-also-like"
          title={t('product.youMayAlsoLike')}
          products={related}
          brandNames={brandNames}
        />
      </div>
      <RecentlyViewed excludeId={product.id} brandNames={brandNames} />
    </div>
  );
}
