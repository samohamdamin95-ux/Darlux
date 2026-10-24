import type { Metadata, Viewport } from 'next';
import { IBM_Plex_Sans_Arabic, Montserrat } from 'next/font/google';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { MiniCart } from '@/components/cart/MiniCart';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { QuickLook } from '@/components/product/QuickLook';
import { I18nProvider } from '@/components/providers/I18nProvider';
import { StoreHydrator } from '@/components/providers/StoreHydrator';
import { isLocale, locales, ogLocale } from '@/i18n/config';
import { getI18n } from '@/i18n/server';
import { getBrands, getCategories, getProducts, getSearchIndex, getSiteContent } from '@/lib/catalog';
import { metadataBase } from '@/lib/seo';
import '../globals.css';

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  style: ['normal', 'italic'],
  variable: '--font-montserrat',
  display: 'swap',
});

const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-plex-arabic',
  display: 'swap',
});

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const dynamicParams = false;

export const viewport: Viewport = {
  themeColor: '#0A0A0A',
  width: 'device-width',
  initialScale: 1,
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const { t } = getI18n(locale);
  return {
    metadataBase,
    title: { default: t('meta.homeTitle'), template: '%s | Darlux' },
    description: t('meta.defaultDescription'),
    applicationName: 'Darlux',
    openGraph: { siteName: 'Darlux', locale: ogLocale[locale], type: 'website' },
    twitter: { card: 'summary_large_image' },
    formatDetection: { telephone: false },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const { t, dir, dictionary } = getI18n(locale);
  const [categories, brands, products, searchIndex, content] = await Promise.all([
    getCategories(),
    getBrands(),
    getProducts(),
    getSearchIndex(locale),
    getSiteContent(),
  ]);

  const categoryBrands = Object.fromEntries(
    categories.map((category) => [
      category.slug,
      [...new Set(products.filter((product) => product.category === category.slug).map((product) => product.brand))],
    ]),
  );

  return (
    <html lang={locale} dir={dir} className={`${montserrat.variable} ${plexArabic.variable}`}>
      <body className="flex min-h-screen flex-col">
        <I18nProvider locale={locale} dictionary={dictionary}>
          <a
            href="#main"
            className="sr-only start-0 top-0 focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[200] focus:rounded focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:text-canvas"
          >
            {t('common.skipToContent')}
          </a>
          <AnnouncementBar items={content.announcements} />
          <Header
            locale={locale}
            categories={categories}
            brands={brands}
            categoryBrands={categoryBrands}
            searchIndex={searchIndex}
          />
          <main id="main" className="flex-1">
            {children}
          </main>
          <Footer locale={locale} categories={categories} />
          <MiniCart />
          <QuickLook />
          <StoreHydrator />
        </I18nProvider>
      </body>
    </html>
  );
}
