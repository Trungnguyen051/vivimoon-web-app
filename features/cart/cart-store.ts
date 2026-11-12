'use client';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { cartReducer, cartCount, readPersistedLine } from './cart-reducer';
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
  edit: (lineKey: string, line: CartLine) => void;
  tick: (lineKey: string, ticked: boolean) => void;
  tickAll: (ticked: boolean) => void;
  /** Drops the lines an order was placed with, keeping the unticked ones. */
  removeLines: (lineKeys: string[]) => void;
  clear: () => void;
  /** The Voucher the shopper picked or typed in the cart; absent = the server's best (CONTEXT.md "Voucher"). */
  voucherCode?: string;
  setVoucherCode: (code: string | undefined) => void;
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
function mergeLines(persisted: CartState, currentLines: CartLine[]): CartState {
  return currentLines.reduce<CartState>((state, line) => cartReducer(state, { type: 'ADD', line }), persisted);
}

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      lines: [],
      hydrated: false,
      add: (line) => set((s) => cartReducer(s, { type: 'ADD', line })),
      updateQty: (lineKey, quantity) => set((s) => cartReducer(s, { type: 'UPDATE_QTY', lineKey, quantity })),
      remove: (lineKey) => set((s) => cartReducer(s, { type: 'REMOVE', lineKey })),
      edit: (lineKey, line) => set((s) => cartReducer(s, { type: 'EDIT', lineKey, line })),
      tick: (lineKey, ticked) => set((s) => cartReducer(s, { type: 'TICK', lineKey, ticked })),
      tickAll: (ticked) => set((s) => cartReducer(s, { type: 'TICK_ALL', ticked })),
      removeLines: (lineKeys) => set((s) => cartReducer(s, { type: 'REMOVE_LINES', lineKeys })),
      clear: () => set((s) => ({ ...cartReducer(s, { type: 'CLEAR' }), voucherCode: undefined })),
      voucherCode: undefined,
      setVoucherCode: (voucherCode) => set({ voucherCode }),
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
      partialize: (s) => ({ lines: s.lines, unticked: s.unticked, voucherCode: s.voucherCode }) as CartState,
      onRehydrateStorage: () => () => useCartStore.setState({ hydrated: true }),
      /**
       * zustand's default merge would replace in-memory lines with the stored
       * ones, silently discarding anything added between mount and rehydrate.
       * Fold them together through cartReducer instead, so quantities merge by
       * lineKey and no add is lost to the race.
       *
       * That fold is only ever right while the race is still open. `hydrated`
       * is what closes it: once it is true, `current.lines` *is* the stored
       * cart, and folding it into itself sums every quantity with its own —
       * the cart doubled on every rehydrate until the badge read 2^48 (#75).
       * CartHydrator rehydrates from an effect, which StrictMode runs twice,
       * so this was reached on the very first load in development.
       *
       * After hydration the stored cart simply wins. That is also the right
       * answer across tabs: another tab's change is adopted rather than added
       * to whatever this one was holding.
       */
      merge: (persisted, current) => {
        const saved = persisted as (Partial<CartState> & { voucherCode?: unknown }) | undefined;
        const stored = saved?.lines;
        const persistedLines = Array.isArray(stored)
          ? stored.map(readPersistedLine).filter((line) => line !== null)
          : [];
        const unticked = Array.isArray(saved?.unticked) ? saved.unticked.filter((k): k is string => typeof k === 'string') : [];
        const voucherCode = typeof saved?.voucherCode === 'string' ? saved.voucherCode : current.voucherCode;
        if (current.hydrated) return { ...current, lines: persistedLines, unticked, voucherCode };
        return { ...current, ...mergeLines({ lines: persistedLines, unticked }, current.lines), voucherCode };
      },
    },
  ),
);

/** Total item count across lines, for the header badge. */
export const selectCartCount = (s: CartStore): number => cartCount(s);
