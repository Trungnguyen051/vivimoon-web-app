'use client';
import { useCartStore, selectCartCount } from './cart-store';

/**
 * Cart access for client components. Lines are addressed by `lineKey`, not
 * `variantId` — the same variant at two powers is two lines (spec §7).
 *
 * There is no `subtotal` here on purpose: money is server-owned and comes from
 * POST /api/cart/price.
 */
export function useCart() {
  const lines = useCartStore((s) => s.lines);
  const hydrated = useCartStore((s) => s.hydrated);
  const count = useCartStore(selectCartCount);
  const add = useCartStore((s) => s.add);
  const updateQty = useCartStore((s) => s.updateQty);
  const remove = useCartStore((s) => s.remove);
  const clear = useCartStore((s) => s.clear);

  return {
    lines,
    hydrated,
    count,
    currency: lines[0]?.currency ?? 'USD',
    add,
    updateQty,
    remove,
    clear,
  };
}
