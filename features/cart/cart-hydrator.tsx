'use client';
import { useEffect } from 'react';
import { useCartStore } from './cart-store';

/**
 * Loads the persisted cart once per mount. The store uses `skipHydration` to
 * avoid an SSR/client mismatch, so nothing is read from storage until this runs.
 * Renders nothing — mirrors features/session/session-sync.tsx.
 */
export function CartHydrator() {
  useEffect(() => {
    void useCartStore.persist.rehydrate();
  }, []);
  return null;
}
