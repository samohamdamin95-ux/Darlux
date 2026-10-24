'use client';

import { Check, Gift, RotateCcw, Truck } from 'lucide-react';
import { useEffect, useId, useState } from 'react';
import { useI18n } from '@/components/providers/I18nProvider';
import { Button } from '@/components/ui/Button';
import { Price, useFormatPrice } from '@/components/ui/Price';
import { QuantitySelector } from '@/components/ui/QuantitySelector';
import { FREE_SHIPPING_THRESHOLD, POINTS_PER_DOLLAR } from '@/lib/constants';
import type { Product, Shade } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useCart } from '@/store/cart';
import { useUi } from '@/store/ui';
import { WishlistButton } from './WishlistButton';

interface PurchasePanelProps {
  product: Product;
  brandName: string;
  initialShadeId?: string | null;
  onShadeChange?: (shade: Shade) => void;
  compact?: boolean;
}

/** Shade, size and quantity selection with Add to basket / wishlist. */
export function PurchasePanel({ product, brandName, initialShadeId, onShadeChange, compact }: PurchasePanelProps) {
  const { t, l } = useI18n();
  const id = useId();
  const format = useFormatPrice();
  const add = useCart((state) => state.add);
  const openMiniCart = useUi((state) => state.openMiniCart);

  const [shadeId, setShadeId] = useState(
    product.shades.find((shade) => shade.id === initialShadeId)?.id ?? product.shades[0]?.id ?? null,
  );
  const [sizeId, setSizeId] = useState(product.sizes[0]?.id);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const shade = product.shades.find((item) => item.id === shadeId) ?? null;
  const size = product.sizes.find((item) => item.id === sizeId) ?? product.sizes[0];
  const unitPrice = size.salePrice ?? size.price;
  const name = l(product.name);

  useEffect(() => {
    if (!added) return;
    const timer = setTimeout(() => setAdded(false), 2000);
    return () => clearTimeout(timer);
  }, [added]);

  const selectShade = (next: Shade) => {
    setShadeId(next.id);
    onShadeChange?.(next);
  };

  const addToBasket = () => {
    add(
      {
        productId: product.id,
        slug: product.slug,
        brand: brandName,
        name: product.name,
        image: product.images[shade?.imageIndex ?? 0],
        shade: shade ? { id: shade.id, name: shade.name, hex: shade.hex } : null,
        size: { id: size.id, label: size.label },
        unitPrice,
        compareAtPrice: size.salePrice !== null ? size.price : null,
      },
      quantity,
    );
    setAdded(true);
    openMiniCart();
  };

  return (
    <div className="space-y-6">
      <Price price={size.price} salePrice={size.salePrice} size="lg" />

      {product.shades.length > 0 && (
        <fieldset>
          <legend className="mb-3 text-sm">
            <span className="font-semibold">{t('product.shade')}:</span>{' '}
            <span className="text-ink-soft">{shade ? l(shade.name) : ''}</span>
          </legend>
          <div className="flex flex-wrap gap-2.5">
            {product.shades.map((item) => (
              <label key={item.id} className="relative cursor-pointer" title={l(item.name)}>
                <input
                  type="radio"
                  name={`${id}-shade`}
                  value={item.id}
                  checked={item.id === shadeId}
                  onChange={() => selectShade(item)}
                  className="peer sr-only"
                />
                <span className="sr-only">{l(item.name)}</span>
                <span
                  aria-hidden
                  className="block size-9 rounded-full border border-black/10 ring-offset-2 ring-offset-canvas transition-shadow peer-checked:ring-2 peer-checked:ring-ink peer-focus-visible:ring-2 peer-focus-visible:ring-accent hover:ring-1 hover:ring-ink-muted"
                  style={{ backgroundColor: item.hex }}
                />
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {product.sizes.length > 1 && (
        <fieldset>
          <legend className="mb-3 text-sm font-semibold">{t('product.size')}</legend>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((item) => (
              <label key={item.id} className="cursor-pointer">
                <input
                  type="radio"
                  name={`${id}-size`}
                  value={item.id}
                  checked={item.id === sizeId}
                  onChange={() => setSizeId(item.id)}
                  className="peer sr-only"
                />
                <span className="flex h-11 min-w-20 flex-col items-center justify-center rounded border border-line-strong px-4 text-xs transition-colors peer-checked:border-ink peer-checked:bg-ink peer-checked:text-canvas peer-focus-visible:ring-2 peer-focus-visible:ring-accent peer-focus-visible:ring-offset-2 hover:border-ink">
                  <span className="font-semibold">{item.label}</span>
                  <span className="tabular-nums opacity-80">{format(item.salePrice ?? item.price)}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <QuantitySelector value={quantity} onChange={setQuantity} />
        <Button onClick={addToBasket} size="lg" className={cn('min-w-48 flex-1', added && 'bg-success hover:bg-success')}>
          {added ? (
            <>
              <Check className="size-5" aria-hidden /> {t('product.added')}
            </>
          ) : (
            t('product.addToBasket')
          )}
        </Button>
        {!compact && <WishlistButton productId={product.id} productName={name} variant="full" className="w-full sm:w-auto" />}
      </div>
      <p className="sr-only" role="status" aria-live="polite">
        {added ? t('product.added') : ''}
      </p>

      {!compact && (
        <ul className="space-y-2.5 rounded bg-canvas-soft p-4 text-sm text-ink-soft">
          <li className="flex items-center gap-3">
            <Truck className="size-4 shrink-0" aria-hidden />
            {t('product.freeShipping', { amount: format(FREE_SHIPPING_THRESHOLD) })}
          </li>
          <li className="flex items-center gap-3">
            <RotateCcw className="size-4 shrink-0" aria-hidden />
            {t('product.returns')}
          </li>
          <li className="flex items-center gap-3">
            <Gift className="size-4 shrink-0" aria-hidden />
            {t('product.earnPoints', { points: Math.floor(unitPrice * quantity * POINTS_PER_DOLLAR) })}
          </li>
        </ul>
      )}
    </div>
  );
}
