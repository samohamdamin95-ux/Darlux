'use client';

import { useEffect, useState } from 'react';
import type { Product } from './types';

/** Loads products for a list of ids (kept in the order given). `null` while loading. */
export function useProductsByIds(ids: string[], enabled = true) {
  const [products, setProducts] = useState<Product[] | null>(null);
  const key = ids.join(',');

  useEffect(() => {
    if (!enabled) return;
    if (!key) {
      setProducts([]);
      return;
    }
    const controller = new AbortController();
    fetch(`/api/products?ids=${encodeURIComponent(key)}`, { signal: controller.signal })
      .then((response) => response.json() as Promise<{ products: Product[] }>)
      .then(({ products: list }) => {
        const byId = new Map(list.map((product) => [product.id, product]));
        setProducts(key.split(',').map((id) => byId.get(id)).filter(Boolean) as Product[]);
      })
      .catch((error: unknown) => {
        if ((error as Error).name !== 'AbortError') setProducts([]);
      });
    return () => controller.abort();
  }, [key, enabled]);

  return products;
}
