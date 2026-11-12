'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/features/cart/use-cart';
import { purchaseUnitOf } from '@/lib/api/schemas/rx';
import type { Locale } from '@/lib/i18n/config';
import type { HistoryLine } from './order-history-card';

/**
 * "Mua lại": puts every still-available line back in the cart at today's price
 * with its Rx, then opens the cart. `missing` counts lines whose variant is
 * gone (ADR-0012) — the caller reports them, and the shopper stays put.
 */
export function useBuyAgain(lines: HistoryLine[], locale: Locale) {
  const router = useRouter();
  const { add } = useCart();
  const [missing, setMissing] = useState(0);

  const buyAgain = () => {
    let unavailable = 0;
    for (const l of lines) {
      if (!l.product) { unavailable++; continue; }
      add({
        lineKey: l.lineKey, productId: l.product.id, variantId: l.variantId, name: l.product.name,
        sku: l.product.sku, color: l.product.color, unitPrice: l.product.price, currency: l.currency,
        quantity: l.quantity, image: l.product.image, purchaseUnit: purchaseUnitOf(l), rx: l.rx,
      });
    }
    setMissing(unavailable);
    // Stay put when something was skipped, so the shopper reads why.
    if (unavailable === 0) router.push(`/${locale}/cart`);
  };

  return { buyAgain, missing };
}
