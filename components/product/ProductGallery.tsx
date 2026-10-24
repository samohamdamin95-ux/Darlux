'use client';

import { ZoomIn } from 'lucide-react';
import { useRef, useState, type MouseEvent } from 'react';
import { useI18n } from '@/components/providers/I18nProvider';
import { SmartImage } from '@/components/ui/SmartImage';
import { cn } from '@/lib/utils';

interface ProductGalleryProps {
  images: string[];
  name: string;
  activeIndex: number;
  onSelect: (index: number) => void;
}

/**
 * Main image + thumbnails. Click (or Enter) toggles a 2× zoom that follows the
 * pointer; swiping is supported through the thumbnail rail on touch devices.
 */
export function ProductGallery({ images, name, activeIndex, onSelect }: ProductGalleryProps) {
  const { t } = useI18n();
  const [zoomed, setZoomed] = useState(false);
  const [origin, setOrigin] = useState('50% 50%');
  const frameRef = useRef<HTMLButtonElement>(null);

  const onMove = (event: MouseEvent) => {
    const rect = frameRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setOrigin(`${x}% ${y}%`);
  };

  return (
    <div className="flex flex-col gap-3 md:flex-row-reverse md:items-start md:gap-4">
      <button
        ref={frameRef}
        type="button"
        onClick={() => setZoomed((value) => !value)}
        onMouseMove={zoomed ? onMove : undefined}
        onMouseLeave={() => setZoomed(false)}
        aria-label={zoomed ? t('product.zoomOut') : t('product.zoom')}
        className={cn(
          'relative aspect-square w-full overflow-hidden rounded bg-canvas-muted md:flex-1',
          zoomed ? 'cursor-zoom-out' : 'cursor-zoom-in',
        )}
      >
        {images.map((src, index) => (
          <SmartImage
            key={src + index}
            src={src}
            alt={index === activeIndex ? `${name} — ${t('product.imageOf', { n: index + 1, total: images.length })}` : ''}
            fill
            priority={index === 0}
            sizes="(min-width: 1024px) 50vw, 100vw"
            style={{ transformOrigin: origin }}
            className={cn(
              'object-cover !transition-[opacity,transform] duration-300 ease-out',
              index === activeIndex ? 'opacity-100' : '!opacity-0',
              zoomed && index === activeIndex ? 'scale-[2]' : 'scale-100',
            )}
          />
        ))}
        <span className="pointer-events-none absolute bottom-3 end-3 flex size-9 items-center justify-center rounded-full bg-canvas/90 shadow-sm">
          <ZoomIn className="size-4" aria-hidden />
        </span>
      </button>

      {images.length > 1 && (
        <ul
          aria-label={t('product.gallery')}
          className="flex gap-2 overflow-x-auto no-scrollbar md:w-20 md:flex-col md:overflow-visible"
        >
          {images.map((src, index) => (
            <li key={src + index} className="shrink-0">
              <button
                type="button"
                onClick={() => onSelect(index)}
                aria-label={t('product.imageOf', { n: index + 1, total: images.length })}
                aria-current={index === activeIndex ? 'true' : undefined}
                className={cn(
                  'relative block size-16 overflow-hidden rounded border bg-canvas-muted transition-colors md:size-20',
                  index === activeIndex ? 'border-ink' : 'border-transparent hover:border-line-strong',
                )}
              >
                <SmartImage src={src} alt="" fill sizes="80px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
