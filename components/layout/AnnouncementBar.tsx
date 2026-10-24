'use client';

import { Pause, Play } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useI18n } from '@/components/providers/I18nProvider';
import { useFormatPrice } from '@/components/ui/Price';
import { FREE_SHIPPING_THRESHOLD } from '@/lib/constants';
import type { SiteContent } from '@/lib/types';
import { cn, interpolate } from '@/lib/utils';

const INTERVAL = 5000;

/** Rotating promo strip with a pause control (WCAG 2.2.2). */
export function AnnouncementBar({ items }: { items: SiteContent['announcements'] }) {
  const { t, l, href } = useI18n();
  const format = useFormatPrice();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || items.length < 2) return;
    const timer = setInterval(() => setIndex((current) => (current + 1) % items.length), INTERVAL);
    return () => clearInterval(timer);
  }, [paused, items.length]);

  return (
    <section aria-label={t('announcement.label')} className="bg-ink text-canvas">
      <div className="container relative flex h-9 items-center justify-center">
        <div className="relative h-full w-full overflow-hidden">
          {items.map((item, i) => (
            <Link
              key={item.id}
              href={href(item.href)}
              aria-hidden={i !== index}
              tabIndex={i === index ? 0 : -1}
              className={cn(
                'absolute inset-0 flex items-center justify-center truncate px-10 text-center text-xs font-medium tracking-wide transition-all duration-500 ease-luxe hover:underline',
                i === index ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-2 opacity-0',
              )}
            >
              {interpolate(l(item.text), { threshold: format(FREE_SHIPPING_THRESHOLD) })}
            </Link>
          ))}
        </div>
        {items.length > 1 && (
          <button
            type="button"
            onClick={() => setPaused((value) => !value)}
            aria-label={paused ? t('announcement.play') : t('announcement.pause')}
            className="absolute end-2 rounded-full p-1.5 text-canvas/70 transition-colors hover:text-canvas md:end-4"
          >
            {paused ? <Play className="size-3" aria-hidden /> : <Pause className="size-3" aria-hidden />}
          </button>
        )}
      </div>
    </section>
  );
}
