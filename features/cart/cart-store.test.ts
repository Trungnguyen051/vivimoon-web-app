import { describe, it, expect, beforeEach, vi } from 'vitest';
import { lineKey } from '@/lib/cart/line-key';
import type { RxInput } from '@/lib/api/schemas/rx';
import type { CartLine } from './cart.types';

const rxA: RxInput = { sameBothEyes: true, right: { sph: -2.5 }, left: { sph: -2.5 } };
const rxB: RxInput = { sameBothEyes: true, right: { sph: -3 }, left: { sph: -3 } };

function makeLine(rx?: RxInput, quantity = 1): CartLine {
  return {
    lineKey: lineKey('v1', rx),
    productId: 'p1', variantId: 'v1', name: 'Aqua', sku: 'SKU1',
    packSize: '30', unitPrice: 25, currency: 'USD', quantity,
    rx: rx as CartLine['rx'],
  };
}

const KEY = 'vivimoon-cart';
const seed = (lines: CartLine[]) =>
  localStorage.setItem(KEY, JSON.stringify({ state: { lines }, version: 0 }));

/** The store is a module singleton, so hydration tests need a fresh module. */
async function freshStore() {
  vi.resetModules();
  const mod = await import('./cart-store');
  return mod.useCartStore;
}

beforeEach(() => {
  localStorage.clear();
  vi.resetModules();
});

describe('useCartStore — delegation to cartReducer', () => {
  it('keeps the same variant at different prescriptions as two lines', async () => {
    const store = await freshStore();
    store.getState().add(makeLine(rxA));
    store.getState().add(makeLine(rxB));
    expect(store.getState().lines).toHaveLength(2);
  });

  it('merges quantity at the same prescription', async () => {
    const store = await freshStore();
    store.getState().add(makeLine(rxA));
    store.getState().add(makeLine(rxA, 2));
    expect(store.getState().lines).toHaveLength(1);
    expect(store.getState().lines[0].quantity).toBe(3);
  });

  it('removes and clears by lineKey', async () => {
    const store = await freshStore();
    store.getState().add(makeLine(rxA));
    store.getState().add(makeLine(rxB));
    store.getState().remove(lineKey('v1', rxA));
    expect(store.getState().lines).toHaveLength(1);
    store.getState().clear();
    expect(store.getState().lines).toHaveLength(0);
  });
});

describe('useCartStore — persistence', () => {
  it('does not READ storage before rehydrate is called', async () => {
    // This is what skipHydration buys. It does NOT prevent writes: persist wraps
    // setState unconditionally, so every mutation persists regardless.
    seed([makeLine(rxA)]);
    const store = await freshStore();
    expect(store.getState().lines).toHaveLength(0);
  });

  it('picks up a pre-seeded cart on rehydrate', async () => {
    seed([makeLine(rxA)]);
    const store = await freshStore();
    await store.persist.rehydrate();
    expect(store.getState().lines).toHaveLength(1);
    expect(store.getState().lines[0].lineKey).toBe(lineKey('v1', rxA));
  });

  it('persists a mutation under vivimoon-cart', async () => {
    const store = await freshStore();
    await store.persist.rehydrate();
    store.getState().add(makeLine(rxA));
    const stored = JSON.parse(localStorage.getItem(KEY)!);
    expect(stored.state.lines).toHaveLength(1);
  });

  it('round-trips a prescription through storage without splitting the line', async () => {
    // JSON.stringify drops undefined; if the rehydrated Rx hashed differently the
    // line would duplicate itself on the next add.
    const store = await freshStore();
    await store.persist.rehydrate();
    store.getState().add(makeLine(rxA));
    const store2 = await freshStore();
    await store2.persist.rehydrate();
    store2.getState().add(makeLine(rxA));
    expect(store2.getState().lines).toHaveLength(1);
    expect(store2.getState().lines[0].quantity).toBe(2);
  });
});

describe('useCartStore — hydration gating', () => {
  it('starts un-hydrated and flips once rehydrate resolves', async () => {
    const store = await freshStore();
    expect(store.getState().hydrated).toBe(false);
    await store.persist.rehydrate();
    expect(store.getState().hydrated).toBe(true);
  });

  it('exposes hydrated so the UI can gate mutations on it', async () => {
    // Gating is the ONLY real protection here: persist wraps setState, so a
    // mutation before rehydrate writes to storage and destroys the stored cart
    // before merge could ever union them. The hydrator calls rehydrate on mount,
    // which closes the window in practice; `hydrated` closes it in principle.
    const store = await freshStore();
    expect('hydrated' in store.getState()).toBe(true);
  });

  it('merge unions stored lines with in-memory ones rather than replacing', async () => {
    // Defence in depth for callers that populate state without writing first —
    // e.g. the guest-to-member cart merge.
    const store = await freshStore();
    store.getState().add(makeLine(rxB));
    seed([makeLine(rxA)]);          // storage replaced after the write
    await store.persist.rehydrate();
    expect(store.getState().lines).toHaveLength(2);
  });

  it('merge folds matching lines together by lineKey', async () => {
    const store = await freshStore();
    store.getState().add(makeLine(rxA));
    seed([makeLine(rxA, 2)]);
    await store.persist.rehydrate();
    expect(store.getState().lines).toHaveLength(1);
    expect(store.getState().lines[0].quantity).toBe(3);
  });
});

describe('useCartStore — buyNowLine (Task 12)', () => {
  it('sets and clears buyNowLine independently of lines', async () => {
    const store = await freshStore();
    store.getState().add(makeLine(rxA));
    store.getState().setBuyNowLine(makeLine(rxB));

    expect(store.getState().lines).toHaveLength(1);
    expect(store.getState().buyNowLine).not.toBeNull();

    store.getState().clearBuyNowLine();
    expect(store.getState().buyNowLine).toBeNull();
    expect(store.getState().lines).toHaveLength(1); // untouched by the clear
  });

  it('is not persisted — a fresh module load never restores a prior buyNowLine', async () => {
    const store = await freshStore();
    store.getState().setBuyNowLine(makeLine(rxA));
    await store.persist.rehydrate();

    const stored = JSON.parse(localStorage.getItem(KEY)!);
    expect('buyNowLine' in stored.state).toBe(false);

    const store2 = await freshStore();
    await store2.persist.rehydrate();
    expect(store2.getState().buyNowLine).toBeNull();
  });
});

describe('useCartStore — resilience', () => {
  it('falls back to an empty cart on an unparseable stored value', async () => {
    localStorage.setItem(KEY, 'not json {{{');
    const store = await freshStore();
    await expect(store.persist.rehydrate()).resolves.not.toThrow();
    expect(store.getState().lines).toEqual([]);
  });

  it('survives a stored value of the wrong shape', async () => {
    localStorage.setItem(KEY, JSON.stringify({ state: { lines: null }, version: 0 }));
    const store = await freshStore();
    await store.persist.rehydrate();
    expect(Array.isArray(store.getState().lines)).toBe(true);
  });
});
