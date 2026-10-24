import type { MetadataRoute } from 'next';
import { locales } from '@/i18n/config';
import { COLLECTION_SLUGS, getBrands, getInfoPages, getProducts } from '@/lib/catalog';
import { SITE_URL } from '@/lib/constants';
import { localeHref } from '@/lib/utils';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, brands, pages] = await Promise.all([getProducts(), getBrands(), getInfoPages()]);
  const paths = [
    '/',
    '/brands',
    '/quiz',
    ...COLLECTION_SLUGS.map((slug) => `/c/${slug}`),
    ...brands.map((brand) => `/brands/${brand.slug}`),
    ...products.map((product) => `/p/${product.slug}`),
    ...pages.map((page) => `/info/${page.slug}`),
  ];

  return paths.map((path) => ({
    url: `${SITE_URL}${localeHref('ar', path)}`,
    changeFrequency: path.startsWith('/p/') ? 'weekly' : 'daily',
    priority: path === '/' ? 1 : path.startsWith('/c/') ? 0.8 : 0.6,
    alternates: {
      languages: Object.fromEntries(locales.map((locale) => [locale, `${SITE_URL}${localeHref(locale, path)}`])),
    },
  }));
}
