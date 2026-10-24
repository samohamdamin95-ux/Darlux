'use client';

import { Globe } from 'lucide-react';
import { usePathname } from 'next/navigation';
import type { MouseEvent } from 'react';
import { useI18n } from '@/components/providers/I18nProvider';
import { LOCALE_COOKIE, localeNames, locales, type Locale } from '@/i18n/config';
import { cn } from '@/lib/utils';

function swapLocale(pathname: string, target: Locale) {
  const parts = pathname.split('/');
  parts[1] = target;
  return parts.join('/') || `/${target}`;
}

/**
 * Switching language changes the root layout (lang/dir), so a full navigation
 * is expected — a plain anchor keeps it simple and works without JavaScript.
 */
export function LocaleSwitcher({ tone = 'light', className }: { tone?: 'light' | 'dark'; className?: string }) {
  const { t, locale } = useI18n();
  const pathname = usePathname();

  const onSelect = (event: MouseEvent<HTMLAnchorElement>, target: Locale) => {
    document.cookie = `${LOCALE_COOKIE}=${target}; path=/; max-age=31536000; samesite=lax`;
    if (window.location.search) {
      event.preventDefault();
      window.location.assign(swapLocale(pathname, target) + window.location.search);
    }
  };

  return (
    <div className={cn('flex items-center gap-2 text-sm', className)}>
      <Globe aria-hidden className="size-4 opacity-70" />
      <span className="sr-only">{t('common.language')}</span>
      <ul className="flex items-center gap-1">
        {locales.map((item) => {
          const active = item === locale;
          return (
            <li key={item}>
              <a
                href={swapLocale(pathname, item)}
                hrefLang={item}
                lang={item}
                aria-current={active ? 'true' : undefined}
                onClick={(event) => onSelect(event, item)}
                className={cn(
                  'rounded px-2 py-1 transition-colors',
                  tone === 'dark'
                    ? active
                      ? 'bg-white/10 text-white'
                      : 'text-white/70 hover:text-white'
                    : active
                      ? 'bg-canvas-muted font-semibold text-ink'
                      : 'text-ink-muted hover:text-ink',
                )}
              >
                {localeNames[item]}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
