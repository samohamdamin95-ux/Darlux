import { intlLocale } from '@/i18n/config';
import type { Locale } from './types';

export type CurrencyCode = 'SAR' | 'AED' | 'USD';

/** Static demo rates from the base currency (USD). Replace with live rates from your backend. */
export const CURRENCIES: Record<CurrencyCode, { rate: number; label: string }> = {
  SAR: { rate: 3.75, label: 'SAR' },
  AED: { rate: 3.67, label: 'AED' },
  USD: { rate: 1, label: 'USD' },
};

export const DEFAULT_CURRENCY: CurrencyCode = 'SAR';

const formatters = new Map<string, Intl.NumberFormat>();

function getFormatter(locale: Locale, currency: CurrencyCode) {
  const key = `${locale}-${currency}`;
  let formatter = formatters.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat(intlLocale[locale], {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
    formatters.set(key, formatter);
  }
  return formatter;
}

export function convert(amountUsd: number, currency: CurrencyCode) {
  return Math.round(amountUsd * CURRENCIES[currency].rate * 100) / 100;
}

export function formatPrice(amountUsd: number, currency: CurrencyCode, locale: Locale) {
  return getFormatter(locale, currency).format(convert(amountUsd, currency));
}

export function formatNumber(value: number, locale: Locale) {
  return new Intl.NumberFormat(intlLocale[locale]).format(value);
}

export function formatDate(iso: string, locale: Locale) {
  return new Intl.DateTimeFormat(intlLocale[locale], { dateStyle: 'medium' }).format(new Date(iso));
}
