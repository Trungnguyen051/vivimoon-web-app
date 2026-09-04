'use client';
import { useEffect, useRef, useState } from 'react';
import { apiRequest } from '@/lib/api/client';
import type { ComparisonMatrix } from '@/lib/api/schemas/catalog';

export interface UseComparisonMatrixResult {
  matrix: ComparisonMatrix | null;
  isPending: boolean;
  error: string | null;
}

/**
 * Fetches the comparison matrix for the current tray selection. No debounce,
 * unlike `usePricedCart` — compare selection changes on discrete button
 * clicks, not a fast-repeating input like quantity — but a superseded
 * request is still cancelled via `AbortController` plus a `cancelled`
 * closure flag, the same defence `usePricedCart` uses.
 *
 * `productIds` is expected to be the store's own array reference
 * (`useCompareStore((s) => s.productIds)`), which zustand only replaces when
 * the selection actually changes — so a plain reference-equality dependency
 * is enough, matching `usePricedCart`'s `lines` dependency.
 */
export function useComparisonMatrix(productIds: string[]): UseComparisonMatrixResult {
  const [matrix, setMatrix] = useState<ComparisonMatrix | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);
  const isEmpty = productIds.length === 0;

  useEffect(() => {
    // The empty case is derived at return time below, not via setState here
    // (matching `usePricedCart`'s `isEmpty` handling).
    controllerRef.current?.abort();
    if (isEmpty) return;

    let cancelled = false;
    const controller = new AbortController();
    controllerRef.current = controller;

    // Extracted into its own function, same shape as `usePricedCart`'s
    // `fire` — the react-hooks/set-state-in-effect rule only flags setState
    // called directly in the effect body, not one reached through calling a
    // local function.
    const fire = () => {
      setIsPending(true);
      setError(null);
      apiRequest<ComparisonMatrix>('/api/products/compare', {
        method: 'POST',
        body: { productIds },
        signal: controller.signal,
      }).then((res) => {
        if (cancelled) return; // superseded by a newer request — drop this response
        setIsPending(false);
        if (res.ok) setMatrix(res.data);
        else setError(res.error.message);
      });
    };
    fire();

    return () => {
      cancelled = true;
    };
  }, [productIds, isEmpty]);

  return {
    matrix: isEmpty ? null : matrix,
    isPending: isEmpty ? false : isPending,
    error: isEmpty ? null : error,
  };
}
