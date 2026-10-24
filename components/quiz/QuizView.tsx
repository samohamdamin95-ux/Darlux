'use client';

import { RotateCcw } from 'lucide-react';
import { useRef, useState } from 'react';
import { ProductCard } from '@/components/product/ProductCard';
import { useI18n } from '@/components/providers/I18nProvider';
import { Button, ButtonLink } from '@/components/ui/Button';
import type { Concern, Finish, Product, SkinType } from '@/lib/types';
import { cn } from '@/lib/utils';

const SKIN: SkinType[] = ['dry', 'oily', 'combination', 'normal', 'sensitive'];
const CONCERN: Concern[] = ['hydration', 'acne', 'aging', 'dullness', 'dark-spots', 'pores'];
const FINISH: Finish[] = ['matte', 'natural', 'dewy', 'radiant'];

interface Answers {
  skin: SkinType | null;
  concern: Concern | null;
  finish: Finish | null;
}

/** Scores products against the answers; ties are broken by rating. */
function recommend(products: Product[], answers: Answers) {
  return products
    .map((product) => {
      let score = 0;
      if (answers.skin && product.skinTypes.includes(answers.skin)) score += 3;
      if (answers.concern && product.concerns.includes(answers.concern)) score += 4;
      if (answers.finish && product.finish === answers.finish) score += 2;
      return { product, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || b.product.rating - a.product.rating)
    .slice(0, 8)
    .map((item) => item.product);
}

export function QuizView({ products, brandNames }: { products: Product[]; brandNames: Record<string, string> }) {
  const { t, href } = useI18n();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({ skin: null, concern: null, finish: null });
  const headingRef = useRef<HTMLHeadingElement>(null);

  const questions = [
    { key: 'skin' as const, title: t('quiz.q1'), options: SKIN.map((value) => ({ value, label: t(`values.skinTypes.${value}`) })) },
    { key: 'concern' as const, title: t('quiz.q2'), options: CONCERN.map((value) => ({ value, label: t(`values.concerns.${value}`) })) },
    { key: 'finish' as const, title: t('quiz.q3'), options: FINISH.map((value) => ({ value, label: t(`values.finishes.${value}`) })) },
  ];

  const answer = (key: keyof Answers, value: string) => {
    setAnswers((current) => ({ ...current, [key]: value }));
    setStep((current) => current + 1);
    requestAnimationFrame(() => headingRef.current?.focus());
  };

  const restart = () => {
    setAnswers({ skin: null, concern: null, finish: null });
    setStep(0);
    requestAnimationFrame(() => headingRef.current?.focus());
  };

  if (step >= questions.length) {
    const results = recommend(products, answers);
    return (
      <div>
        <div className="mx-auto max-w-2xl text-center">
          <h2 ref={headingRef} tabIndex={-1} className="text-3xl font-semibold outline-none">
            {t('quiz.results')}
          </h2>
          <p className="mt-3 text-ink-muted">
            {t('quiz.resultsText', {
              skin: t(`values.skinTypes.${answers.skin!}`),
              concern: t(`values.concerns.${answers.concern!}`),
            })}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button variant="outline" onClick={restart}>
              <RotateCcw className="size-4" aria-hidden /> {t('quiz.restart')}
            </Button>
            <ButtonLink href={href('/c/skincare')}>{t('quiz.seeAll')}</ButtonLink>
          </div>
        </div>
        <ul className="mt-12 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 xl:grid-cols-4">
          {results.map((product) => (
            <li key={product.id}>
              <ProductCard product={product} brandName={brandNames[product.brand] ?? product.brand} />
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const question = questions[step];
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-xs text-ink-muted">{t('quiz.step', { n: step + 1, total: questions.length })}</p>
      <div className="mx-auto mt-3 flex max-w-xs gap-1.5" aria-hidden>
        {questions.map((item, index) => (
          <span key={item.key} className={cn('h-1 flex-1 rounded-full transition-colors', index <= step ? 'bg-accent' : 'bg-canvas-muted')} />
        ))}
      </div>
      <h2 ref={headingRef} tabIndex={-1} className="mt-8 text-2xl font-semibold outline-none md:text-3xl">
        {question.title}
      </h2>
      <ul className="mt-8 grid gap-3 sm:grid-cols-2">
        {question.options.map((option) => (
          <li key={option.value}>
            <button
              type="button"
              onClick={() => answer(question.key, option.value)}
              aria-pressed={answers[question.key] === option.value}
              className="h-14 w-full rounded border border-line-strong text-sm font-semibold transition-all hover:-translate-y-0.5 hover:border-ink hover:shadow-card"
            >
              {option.label}
            </button>
          </li>
        ))}
      </ul>
      {step > 0 && (
        <button type="button" onClick={() => setStep(step - 1)} className="mt-8 text-sm link-underline">
          {t('common.back')}
        </button>
      )}
    </div>
  );
}
