'use client';

import { Search } from 'lucide-react';
import { useI18n } from '@/components/providers/I18nProvider';
import { ButtonLink } from '@/components/ui/Button';

/** Rendered inside the locale layout, so header, footer and language stay intact. */
export default function NotFound() {
  const { t, href } = useI18n();
  return (
    <div className="container flex flex-col items-center py-24 text-center md:py-32">
      <p className="text-8xl font-light tracking-tight text-accent md:text-9xl" dir="ltr">
        404
      </p>
      <h1 className="mt-6 text-2xl font-semibold md:text-3xl">{t('notFound.title')}</h1>
      <p className="mt-3 max-w-md text-ink-muted">{t('notFound.text')}</p>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <ButtonLink href={href('/')} size="lg">
          {t('notFound.home')}
        </ButtonLink>
        <ButtonLink href={href('/search')} variant="outline" size="lg">
          <Search className="size-4" aria-hidden />
          {t('notFound.search')}
        </ButtonLink>
      </div>
    </div>
  );
}
