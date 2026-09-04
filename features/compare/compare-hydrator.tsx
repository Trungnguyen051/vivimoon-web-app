'use client';
import { useEffect } from 'react';
import { useCompareStore } from './compare-store';

/**
 * Loads the persisted compare selection once per mount. The store uses
 * `skipHydration` to avoid an SSR/client mismatch, so nothing is read from
 * storage until this runs — mirrors `features/cart/cart-hydrator.tsx`.
 */
export function CompareHydrator() {
  useEffect(() => {
    void useCompareStore.persist.rehydrate();
  }, []);
  return null;
}
