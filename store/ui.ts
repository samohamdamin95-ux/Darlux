import { create } from 'zustand';
import type { Product } from '@/lib/types';

/** Ephemeral UI state (not persisted). */
interface UiState {
  miniCartOpen: boolean;
  quickLook: { product: Product; brandName: string } | null;
  hydrated: boolean;
  openMiniCart: () => void;
  closeMiniCart: () => void;
  openQuickLook: (product: Product, brandName: string) => void;
  closeQuickLook: () => void;
  setHydrated: () => void;
}

export const useUi = create<UiState>()((set) => ({
  miniCartOpen: false,
  quickLook: null,
  hydrated: false,
  openMiniCart: () => set({ miniCartOpen: true, quickLook: null }),
  closeMiniCart: () => set({ miniCartOpen: false }),
  openQuickLook: (product, brandName) => set({ quickLook: { product, brandName } }),
  closeQuickLook: () => set({ quickLook: null }),
  setHydrated: () => set({ hydrated: true }),
}));

/** True once persisted stores have been read from localStorage. */
export const useHydrated = () => useUi((state) => state.hydrated);
