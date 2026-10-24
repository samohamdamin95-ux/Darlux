import type { Metadata } from 'next';
import { QuizView } from '@/components/quiz/QuizView';
import type { Locale } from '@/i18n/config';
import { getI18n } from '@/i18n/server';
import { getProducts } from '@/lib/catalog';
import { getBrandNames } from '@/lib/page-helpers';
import { buildMetadata } from '@/lib/seo';

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const { t } = getI18n(locale);
  return buildMetadata({ locale, title: t('meta.quizTitle'), description: t('home.quiz.text'), path: '/quiz' });
}

export default async function QuizPage({ params }: Props) {
  const { locale } = await params;
  const { t } = getI18n(locale);
  const [products, brandNames] = await Promise.all([getProducts(), getBrandNames()]);
  // Only skin-relevant products are candidates for recommendations.
  const candidates = products.filter((product) => product.skinTypes.length > 0 || product.concerns.length > 0);

  return (
    <div className="container py-12 md:py-20">
      <header className="mb-12 text-center">
        <p className="eyebrow text-accent">{t('home.quiz.eyebrow')}</p>
        <h1 className="heading-display mt-3">{t('quiz.title')}</h1>
        <p className="mt-3 text-ink-muted">{t('quiz.intro')}</p>
      </header>
      <QuizView products={candidates} brandNames={brandNames} />
    </div>
  );
}
