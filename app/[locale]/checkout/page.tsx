import type { Metadata } from 'next';
import { CheckoutFlow } from '@/components/checkout/CheckoutFlow';
import type { Locale } from '@/i18n/config';
import { getI18n } from '@/i18n/server';
import { buildMetadata } from '@/lib/seo';

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const { t } = getI18n(locale);
  return buildMetadata({
    locale,
    title: t('meta.checkoutTitle'),
    description: t('meta.defaultDescription'),
    path: '/checkout',
    noIndex: true,
  });
}

export default async function CheckoutPage({ params }: Props) {
  const { locale } = await params;
  const { t } = getI18n(locale);
  return (
    <div className="container max-w-6xl py-8 md:py-12">
      <h1 className="heading-display mb-8">{t('checkout.title')}</h1>
      <CheckoutFlow />
    </div>
  );
}
