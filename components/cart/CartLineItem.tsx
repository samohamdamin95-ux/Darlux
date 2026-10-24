'use client';

import { Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useI18n } from '@/components/providers/I18nProvider';
import { Money } from '@/components/ui/Price';
import { QuantitySelector } from '@/components/ui/QuantitySelector';
import { SmartImage } from '@/components/ui/SmartImage';
import { cn } from '@/lib/utils';
import { useCart, type CartLine } from '@/store/cart';
import { useWishlist } from '@/store/wishlist';

export function CartLineItem({ line, compact = false }: { line: CartLine; compact?: boolean }) {
  const { t, l, href } = useI18n();
  const setQuantity = useCart((state) => state.setQuantity);
  const remove = useCart((state) => state.remove);
  const toggleWishlist = useWishlist((state) => state.toggle);
  const inWishlist = useWishlist((state) => state.ids.includes(line.productId));
  const name = l(line.name);
  const productHref = href(`/p/${line.slug}${line.shade ? `?shade=${line.shade.id}` : ''}`);

  return (
    <li className={cn('flex gap-4', compact ? 'py-4' : 'py-6')}>
      <Link
        href={productHref}
        className={cn('relative shrink-0 overflow-hidden rounded bg-canvas-muted', compact ? 'size-20' : 'size-24 md:size-32')}
      >
        <SmartImage src={line.image} alt={name} fill sizes="128px" className="object-cover" />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-2xs font-semibold uppercase tracking-wider text-ink-muted">{line.brand}</p>
            <Link href={productHref} className="mt-0.5 line-clamp-2 text-sm font-medium hover:underline">
              {name}
            </Link>
            <div className="mt-1 space-y-0.5 text-xs text-ink-muted">
              {line.shade && (
                <p className="flex items-center gap-1.5">
                  <span aria-hidden className="size-3 rounded-full border border-line" style={{ backgroundColor: line.shade.hex }} />
                  {l(line.shade.name)}
                </p>
              )}
              {line.size && line.size.id !== 'std' && <p>{line.size.label}</p>}
            </div>
          </div>
          <div className="text-end text-sm">
            <Money amount={line.unitPrice * line.quantity} className="font-semibold" />
            {line.compareAtPrice && line.compareAtPrice > line.unitPrice && (
              <s className="block text-xs text-ink-muted">
                <Money amount={line.compareAtPrice * line.quantity} />
              </s>
            )}
          </div>
        </div>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3">
          <QuantitySelector
            size="sm"
            value={line.quantity}
            onChange={(quantity) => setQuantity(line.key, quantity)}
            label={`${t('product.quantity')}: ${name}`}
          />
          <div className="flex items-center gap-4 text-xs">
            {!compact && !inWishlist && (
              <button
                type="button"
                onClick={() => {
                  toggleWishlist(line.productId);
                  remove(line.key);
                }}
                className="link-underline"
              >
                {t('cart.moveToWishlist')}
              </button>
            )}
            <button
              type="button"
              onClick={() => remove(line.key)}
              aria-label={t('cart.removeItem', { name })}
              className="flex items-center gap-1 text-ink-muted transition-colors hover:text-danger"
            >
              <Trash2 className="size-4" aria-hidden />
              {!compact && t('common.remove')}
            </button>
          </div>
        </div>
      </div>
    </li>
  );
}
