import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_CURRENCY, type CurrencyCode } from '@/lib/format';
import { persistOptions } from './storage';

interface PreferencesState {
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
}

export const usePreferences = create<PreferencesState>()(
  persist(
    (set) => ({
      currency: DEFAULT_CURRENCY,
      setCurrency: (currency) => set({ currency }),
    }),
    { name: 'darlux-preferences', ...persistOptions },
  ),
);
