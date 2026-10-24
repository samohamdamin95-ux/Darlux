import { Sparkles } from 'lucide-react';
import { ButtonLink } from '@/components/ui/Button';
import { SmartImage } from '@/components/ui/SmartImage';
import type { Translate } from '@/i18n/translator';

const IMAGE = 'https://images.unsplash.com/photo-1526045478516-99145907023c?auto=format&fit=crop&w=1200&q=80';

export function QuizCta({ t, href }: { t: Translate; href: string }) {
  return (
    <section aria-labelledby="quiz-cta" className="container py-10 md:py-14">
      <div className="grid items-center gap-8 overflow-hidden rounded bg-accent-soft md:grid-cols-2">
        <div className="relative aspect-[4/3] md:order-last md:aspect-auto md:h-full md:min-h-[380px]">
          <SmartImage src={IMAGE} alt="" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
        </div>
        <div className="p-8 md:p-12">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-luxe text-accent">
            <Sparkles className="size-4" aria-hidden /> {t('home.quiz.eyebrow')}
          </p>
          <h2 id="quiz-cta" className="mt-4 text-3xl font-semibold leading-tight md:text-4xl">
            {t('home.quiz.title')}
          </h2>
          <p className="mt-4 max-w-md text-ink-soft">{t('home.quiz.text')}</p>
          <ButtonLink href={href} variant="accent" size="lg" className="mt-8">
            {t('home.quiz.cta')}
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
