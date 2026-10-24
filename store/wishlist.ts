import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { persistOptions } from './storage';

interface WishlistState {
  ids: string[];
  toggle: (productId: string) => void;
  remove: (productId: string) => void;
}

export const useWishlist = create<WishlistState>()(
  persist(
    (set) => ({
      ids: [],
      toggle: (productId) =>
        set((state) => ({
          ids: state.ids.includes(productId)
            ? state.ids.filter((id) => id !== productId)
            : [productId, ...state.ids],
        })),
      remove: (productId) => set((state) => ({ ids: state.ids.filter((id) => id !== productId) })),
    }),
    { name: 'darlux-wishlist', ...persistOptions },
  ),
);
