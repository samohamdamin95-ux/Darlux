import type { Metadata } from 'next';
import { CartPageView } from '@/components/cart/CartPageView';
import { RecentlyViewed } from '@/components/product/RecentlyViewed';
import type { Locale } from '@/i18n/config';
import { getI18n } from '@/i18n/server';
import { getBrandNames } from '@/lib/page-helpers';
import { buildMetadata } from '@/lib/seo';

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const { t } = getI18n(locale);
  return buildMetadata({ locale, title: t('meta.cartTitle'), description: t('meta.defaultDescription'), path: '/cart', noIndex: true });
}

export default async function CartPage({ params }: Props) {
  const { locale } = await params;
  const { t } = getI18n(locale);
  const brandNames = await getBrandNames();

  return (
    <div className="container py-8 md:py-12">
      <h1 className="heading-display mb-8 md:mb-10">{t('cart.title')}</h1>
      <CartPageView />
      <RecentlyViewed brandNames={brandNames} />
    </div>
  );
}
