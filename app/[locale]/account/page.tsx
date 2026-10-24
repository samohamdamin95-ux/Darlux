import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AccountView } from '@/components/account/AccountView';
import { Skeleton } from '@/components/ui/Skeleton';
import type { Locale } from '@/i18n/config';
import { getI18n } from '@/i18n/server';
import { getBrandNames } from '@/lib/page-helpers';
import { buildMetadata } from '@/lib/seo';

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const { t } = getI18n(locale);
  return buildMetadata({ locale, title: t('meta.accountTitle'), description: t('account.registerText'), path: '/account', noIndex: true });
}

export default async function AccountPage({ params }: Props) {
  const { locale } = await params;
  const { t } = getI18n(locale);
  const brandNames = await getBrandNames();

  return (
    <div className="container py-8 md:py-12">
      <h1 className="sr-only">{t('account.title')}</h1>
      <Suspense fallback={<Skeleton className="h-64 w-full" />}>
        <AccountView brandNames={brandNames} />
      </Suspense>
    </div>
  );
}
