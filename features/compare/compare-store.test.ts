import { describe, it, expect, beforeEach, vi } from 'vitest';

const KEY = 'vivimoon-compare';
const seed = (productIds: string[]) =>
  localStorage.setItem(KEY, JSON.stringify({ state: { productIds }, version: 0 }));

/** The store is a module singleton, so hydration tests need a fresh module. */
async function freshStore() {
  vi.resetModules();
  const mod = await import('./compare-store');
  return mod.useCompareStore;
}

beforeEach(() => {
  localStorage.clear();
  vi.resetModules();
});

describe('useCompareStore — add/remove/clear', () => {
  it('adds up to 4 product ids', async () => {
    const store = await freshStore();
    ['a', 'b', 'c', 'd'].forEach((id) => store.getState().add(id));
    expect(store.getState().productIds).toEqual(['a', 'b', 'c', 'd']);
  });

  it('a 5th add is a no-op — the cap is not silently evicted', async () => {
    const store = await freshStore();
    ['a', 'b', 'c', 'd', 'e'].forEach((id) => store.getState().add(id));
    expect(store.getState().productIds).toEqual(['a', 'b', 'c', 'd']);
  });

  it('adding an already-present id is a no-op, not a duplicate', async () => {
    const store = await freshStore();
    store.getState().add('a');
    store.getState().add('a');
    expect(store.getState().productIds).toEqual(['a']);
  });

  it('removes by id and clears everything', async () => {
    const store = await freshStore();
    store.getState().add('a');
    store.getState().add('b');
    store.getState().remove('a');
    expect(store.getState().productIds).toEqual(['b']);
    store.getState().clear();
    expect(store.getState().productIds).toEqual([]);
  });
});

describe('useCompareStore — persistence', () => {
  it('does not read storage before rehydrate is called', async () => {
    seed(['a']);
    const store = await freshStore();
    expect(store.getState().productIds).toEqual([]);
  });

  it('picks up pre-seeded ids on rehydrate', async () => {
    seed(['a', 'b']);
    const store = await freshStore();
    await store.persist.rehydrate();
    expect(store.getState().productIds).toEqual(['a', 'b']);
  });

  it('persists under vivimoon-compare, a distinct key from the cart', async () => {
    const store = await freshStore();
    await store.persist.rehydrate();
    store.getState().add('a');
    const stored = JSON.parse(localStorage.getItem(KEY)!);
    expect(stored.state.productIds).toEqual(['a']);
  });
});

describe('useCompareStore — hydration gating', () => {
  it('starts un-hydrated and flips once rehydrate resolves', async () => {
    const store = await freshStore();
    expect(store.getState().hydrated).toBe(false);
    await store.persist.rehydrate();
    expect(store.getState().hydrated).toBe(true);
  });

  it('merge unions stored ids with in-memory ones, capped, deduped', async () => {
    const store = await freshStore();
    store.getState().add('a');
    seed(['a', 'b']);
    await store.persist.rehydrate();
    expect(store.getState().productIds).toEqual(['a', 'b']);
  });
});
