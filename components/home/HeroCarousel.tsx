'use client';

import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useI18n } from '@/components/providers/I18nProvider';
import { ButtonLink } from '@/components/ui/Button';
import { SmartImage } from '@/components/ui/SmartImage';
import type { HeroSlide } from '@/lib/types';
import { cn } from '@/lib/utils';

const INTERVAL = 6500;

/**
 * Autoplaying hero (pauses on hover/focus, honours prefers-reduced-motion and
 * has an explicit pause button). Slides cross-fade; only the first image is
 * loaded with priority.
 */
export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const { t, l, href, dir } = useI18n();
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) setPlaying(false);
  }, []);

  const go = useCallback((next: number) => setIndex((next + slides.length) % slides.length), [slides.length]);

  useEffect(() => {
    if (!playing || hovered) return;
    const timer = setTimeout(() => go(index + 1), INTERVAL);
    return () => clearTimeout(timer);
  }, [playing, hovered, index, go]);

  const PrevIcon = dir === 'rtl' ? ChevronRight : ChevronLeft;
  const NextIcon = dir === 'rtl' ? ChevronLeft : ChevronRight;

  return (
    <section
      aria-roledescription="carousel"
      aria-label={t('home.heroLabel')}
      className="relative overflow-hidden bg-ink"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setHovered(true)}
      onBlurCapture={() => setHovered(false)}
    >
      <div className="relative h-[68vh] min-h-[440px] max-h-[720px]">
        {slides.map((slide, i) => {
          const active = i === index;
          return (
            <div
              key={slide.id}
              role="group"
              aria-roledescription="slide"
              aria-label={t('home.slide', { n: i + 1, total: slides.length })}
              aria-hidden={!active}
              className={cn(
                'absolute inset-0 transition-opacity duration-1000 ease-luxe',
                active ? 'z-10 opacity-100' : 'pointer-events-none opacity-0',
              )}
            >
              <SmartImage
                src={slide.image}
                alt=""
                fill
                priority={i === 0}
                sizes="100vw"
                className={cn('object-cover transition-transform duration-[8000ms] ease-out', active ? 'scale-105' : 'scale-100')}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent ltr:md:bg-gradient-to-r rtl:md:bg-gradient-to-l md:from-black/65 md:via-black/20" />
              <div className="container relative flex h-full items-end pb-20 md:items-center md:pb-0">
                <div
                  className={cn(
                    'max-w-xl text-white transition-all delay-200 duration-700 ease-luxe',
                    active ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
                  )}
                >
                  <p className="text-xs font-semibold uppercase tracking-luxe text-white/80">{l(slide.eyebrow)}</p>
                  {i === 0 ? (
                    <h1 className="mt-3 text-4xl font-semibold leading-tight tracking-tight md:text-6xl">{l(slide.title)}</h1>
                  ) : (
                    <h2 className="mt-3 text-4xl font-semibold leading-tight tracking-tight md:text-6xl">{l(slide.title)}</h2>
                  )}
                  <p className="mt-4 max-w-md text-base text-white/85 md:text-lg">{l(slide.subtitle)}</p>
                  <ButtonLink href={href(slide.href)} variant="inverse" size="lg" className="mt-8" tabIndex={active ? 0 : -1}>
                    {l(slide.cta)}
                  </ButtonLink>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="container absolute inset-x-0 bottom-6 z-20 flex items-center gap-3">
        <div className="flex items-center gap-2">
          {slides.map((slide, i) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => go(i)}
              aria-label={t('home.goToSlide', { n: i + 1 })}
              aria-current={i === index ? 'true' : undefined}
              className="group py-2"
            >
              <span
                className={cn(
                  'block h-0.5 rounded-full transition-all duration-500',
                  i === index ? 'w-10 bg-white' : 'w-5 bg-white/40 group-hover:bg-white/70',
                )}
              />
            </button>
          ))}
        </div>
        <div className="ms-auto flex items-center gap-1 text-white">
          <button type="button" onClick={() => go(index - 1)} aria-label={t('common.previous')} className="rounded-full p-2 hover:bg-white/10">
            <PrevIcon className="size-5" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => setPlaying((value) => !value)}
            aria-label={playing ? t('home.pause') : t('home.play')}
            className="rounded-full p-2 hover:bg-white/10"
          >
            {playing ? <Pause className="size-4" aria-hidden /> : <Play className="size-4" aria-hidden />}
          </button>
          <button type="button" onClick={() => go(index + 1)} aria-label={t('common.next')} className="rounded-full p-2 hover:bg-white/10">
            <NextIcon className="size-5" aria-hidden />
          </button>
        </div>
      </div>
    </section>
  );
}
