'use client';

import { BadgeCheck, ThumbsUp } from 'lucide-react';
import { useId, useMemo, useState } from 'react';
import { useI18n } from '@/components/providers/I18nProvider';
import { Button } from '@/components/ui/Button';
import { Rating } from '@/components/ui/Rating';
import { formatDate, formatNumber } from '@/lib/format';
import type { Review } from '@/lib/types';
import { cn } from '@/lib/utils';

type ReviewSort = 'recent' | 'highest' | 'lowest' | 'helpful';

const PAGE = 4;

interface ReviewsProps {
  rating: number;
  reviewCount: number;
  breakdown: number[];
  reviews: Review[];
}

export function Reviews({ rating, reviewCount, breakdown, reviews }: ReviewsProps) {
  const { t, l, locale } = useI18n();
  const sortId = useId();
  const [stars, setStars] = useState<number | null>(null);
  const [sort, setSort] = useState<ReviewSort>('recent');
  const [visible, setVisible] = useState(PAGE);

  const list = useMemo(() => {
    const filtered = stars ? reviews.filter((review) => review.rating === stars) : reviews;
    return [...filtered].sort((a, b) => {
      if (sort === 'highest') return b.rating - a.rating;
      if (sort === 'lowest') return a.rating - b.rating;
      if (sort === 'helpful') return b.helpful - a.helpful;
      return b.date.localeCompare(a.date);
    });
  }, [reviews, stars, sort]);

  const filterBy = (value: number | null) => {
    setStars(value);
    setVisible(PAGE);
  };

  return (
    <section id="reviews" aria-labelledby="reviews-heading" className="scroll-mt-40 border-t border-line py-12 md:py-16">
      <h2 id="reviews-heading" className="heading-section">
        {t('reviews.title')}
      </h2>

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-16">
        <div>
          <div className="flex items-end gap-3">
            <span className="text-5xl font-semibold tabular-nums">{rating.toFixed(1)}</span>
            <div className="pb-1.5">
              <Rating value={rating} size="md" label={t('product.ratingLabel', { rating })} />
              <p className="mt-1 text-xs text-ink-muted">{t('reviews.basedOn', { count: formatNumber(reviewCount, locale) })}</p>
            </div>
          </div>

          <ul className="mt-6 space-y-2" aria-label={t('reviews.filterBy')}>
            {breakdown.map((count, index) => {
              const value = 5 - index;
              const percent = reviewCount ? (count / reviewCount) * 100 : 0;
              const active = stars === value;
              return (
                <li key={value}>
                  <button
                    type="button"
                    onClick={() => filterBy(active ? null : value)}
                    aria-pressed={active}
                    className={cn('group flex w-full items-center gap-3 rounded px-1 py-1 text-xs', active && 'bg-canvas-muted')}
                  >
                    <span className="w-14 shrink-0 text-start">{t('reviews.stars', { n: value })}</span>
                    <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-canvas-muted">
                      <span
                        className="block h-full rounded-full bg-ink transition-all group-hover:bg-accent"
                        style={{ width: `${percent}%` }}
                      />
                    </span>
                    <span className="w-12 shrink-0 text-end tabular-nums text-ink-muted">{formatNumber(count, locale)}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
            <div className="flex flex-wrap gap-2" role="group" aria-label={t('reviews.filterBy')}>
              {[null, 5, 4, 3, 2, 1].map((value) => (
                <button
                  key={value ?? 'all'}
                  type="button"
                  onClick={() => filterBy(value)}
                  aria-pressed={stars === value}
                  className={cn(
                    'rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors',
                    stars === value ? 'border-ink bg-ink text-canvas' : 'border-line-strong hover:border-ink',
                  )}
                >
                  {value ? `${value}★` : t('reviews.all')}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <label htmlFor={sortId} className="text-ink-muted">
                {t('reviews.sortBy')}
              </label>
              <select
                id={sortId}
                value={sort}
                onChange={(event) => setSort(event.target.value as ReviewSort)}
                className="h-9 rounded border border-line-strong bg-canvas px-2 text-sm focus:border-ink focus:outline-none"
              >
                {(['recent', 'highest', 'lowest', 'helpful'] as const).map((key) => (
                  <option key={key} value={key}>
                    {t(`reviews.sort.${key}`)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {list.length === 0 ? (
            <p className="py-10 text-sm text-ink-muted">{t('reviews.none')}</p>
          ) : (
            <ul className="divide-y divide-line">
              {list.slice(0, visible).map((review) => (
                <li key={review.id} className="py-6">
                  <article>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <Rating value={review.rating} label={t('product.ratingLabel', { rating: review.rating })} />
                      <time dateTime={review.date} className="text-xs text-ink-muted">
                        {formatDate(review.date, locale)}
                      </time>
                    </div>
                    <h3 className="mt-3 font-semibold">{l(review.title)}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{l(review.body)}</p>
                    <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-ink-muted">
                      <span className="font-semibold text-ink" dir="auto">
                        {review.author}
                      </span>
                      {review.verified && (
                        <span className="flex items-center gap-1 text-success">
                          <BadgeCheck className="size-3.5" aria-hidden />
                          {t('reviews.verified')}
                        </span>
                      )}
                      <span>{t('reviews.skinType', { type: t(`values.skinTypes.${review.skinType}`) })}</span>
                      <span className="ms-auto flex items-center gap-1">
                        <ThumbsUp className="size-3.5" aria-hidden />
                        {t('reviews.helpful', { count: review.helpful })}
                      </span>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          )}

          {list.length > 0 && (
            <div className="mt-4 flex flex-col items-center gap-3">
              <p className="text-xs text-ink-muted">{t('reviews.showing', { shown: Math.min(visible, list.length), total: list.length })}</p>
              {visible < list.length && (
                <Button variant="outline" onClick={() => setVisible((count) => count + PAGE)}>
                  {t('reviews.showMore')}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
