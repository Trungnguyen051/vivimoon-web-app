'use client';
import { useCartStore } from './cart-store';

/**
 * Buy Now (spec §10): a single-line purchase that bypasses the real cart
 * entirely. `buyNowLine` lives outside `lines` in the same store so it never
 * merges with or clears the shopper's actual cart.
 */
export function useBuyNow() {
  const buyNowLine = useCartStore((s) => s.buyNowLine);
  const setBuyNowLine = useCartStore((s) => s.setBuyNowLine);
  const clearBuyNowLine = useCartStore((s) => s.clearBuyNowLine);

  return { buyNowLine, setBuyNowLine, clearBuyNowLine };
}
