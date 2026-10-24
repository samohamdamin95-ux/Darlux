'use client';

import { useI18n } from '@/components/providers/I18nProvider';
import { Carousel } from '@/components/ui/Carousel';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';
import { useProductsByIds } from '@/lib/use-products';
import { useRecentlyViewed } from '@/store/recently-viewed';
import { useHydrated } from '@/store/ui';
import { ProductCard } from './ProductCard';

/** Products from localStorage history, fetched client-side with skeletons while loading. */
export function RecentlyViewed({ excludeId, brandNames }: { excludeId?: string; brandNames: Record<string, string> }) {
  const { t } = useI18n();
  const hydrated = useHydrated();
  const ids = useRecentlyViewed((state) => state.ids).filter((id) => id !== excludeId);
  const products = useProductsByIds(ids, hydrated);

  if (hydrated && ids.length === 0) return null;
  if (products && products.length === 0) return null;

  return (
    <section aria-labelledby="recently-viewed" className="py-10 md:py-14">
      <SectionHeader id="recently-viewed" title={t('product.recentlyViewed')} />
      {products ? (
        <Carousel label={t('product.recentlyViewed')}>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} brandName={brandNames[product.brand] ?? product.brand} />
          ))}
        </Carousel>
      ) : (
        <div aria-busy="true" className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className={i > 1 ? 'hidden sm:block' : undefined}>
              <ProductCardSkeleton />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
