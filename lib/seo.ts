import type { Metadata } from 'next';
import { locales, ogLocale, type Locale } from '@/i18n/config';
import { SITE_URL } from './constants';
import { localeHref } from './utils';

const DEFAULT_OG_IMAGE =
  'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&h=630&q=80';

interface PageMetaInput {
  locale: Locale;
  title?: string;
  description: string;
  /** Path without the locale prefix, e.g. "/c/makeup". */
  path: string;
  image?: string;
  type?: 'website' | 'article';
  noIndex?: boolean;
}

/** Canonical URL, hreflang alternates, Open Graph and Twitter cards for a page. */
export function buildMetadata({ locale, title, description, path, image, type = 'website', noIndex }: PageMetaInput): Metadata {
  const url = localeHref(locale, path);
  const languages = Object.fromEntries(locales.map((item) => [item, localeHref(item, path)]));
  const images = [{ url: image ?? DEFAULT_OG_IMAGE, width: 1200, height: 630 }];

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: { ...languages, 'x-default': localeHref('ar', path) },
    },
    openGraph: {
      type,
      url,
      title,
      description,
      siteName: 'Darlux',
      locale: ogLocale[locale],
      alternateLocale: locales.filter((item) => item !== locale).map((item) => ogLocale[item]),
      images,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: images.map((item) => item.url),
    },
    robots: noIndex ? { index: false, follow: true } : undefined,
  };
}

export const metadataBase = new URL(SITE_URL);
