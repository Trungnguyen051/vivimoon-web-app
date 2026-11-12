'use client';
import { useMemo } from 'react';
import { useCartStore, selectCartCount } from './cart-store';
import { tickedLines } from './cart-reducer';

/**
 * Cart access for client components. Lines are addressed by `lineKey`, not
 * `variantId` — the same variant at two powers is two lines (spec §7).
 *
 * There is no `subtotal` here on purpose: money is server-owned and comes from
 * POST /api/cart/price.
 */
export function useCart() {
  const lines = useCartStore((s) => s.lines);
  const unticked = useCartStore((s) => s.unticked);
  const hydrated = useCartStore((s) => s.hydrated);
  const count = useCartStore(selectCartCount);
  const add = useCartStore((s) => s.add);
  const updateQty = useCartStore((s) => s.updateQty);
  const remove = useCartStore((s) => s.remove);
  const clear = useCartStore((s) => s.clear);
  const edit = useCartStore((s) => s.edit);
  const tick = useCartStore((s) => s.tick);
  const tickAll = useCartStore((s) => s.tickAll);
  const removeLines = useCartStore((s) => s.removeLines);
  const voucherCode = useCartStore((s) => s.voucherCode);
  const setVoucherCode = useCartStore((s) => s.setVoucherCode);
  // Reference-stable: usePricedCart re-prices on every new array.
  const ticked = useMemo(() => tickedLines({ lines, unticked }), [lines, unticked]);

  return {
    lines,
    /** The lines priced and checked out (CONTEXT.md "Cart Line"). */
    tickedLines: ticked,
    hydrated,
    count,
    currency: lines[0]?.currency ?? 'VND',
    add,
    updateQty,
    remove,
    clear,
    edit,
    tick,
    tickAll,
    removeLines,
    voucherCode,
    setVoucherCode,
  };
}
