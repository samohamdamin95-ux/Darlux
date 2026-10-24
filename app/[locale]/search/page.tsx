import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { PlpHeader } from '@/components/plp/PlpHeader';
import { PlpView } from '@/components/plp/PlpView';
import { ProductGridSkeleton } from '@/components/ui/Skeleton';
import type { Locale } from '@/i18n/config';
import { getI18n } from '@/i18n/server';
import { searchProducts } from '@/lib/catalog';
import { getBrandNames } from '@/lib/page-helpers';
import { buildMetadata } from '@/lib/seo';

type Props = {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ q?: string | string[] }>;
};

const POPULAR = {
  ar: ['سيروم', 'أحمر شفاه', 'عود', 'كريم أساس', 'Lunaré'],
  en: ['Serum', 'Lipstick', 'Oud', 'Foundation', 'Lunaré'],
};

const readQuery = (q: string | string[] | undefined) => (Array.isArray(q) ? q[0] : q ?? '').trim().slice(0, 100);

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const [{ locale }, { q }] = await Promise.all([params, searchParams]);
  const { t } = getI18n(locale);
  const query = readQuery(q);
  return buildMetadata({
    locale,
    title: query ? t('search.resultsFor', { q: query }) : t('meta.searchTitle'),
    description: t('meta.defaultDescription'),
    path: '/search',
    noIndex: true,
  });
}

export default async function SearchPage({ params, searchParams }: Props) {
  const [{ locale }, { q }] = await Promise.all([params, searchParams]);
  const { t, href } = getI18n(locale);
  const query = readQuery(q);
  const [results, brandNames] = await Promise.all([searchProducts(query), getBrandNames()]);

  const title = !query
    ? t('search.emptyQuery')
    : results.length
      ? t('search.resultsFor', { q: query })
      : t('search.noResults', { q: query });

  return (
    <div className="container py-8 md:py-12">
      <PlpHeader
        breadcrumbLabel={t('common.breadcrumb')}
        crumbs={[{ label: t('common.home'), href: href('/') }, { label: t('search.title') }]}
        title={title}
        description={!query ? t('search.emptyQueryText') : !results.length ? t('search.noResultsText') : undefined}
      />

      {results.length > 0 ? (
        <Suspense key={query} fallback={<ProductGridSkeleton />}>
          <PlpView products={results} brandNames={brandNames} />
        </Suspense>
      ) : (
        <section aria-labelledby="popular-searches">
          <h2 id="popular-searches" className="eyebrow mb-4">
            {t('search.popular')}
          </h2>
          <ul className="flex flex-wrap gap-2">
            {POPULAR[locale].map((term) => (
              <li key={term}>
                <Link
                  href={href(`/search?q=${encodeURIComponent(term)}`)}
                  className="block rounded-full border border-line-strong px-4 py-2 text-sm transition-colors hover:border-ink hover:bg-ink hover:text-canvas"
                >
                  {term}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
