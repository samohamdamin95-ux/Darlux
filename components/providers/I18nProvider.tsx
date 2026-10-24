'use client';

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { localeDirection, type Locale } from '@/i18n/config';
import { createTranslator, type Dictionary, type Translate } from '@/i18n/translator';
import type { LocalizedString } from '@/lib/types';
import { localeHref, localize } from '@/lib/utils';

interface I18nContextValue {
  locale: Locale;
  dir: 'rtl' | 'ltr';
  t: Translate;
  l: (value: LocalizedString) => string;
  href: (path: string) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({
  locale,
  dictionary,
  children,
}: {
  locale: Locale;
  dictionary: Dictionary;
  children: ReactNode;
}) {
  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      dir: localeDirection[locale],
      t: createTranslator(dictionary),
      l: (text) => localize(text, locale),
      href: (path) => localeHref(locale, path),
    }),
    [locale, dictionary],
  );
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useI18n must be used inside <I18nProvider>');
  return context;
}
