'use client';

import { Heart } from 'lucide-react';
import { useI18n } from '@/components/providers/I18nProvider';
import { cn } from '@/lib/utils';
import { useHydrated } from '@/store/ui';
import { useWishlist } from '@/store/wishlist';

export function WishlistButton({
  productId,
  productName,
  variant = 'icon',
  className,
}: {
  productId: string;
  productName: string;
  variant?: 'icon' | 'full';
  className?: string;
}) {
  const { t } = useI18n();
  const hydrated = useHydrated();
  const saved = useWishlist((state) => state.ids.includes(productId)) && hydrated;
  const toggle = useWishlist((state) => state.toggle);
  const label = saved ? t('product.removeFromWishlist') : t('product.addToWishlist');

  if (variant === 'full') {
    return (
      <button
        type="button"
        onClick={() => toggle(productId)}
        aria-pressed={saved}
        className={cn(
          'inline-flex h-12 items-center justify-center gap-2 rounded border border-ink px-5 text-sm font-semibold transition-colors hover:bg-canvas-muted',
          className,
        )}
      >
        <Heart aria-hidden className={cn('size-5 transition-transform', saved && 'scale-110 fill-accent text-accent')} />
        {label}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => toggle(productId)}
      aria-pressed={saved}
      aria-label={`${label}: ${productName}`}
      className={cn(
        'flex size-9 items-center justify-center rounded-full bg-canvas/90 text-ink shadow-sm backdrop-blur transition-all hover:scale-105 hover:bg-canvas',
        className,
      )}
    >
      <Heart aria-hidden className={cn('size-[18px] transition-all duration-300', saved && 'fill-accent text-accent')} />
    </button>
  );
}
