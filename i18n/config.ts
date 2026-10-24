import type { Locale } from '@/lib/types';

export type { Locale };

export const locales = ['ar', 'en'] as const satisfies readonly Locale[];

/** Arabic is the primary market; English is the secondary language. */
export const defaultLocale: Locale = 'ar';

/** Remembers the shopper's language choice for visits to unprefixed URLs. */
export const LOCALE_COOKIE = 'NEXT_LOCALE';

export const localeDirection: Record<Locale, 'rtl' | 'ltr'> = {
  ar: 'rtl',
  en: 'ltr',
};

export const localeNames: Record<Locale, string> = {
  ar: 'العربية',
  en: 'English',
};

/** BCP 47 tags used for Intl formatting and Open Graph. Latin digits keep prices scannable. */
export const intlLocale: Record<Locale, string> = {
  ar: 'ar-SA-u-nu-latn',
  en: 'en-US',
};

export const ogLocale: Record<Locale, string> = {
  ar: 'ar_SA',
  en: 'en_US',
};

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (locales as readonly string[]).includes(value);
}
