import { localeHref, localize } from '@/lib/utils';
import type { LocalizedString } from '@/lib/types';
import { localeDirection, type Locale } from './config';
import ar from './dictionaries/ar.json';
import en from './dictionaries/en.json';
import { createTranslator, type Dictionary } from './translator';

const dictionaries: Record<Locale, Dictionary> = { ar, en };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

/** Server-side i18n helpers for a request's locale. */
export function getI18n(locale: Locale) {
  const dictionary = getDictionary(locale);
  return {
    locale,
    dir: localeDirection[locale],
    dictionary,
    t: createTranslator(dictionary),
    l: (value: LocalizedString) => localize(value, locale),
    href: (path: string) => localeHref(locale, path),
  };
}
