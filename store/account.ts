import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DeliveryMethodId } from '@/lib/constants';
import type { CartLine } from './cart';
import { persistOptions } from './storage';

/**
 * Mock authentication + order history. A real implementation would call an
 * auth provider (Supabase Auth, Shopify Customer Accounts…) and fetch orders
 * from the backend; the component API can stay the same.
 */
export interface User {
  name: string;
  email: string;
  joinedAt: string;
}

export interface Order {
  id: string;
  placedAt: string;
  status: 'processing' | 'shipped' | 'delivered';
  lines: CartLine[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  delivery: DeliveryMethodId;
  payment: 'card' | 'cod';
  email: string;
  pointsEarned: number;
}

export const WELCOME_POINTS = 100;

interface AccountState {
  user: User | null;
  orders: Order[];
  signIn: (user: Pick<User, 'name' | 'email'>) => void;
  signOut: () => void;
  addOrder: (order: Order) => void;
}

export const useAccount = create<AccountState>()(
  persist(
    (set) => ({
      user: null,
      orders: [],
      signIn: ({ name, email }) =>
        set((state) => ({
          user: { name, email, joinedAt: state.user?.joinedAt ?? new Date().toISOString() },
        })),
      signOut: () => set({ user: null }),
      addOrder: (order) => set((state) => ({ orders: [order, ...state.orders] })),
    }),
    { name: 'darlux-account', ...persistOptions },
  ),
);

export function selectPoints(state: AccountState) {
  if (!state.user) return 0;
  return WELCOME_POINTS + state.orders.reduce((sum, order) => sum + order.pointsEarned, 0);
}
