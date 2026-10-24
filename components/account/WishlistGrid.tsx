'use client';

import { Heart } from 'lucide-react';
import { ProductCard } from '@/components/product/ProductCard';
import { useI18n } from '@/components/providers/I18nProvider';
import { ButtonLink } from '@/components/ui/Button';
import { ProductGridSkeleton } from '@/components/ui/Skeleton';
import { useProductsByIds } from '@/lib/use-products';
import { useHydrated } from '@/store/ui';
import { useWishlist } from '@/store/wishlist';

export function WishlistGrid({ brandNames }: { brandNames: Record<string, string> }) {
  const { t, href } = useI18n();
  const hydrated = useHydrated();
  const ids = useWishlist((state) => state.ids);
  const products = useProductsByIds(ids, hydrated);

  if (!hydrated || (ids.length > 0 && !products)) return <ProductGridSkeleton count={4} />;

  if (ids.length === 0) {
    return (
      <div className="flex flex-col items-center rounded border border-dashed border-line-strong px-6 py-20 text-center">
        <Heart className="size-10 text-ink-subtle" aria-hidden />
        <h2 className="mt-4 text-lg font-semibold">{t('wishlist.empty')}</h2>
        <p className="mt-1 text-sm text-ink-muted">{t('wishlist.emptyText')}</p>
        <ButtonLink href={href('/c/new')} className="mt-6">
          {t('cart.continueShopping')}
        </ButtonLink>
      </div>
    );
  }

  // Keep removed items out instantly, before a refetch completes.
  const visible = (products ?? []).filter((product) => ids.includes(product.id));

  return (
    <div>
      <p className="mb-6 text-sm text-ink-muted" aria-live="polite">
        {t('wishlist.count', { count: ids.length })}
      </p>
      <ul className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 xl:grid-cols-4">
        {visible.map((product) => (
          <li key={product.id}>
            <ProductCard product={product} brandName={brandNames[product.brand] ?? product.brand} />
          </li>
        ))}
      </ul>
    </div>
  );
}
