import type { Metadata } from 'next';
import { WishlistGrid } from '@/components/account/WishlistGrid';
import type { Locale } from '@/i18n/config';
import { getI18n } from '@/i18n/server';
import { getBrandNames } from '@/lib/page-helpers';
import { buildMetadata } from '@/lib/seo';

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const { t } = getI18n(locale);
  return buildMetadata({ locale, title: t('meta.wishlistTitle'), description: t('wishlist.emptyText'), path: '/wishlist', noIndex: true });
}

export default async function WishlistPage({ params }: Props) {
  const { locale } = await params;
  const { t } = getI18n(locale);
  const brandNames = await getBrandNames();

  return (
    <div className="container py-8 md:py-12">
      <h1 className="heading-display mb-4">{t('wishlist.title')}</h1>
      <WishlistGrid brandNames={brandNames} />
    </div>
  );
}
