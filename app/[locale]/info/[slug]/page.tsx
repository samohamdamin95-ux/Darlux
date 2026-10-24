import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { locales, type Locale } from '@/i18n/config';
import { getI18n } from '@/i18n/server';
import { getInfoPage, getInfoPages } from '@/lib/catalog';
import { buildMetadata } from '@/lib/seo';

type Props = { params: Promise<{ locale: Locale; slug: string }> };

export const dynamicParams = false;

export async function generateStaticParams() {
  const pages = await getInfoPages();
  return locales.flatMap((locale) => pages.map((page) => ({ locale, slug: page.slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const page = await getInfoPage(slug);
  if (!page) return {};
  return buildMetadata({ locale, title: page.title[locale], description: page.body[locale][0], path: `/info/${slug}` });
}

export default async function InfoPage({ params }: Props) {
  const { locale, slug } = await params;
  const page = await getInfoPage(slug);
  if (!page) notFound();
  const { t, href } = getI18n(locale);

  return (
    <div className="container max-w-3xl py-10 md:py-16">
      <Breadcrumbs label={t('common.breadcrumb')} items={[{ label: t('common.home'), href: href('/') }, { label: page.title[locale] }]} />
      <h1 className="heading-display mt-4">{page.title[locale]}</h1>
      <div className="mt-8 space-y-4 text-base leading-relaxed text-ink-soft">
        {page.body[locale].map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </div>
  );
}
