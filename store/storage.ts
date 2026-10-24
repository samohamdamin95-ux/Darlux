import { createJSONStorage } from 'zustand/middleware';

/**
 * Shared persist options. `skipHydration` keeps the first client render identical
 * to the server render; <StoreHydrator /> rehydrates every store after mount.
 */
export const persistOptions = {
  storage: createJSONStorage(() => localStorage),
  skipHydration: true,
} as const;
