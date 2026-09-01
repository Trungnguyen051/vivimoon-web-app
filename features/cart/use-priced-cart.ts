'use client';
import { useEffect, useRef, useState } from 'react';
import { apiRequest } from '@/lib/api/client';
import type { PricedCart } from '@/lib/api/schemas/cart';
import type { CartLine } from './cart.types';

const DEBOUNCE_MS = 300;

/** Only the fields the server needs to price a line — never a price itself. */
function toPriceLines(lines: CartLine[]) {
  return lines.map((l) => ({ lineKey: l.lineKey, variantId: l.variantId, rx: l.rx, quantity: l.quantity }));
}

export interface UsePricedCartResult {
  result: PricedCart | null;
  isPending: boolean;
}

/**
 * Prices the cart server-side — the Global Constraint that the client never
 * computes money (spec §7). Fires the first price immediately once
 * `hydrated` flips true (the initial load, not an edit, so it skips the
 * debounce), then re-prices on every subsequent `lines` change debounced
 * ~300ms. `lines` must be reference-stable across renders that don't mutate
 * the cart (as `useCartStore((s) => s.lines)` is) — this effect depends on
 * `[lines, hydrated]` only, never on `result`/`isPending`, or a naive
 * "fire on every state update" loop results.
 *
 * Ordering: each effect run closes over its own `cancelled` flag. React
 * always runs the previous run's cleanup before starting the next one, so a
 * response from a superseded request is dropped even if it resolves after a
 * newer one — this holds even against a mocked `fetch` that doesn't honor
 * `AbortSignal`. The `AbortController` is still fired, so a real network
 * request is actually cancelled when the platform does honor it.
 *
 * The last good `result` is retained while `isPending` — no flicker to `—`
 * on every `+` click — except when the cart becomes empty. That case is
 * handled by deriving the returned value straight from `lines.length` at
 * render time rather than by an effect calling `setState`: it takes effect
 * the instant the cart empties (no one-frame lag waiting for an effect to
 * run), and `priceCartRequestSchema` requires at least one line anyway, so
 * there is nothing to price and nothing stale to show.
 */
export function usePricedCart(lines: CartLine[], hydrated: boolean): UsePricedCartResult {
  const [result, setResult] = useState<PricedCart | null>(null);
  const [isPending, setIsPending] = useState(false);
  const isFirstFireRef = useRef(true);
  const controllerRef = useRef<AbortController | null>(null);
  const isEmpty = lines.length === 0;

  useEffect(() => {
    if (!hydrated || isEmpty) {
      // Nothing to price, and nothing left in flight for lines that no
      // longer exist. Reset the first-fire flag too: repopulating an
      // emptied cart is a fresh load, not an edit, and should price
      // immediately rather than sit through a 300ms debounce.
      controllerRef.current?.abort();
      isFirstFireRef.current = true;
      return;
    }

    let cancelled = false;

    const fire = () => {
      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;
      setIsPending(true);
      apiRequest<PricedCart>('/api/cart/price', {
        method: 'POST',
        body: { lines: toPriceLines(lines) },
        signal: controller.signal,
      }).then((res) => {
        if (cancelled) return; // superseded by a newer request — drop this response
        setIsPending(false);
        if (res.ok) setResult(res.data);
      });
    };

    if (isFirstFireRef.current) {
      isFirstFireRef.current = false;
      fire();
      return () => {
        cancelled = true;
      };
    }

    const timer = setTimeout(fire, DEBOUNCE_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [lines, hydrated, isEmpty]);

  return { result: isEmpty ? null : result, isPending: isEmpty ? false : isPending };
}
