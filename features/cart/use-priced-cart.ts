'use client';
import { useEffect, useRef, useState } from 'react';
import { apiRequest } from '@/lib/api/client';
import type { PricedCart } from '@/lib/api/schemas/cart';
import type { SessionStatus } from '@/features/session/session-store';
import type { CartLine } from './cart.types';

const DEBOUNCE_MS = 300;

/** Only the fields the server needs to price a line — never a price itself. */
export function toPriceLines(lines: CartLine[]) {
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
 *
 * `sessionStatus` (optional) is the guest→member merge (spec §9): the
 * server, not this hook, decides voucher eligibility from the session
 * cookie `apiRequest` already sends — but a *live* `sessionStatus` change
 * (a login without a page navigation) needs an explicit re-fire, because
 * neither `lines` nor `hydrated` changes when a shopper signs in. That
 * re-fire is immediate, like the first fire, since it's a context change
 * rather than an edit worth debouncing. Omitting the argument (existing
 * callers, tests) makes it always `undefined` and this branch never trips.
 *
 * `shipping` (optional, M5.4 issue #21) is checkout's price preview: `null`
 * means "shipping-aware, but the address isn't complete enough to quote
 * yet" and is treated exactly like `isEmpty` — nothing fires, `result`
 * stays `null` (never a wrong or zero total). A `{ province, district }`
 * value is included in the price request, same as order placement's own
 * `shipping` selection, so the previewed total is the one placement will
 * actually charge. The very first time an address becomes complete is a
 * first fire (immediate), same as the very first price on hydration;
 * every address edit after that debounces like a line edit. Omitting the
 * argument entirely (the cart page) never engages any of this — no address
 * exists there (Task 7).
 */
export function usePricedCart(
  lines: CartLine[],
  hydrated: boolean,
  sessionStatus?: SessionStatus,
  shipping?: { province: string; district: string } | null,
): UsePricedCartResult {
  const [result, setResult] = useState<PricedCart | null>(null);
  const [isPending, setIsPending] = useState(false);
  const isFirstFireRef = useRef(true);
  const controllerRef = useRef<AbortController | null>(null);
  const prevSessionStatusRef = useRef(sessionStatus);
  const isEmpty = lines.length === 0;
  const shippingPending = shipping === null;
  const shippingKey = shipping ? `${shipping.province}|${shipping.district}` : '';

  useEffect(() => {
    if (!hydrated || isEmpty || shippingPending) {
      // Nothing to price, and nothing left in flight for lines/an address
      // that's no longer there. Reset the first-fire flag too: a repopulated
      // cart, or an address that just became complete, is a fresh load, not
      // an edit, and should price immediately rather than sit through a
      // 300ms debounce. A login with an empty cart lands here too — nothing
      // to wipe, nothing to error.
      controllerRef.current?.abort();
      isFirstFireRef.current = true;
      prevSessionStatusRef.current = sessionStatus;
      return;
    }

    const sessionChanged = prevSessionStatusRef.current !== sessionStatus;
    prevSessionStatusRef.current = sessionStatus;

    let cancelled = false;

    const fire = () => {
      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;
      setIsPending(true);
      apiRequest<PricedCart>('/api/cart/price', {
        method: 'POST',
        body: { lines: toPriceLines(lines), ...(shipping ? { shipping } : {}) },
        signal: controller.signal,
      }).then((res) => {
        if (cancelled) return; // superseded by a newer request — drop this response
        setIsPending(false);
        if (res.ok) setResult(res.data);
      });
    };

    if (isFirstFireRef.current || sessionChanged) {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- shippingKey stands in for `shipping` (an object literal, unstable across renders)
  }, [lines, hydrated, isEmpty, sessionStatus, shippingPending, shippingKey]);

  const pending = isEmpty || shippingPending;
  return { result: pending ? null : result, isPending: pending ? false : isPending };
}
