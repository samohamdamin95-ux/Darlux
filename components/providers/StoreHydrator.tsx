'use client';

import { useEffect } from 'react';
import { useAccount } from '@/store/account';
import { useCart } from '@/store/cart';
import { usePreferences } from '@/store/preferences';
import { useRecentlyViewed } from '@/store/recently-viewed';
import { useUi } from '@/store/ui';
import { useWishlist } from '@/store/wishlist';

/** Reads every persisted store from localStorage once the app has mounted. */
export function StoreHydrator() {
  useEffect(() => {
    Promise.all([
      useCart.persist.rehydrate(),
      useWishlist.persist.rehydrate(),
      useRecentlyViewed.persist.rehydrate(),
      useAccount.persist.rehydrate(),
      usePreferences.persist.rehydrate(),
    ]).finally(() => useUi.getState().setHydrated());
  }, []);
  return null;
}
