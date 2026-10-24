'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Children, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { useI18n } from '@/components/providers/I18nProvider';
import { cn } from '@/lib/utils';

interface CarouselProps {
  label: string;
  children: ReactNode;
  /** Tailwind width classes for each slide. */
  itemClassName?: string;
  className?: string;
}

/**
 * Horizontal rail with native scroll-snap (touch/trackpad friendly) and
 * previous/next buttons on larger screens. Works in both LTR and RTL.
 */
export function Carousel({
  label,
  children,
  itemClassName = 'w-[46%] sm:w-[31%] lg:w-[23%] xl:w-[19%]',
  className,
}: CarouselProps) {
  const { t, dir } = useI18n();
  const railRef = useRef<HTMLUListElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const update = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;
    // scrollLeft is negative in RTL in modern browsers; the absolute value is the distance travelled.
    const travelled = Math.abs(rail.scrollLeft);
    const max = rail.scrollWidth - rail.clientWidth;
    setCanPrev(travelled > 4);
    setCanNext(travelled < max - 4);
  }, []);

  useEffect(() => {
    update();
    const rail = railRef.current;
    if (!rail) return;
    const observer = new ResizeObserver(update);
    observer.observe(rail);
    return () => observer.disconnect();
  }, [update, children]);

  const scroll = (direction: 1 | -1) => {
    const rail = railRef.current;
    if (!rail) return;
    const sign = dir === 'rtl' ? -1 : 1;
    rail.scrollBy({ left: direction * sign * rail.clientWidth * 0.9, behavior: 'smooth' });
  };

  const PrevIcon = dir === 'rtl' ? ChevronRight : ChevronLeft;
  const NextIcon = dir === 'rtl' ? ChevronLeft : ChevronRight;

  return (
    <div className={cn('group/carousel relative', className)} role="region" aria-roledescription="carousel" aria-label={label}>
      <ul
        ref={railRef}
        onScroll={update}
        className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-4 pb-2 no-scrollbar md:mx-0 md:px-0"
      >
        {Children.map(children, (child) => (
          <li className={cn('shrink-0 snap-start', itemClassName)}>{child}</li>
        ))}
      </ul>
      <button
        type="button"
        onClick={() => scroll(-1)}
        disabled={!canPrev}
        aria-label={t('common.previous')}
        className="absolute start-0 top-[38%] z-10 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-canvas/95 shadow-card transition-all hover:border-ink disabled:pointer-events-none disabled:opacity-0 ltr:-translate-x-1/2 rtl:translate-x-1/2 md:flex"
      >
        <PrevIcon className="size-5" aria-hidden />
      </button>
      <button
        type="button"
        onClick={() => scroll(1)}
        disabled={!canNext}
        aria-label={t('common.next')}
        className="absolute end-0 top-[38%] z-10 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-canvas/95 shadow-card transition-all hover:border-ink disabled:pointer-events-none disabled:opacity-0 ltr:translate-x-1/2 rtl:-translate-x-1/2 md:flex"
      >
        <NextIcon className="size-5" aria-hidden />
      </button>
    </div>
  );
}
