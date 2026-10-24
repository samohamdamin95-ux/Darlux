import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { persistOptions } from './storage';

const LIMIT = 12;

interface RecentlyViewedState {
  ids: string[];
  track: (productId: string) => void;
}

export const useRecentlyViewed = create<RecentlyViewedState>()(
  persist(
    (set) => ({
      ids: [],
      track: (productId) =>
        set((state) => ({ ids: [productId, ...state.ids.filter((id) => id !== productId)].slice(0, LIMIT) })),
    }),
    { name: 'darlux-recently-viewed', ...persistOptions },
  ),
);
