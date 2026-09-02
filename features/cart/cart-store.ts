'use client';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { cartReducer, cartCount } from './cart-reducer';
import type { CartLine, CartState } from './cart.types';

/**
 * Single swap point for the persistence driver (spec §8).
 *
 * localStorage is deliberate: carts survive a browser restart and are shared
 * across tabs, which is standard e-commerce behaviour. sessionStorage was
 * considered and rejected — being per-tab, it silently discards a cart when the
 * tab closes.
 */
export const CART_STORAGE = createJSONStorage<CartState>(() => localStorage);

export interface CartStore extends CartState {
  /**
   * False until rehydrate() has run. Gate cart mutations on this: persist wraps
   * setState, so a write before hydration overwrites the stored cart and merge
   * never gets to union them. CartHydrator flips it on mount.
   */
  hydrated: boolean;
  add: (line: CartLine) => void;
  updateQty: (lineKey: string, quantity: number) => void;
  remove: (lineKey: string) => void;
  clear: () => void;
  /**
   * Buy Now (spec §10): a single line held outside `lines`, so checkout can
   * read it without ever touching the real cart. Deliberately excluded from
   * `partialize` below — it must not survive a reload, and never merges with
   * `lines` through `add`/`cartReducer`.
   */
  buyNowLine: CartLine | null;
  setBuyNowLine: (line: CartLine) => void;
  clearBuyNowLine: () => void;
}

/** Folds any lines already in memory into the persisted cart. */
function mergeLines(persistedLines: CartLine[], currentLines: CartLine[]): CartLine[] {
  return currentLines.reduce<CartState>(
    (state, line) => cartReducer(state, { type: 'ADD', line }),
    { lines: persistedLines },
  ).lines;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      lines: [],
      hydrated: false,
      add: (line) => set((s) => cartReducer(s, { type: 'ADD', line })),
      updateQty: (lineKey, quantity) => set((s) => cartReducer(s, { type: 'UPDATE_QTY', lineKey, quantity })),
      remove: (lineKey) => set((s) => cartReducer(s, { type: 'REMOVE', lineKey })),
      clear: () => set((s) => cartReducer(s, { type: 'CLEAR' })),
      buyNowLine: null,
      setBuyNowLine: (line) => set({ buyNowLine: line }),
      clearBuyNowLine: () => set({ buyNowLine: null }),
    }),
    {
      name: 'vivimoon-cart',
      storage: CART_STORAGE,
      // Nothing is READ until rehydrate() runs, which avoids an SSR/client
      // mismatch. It does not stop writes: persist wraps setState
      // unconditionally, so every mutation persists either way.
      skipHydration: true,
      // `hydrated` is runtime-only; persisting it would restore a stale true.
      partialize: (s) => ({ lines: s.lines }) as CartState,
      onRehydrateStorage: () => () => useCartStore.setState({ hydrated: true }),
      /**
       * zustand's default merge would replace in-memory lines with the stored
       * ones, silently discarding anything added between mount and rehydrate.
       * Fold them together through cartReducer instead, so quantities merge by
       * lineKey and no add is lost to the race.
       */
      merge: (persisted, current) => {
        const stored = (persisted as Partial<CartState> | undefined)?.lines;
        const persistedLines = Array.isArray(stored) ? stored : [];
        return { ...current, lines: mergeLines(persistedLines, current.lines) };
      },
    },
  ),
);

/** Total item count across lines, for the header badge. */
export const selectCartCount = (s: CartStore): number => cartCount(s);
