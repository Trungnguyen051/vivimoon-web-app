'use client';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/** Up to 4 products (spec §10) — enforced here client-side and again by
 * `compareRequestSchema` server-side, since the store cap is not a guarantee
 * about what actually reaches the request body. */
export const COMPARE_CAP = 4;

interface CompareState {
  productIds: string[];
}

/** Mirrors `features/cart/cart-store.ts`'s persistence shape (spec §8
 * precedent for client-global state) — same driver, distinct storage key. */
export const COMPARE_STORAGE = createJSONStorage<CompareState>(() => localStorage);

export interface CompareStore extends CompareState {
  hydrated: boolean;
  add: (productId: string) => void;
  remove: (productId: string) => void;
  clear: () => void;
}

/** Persisted ids first (they arrived first), then any in-memory ids not
 * already present, capped and deduped — never silently evicts an id to make
 * room for another. */
function mergeIds(persistedIds: string[], currentIds: string[]): string[] {
  const merged = [...persistedIds];
  for (const id of currentIds) {
    if (merged.length >= COMPARE_CAP) break;
    if (!merged.includes(id)) merged.push(id);
  }
  return merged;
}

export const useCompareStore = create<CompareStore>()(
  persist(
    (set) => ({
      productIds: [],
      hydrated: false,
      add: (productId) =>
        set((s) => {
          if (s.productIds.includes(productId) || s.productIds.length >= COMPARE_CAP) return s;
          return { productIds: [...s.productIds, productId] };
        }),
      remove: (productId) => set((s) => ({ productIds: s.productIds.filter((id) => id !== productId) })),
      clear: () => set({ productIds: [] }),
    }),
    {
      name: 'vivimoon-compare',
      storage: COMPARE_STORAGE,
      skipHydration: true,
      partialize: (s) => ({ productIds: s.productIds }) as CompareState,
      onRehydrateStorage: () => () => useCompareStore.setState({ hydrated: true }),
      merge: (persisted, current) => {
        const stored = (persisted as Partial<CompareState> | undefined)?.productIds;
        const persistedIds = Array.isArray(stored) ? stored : [];
        return { ...current, productIds: mergeIds(persistedIds, current.productIds) };
      },
    },
  ),
);

export const selectCompareCount = (s: CompareStore): number => s.productIds.length;
