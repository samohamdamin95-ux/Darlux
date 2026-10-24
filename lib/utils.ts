import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Locale, LocalizedString } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Picks the string for the active locale, falling back to English. */
export function localize(value: LocalizedString, locale: Locale) {
  return value[locale] || value.en;
}

/** Prefixes an internal path with the locale segment: ('/c/makeup', 'en') → '/en/c/makeup'. */
export function localeHref(locale: Locale, path: string) {
  if (/^https?:\/\//.test(path)) return path;
  const clean = path.startsWith('/') ? path : `/${path}`;
  return clean === '/' ? `/${locale}` : `/${locale}${clean}`;
}

/** Replaces `{name}` placeholders. */
export function interpolate(template: string, vars?: Record<string, string | number>) {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in vars ? String(vars[key]) : match,
  );
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
