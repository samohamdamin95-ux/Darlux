import type { Metadata } from 'next';
import { BrandsStrip } from '@/components/home/BrandsStrip';
import { CategoryTiles } from '@/components/home/CategoryTiles';
import { HeroCarousel } from '@/components/home/HeroCarousel';
import { LoyaltyBanner } from '@/components/home/LoyaltyBanner';
import { PromoBanners } from '@/components/home/PromoBanners';
import { QuizCta } from '@/components/home/QuizCta';
import { ProductCarousel } from '@/components/product/ProductCarousel';
import type { Locale } from '@/i18n/config';
import { getI18n } from '@/i18n/server';
import { getBrands, getCategories, getProductsByTag, getSiteContent } from '@/lib/catalog';
import { buildMetadata } from '@/lib/seo';

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const { t } = getI18n(locale);
  return buildMetadata({
    locale,
    title: t('meta.homeTitle'),
    description: t('meta.defaultDescription'),
    path: '/',
  });
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  const { t, l, href } = getI18n(locale);
  const [content, categories, brands, newArrivals, bestsellers, justDropped] = await Promise.all([
    getSiteContent(),
    getCategories(),
    getBrands(),
    getProductsByTag('new'),
    getProductsByTag('bestseller'),
    getProductsByTag('just-dropped'),
  ]);
  const brandNames = Object.fromEntries(brands.map((brand) => [brand.slug, brand.name]));

  return (
    <>
      <HeroCarousel slides={content.heroSlides} />

      <CategoryTiles
        title={t('home.shopByCategory')}
        categories={categories}
        sale={{ label: t('header.sale'), tagline: t('header.saleTagline'), href: '/c/sale' }}
        getName={(category) => l(category.name)}
        getHref={href}
      />

      <ProductCarousel
        id="new-arrivals"
        title={t('home.newArrivals')}
        products={newArrivals}
        brandNames={brandNames}
        action={{ label: t('common.viewAll'), href: href('/c/new') }}
      />

      <PromoBanners
        banners={content.promoBanners}
        getText={(banner) => ({ eyebrow: l(banner.eyebrow), title: l(banner.title), cta: l(banner.cta) })}
        getHref={href}
      />

      <ProductCarousel
        id="bestsellers"
        title={t('home.bestsellers')}
        products={bestsellers}
        brandNames={brandNames}
      />

      <BrandsStrip
        title={t('home.brandsTitle')}
        subtitle={t('home.brandsSubtitle')}
        brands={brands}
        getHref={href}
        action={{ label: t('header.allBrands'), href: href('/brands') }}
      />

      <ProductCarousel
        id="just-dropped"
        title={t('home.justDropped')}
        products={justDropped}
        brandNames={brandNames}
        action={{ label: t('common.viewAll'), href: href('/c/new?sort=new') }}
      />

      <LoyaltyBanner t={t} href={href('/account')} />
      <QuizCta t={t} href={href('/quiz')} />
    </>
  );
}
