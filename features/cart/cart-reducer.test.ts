import { describe, it, expect } from 'vitest';
import { cartReducer, cartCount, readPersistedLine } from './cart-reducer';
import { lineKey } from '@/lib/cart/line-key';
import { MAX_LINE_QUANTITY } from '@/lib/api/schemas/cart';
import type { RxInput } from '@/lib/api/schemas/rx';
import type { CartLine, CartState } from './cart.types';

const rxA: RxInput = { sameBothEyes: true, right: { sph: -2.5 }, left: { sph: -2.5 } };
const rxB: RxInput = { sameBothEyes: true, right: { sph: -3 }, left: { sph: -3 } };

function makeLine(overrides: Partial<CartLine> = {}): CartLine {
  const variantId = overrides.variantId ?? 'v1';
  const rx = 'rx' in overrides ? overrides.rx : undefined;
  return {
    productId: 'p1',
    variantId,
    name: 'Aqua',
    sku: 'SKU1',
    unitPrice: 25,
    currency: 'USD',
    quantity: 1,
    ...overrides,
    lineKey: overrides.lineKey ?? lineKey(variantId, rx as RxInput | undefined),
  } as CartLine;
}

const empty: CartState = { lines: [] };
const plain = makeLine();
const atA = makeLine({ rx: rxA as never });
const atB = makeLine({ rx: rxB as never });

describe('cartReducer', () => {
  it('clamps a merge at MAX_LINE_QUANTITY', () => {
    const s1 = cartReducer(empty, { type: 'ADD', line: { ...atA, quantity: 90 } });
    const s2 = cartReducer(s1, { type: 'ADD', line: { ...atA, quantity: 20 } });
    expect(s2.lines[0].quantity).toBe(MAX_LINE_QUANTITY);
  });

  it('clamps a new line and a quantity update at MAX_LINE_QUANTITY', () => {
    const s1 = cartReducer(empty, { type: 'ADD', line: { ...plain, quantity: 150 } });
    expect(s1.lines[0].quantity).toBe(MAX_LINE_QUANTITY);
    const s2 = cartReducer(s1, { type: 'UPDATE_QTY', lineKey: plain.lineKey, quantity: 100 });
    expect(s2.lines[0].quantity).toBe(MAX_LINE_QUANTITY);
  });

  it('adds a new line', () => {
    expect(cartReducer(empty, { type: 'ADD', line: plain }).lines).toHaveLength(1);
  });

  it('merges quantity for the same variant at the same prescription', () => {
    const s1 = cartReducer(empty, { type: 'ADD', line: atA });
    const s2 = cartReducer(s1, { type: 'ADD', line: { ...atA, quantity: 2 } });
    expect(s2.lines).toHaveLength(1);
    expect(s2.lines[0].quantity).toBe(3);
  });

  it('keeps the same variant at DIFFERENT prescriptions as two lines', () => {
    // The headline spec §7 requirement.
    const s1 = cartReducer(empty, { type: 'ADD', line: atA });
    const s2 = cartReducer(s1, { type: 'ADD', line: atB });
    expect(s2.lines).toHaveLength(2);
    expect(s2.lines.every((l) => l.quantity === 1)).toBe(true);
    expect(s2.lines[0].variantId).toBe(s2.lines[1].variantId);
  });

  it('keeps a prescribed and an unprescribed line of the same variant apart', () => {
    const s1 = cartReducer(empty, { type: 'ADD', line: atA });
    const s2 = cartReducer(s1, { type: 'ADD', line: plain });
    expect(s2.lines).toHaveLength(2);
  });

  it('computes lineKey for an incoming line that lacks one', () => {
    const bare = { ...atA, lineKey: '' } as CartLine;
    const s = cartReducer(empty, { type: 'ADD', line: bare });
    expect(s.lines[0].lineKey).toBe(lineKey('v1', rxA));
  });
});

describe('cartReducer — addressing lines by lineKey', () => {
  const twoLines = cartReducer(cartReducer(empty, { type: 'ADD', line: atA }), {
    type: 'ADD',
    line: atB,
  });

  it('UPDATE_QTY touches only the addressed line when a variant is shared', () => {
    const s = cartReducer(twoLines, { type: 'UPDATE_QTY', lineKey: atA.lineKey, quantity: 5 });
    expect(s.lines.find((l) => l.lineKey === atA.lineKey)?.quantity).toBe(5);
    expect(s.lines.find((l) => l.lineKey === atB.lineKey)?.quantity).toBe(1);
  });

  it('REMOVE takes out only the addressed line', () => {
    const s = cartReducer(twoLines, { type: 'REMOVE', lineKey: atA.lineKey });
    expect(s.lines).toHaveLength(1);
    expect(s.lines[0].lineKey).toBe(atB.lineKey);
  });

  it('UPDATE_QTY to 0 removes the line rather than clamping to 1', () => {
    // A shopper decrementing to zero means "remove"; clamping strands a line
    // they were trying to delete.
    const s = cartReducer(twoLines, { type: 'UPDATE_QTY', lineKey: atA.lineKey, quantity: 0 });
    expect(s.lines).toHaveLength(1);
    expect(s.lines[0].lineKey).toBe(atB.lineKey);
  });

  it('UPDATE_QTY with a negative quantity also removes', () => {
    const s = cartReducer(twoLines, { type: 'UPDATE_QTY', lineKey: atA.lineKey, quantity: -3 });
    expect(s.lines).toHaveLength(1);
  });

  it('ignores an unknown lineKey', () => {
    expect(cartReducer(twoLines, { type: 'UPDATE_QTY', lineKey: 'nope', quantity: 9 }).lines).toHaveLength(2);
    expect(cartReducer(twoLines, { type: 'REMOVE', lineKey: 'nope' }).lines).toHaveLength(2);
  });

  it('clears', () => {
    expect(cartReducer(twoLines, { type: 'CLEAR' }).lines).toHaveLength(0);
  });
});

describe('cartCount', () => {
  it('sums quantities across lines', () => {
    const s = cartReducer(cartReducer(empty, { type: 'ADD', line: { ...atA, quantity: 2 } }), {
      type: 'ADD',
      line: atB,
    });
    expect(cartCount(s)).toBe(3);
  });
});

describe('client-side money', () => {
  it('the reducer module exports no subtotal helper', async () => {
    // Money is server-owned (POST /api/cart/price). A local subtotal would
    // drift from the server's answer the moment a voucher applies.
    const mod = await import('./cart-reducer');
    expect('cartSubtotal' in mod).toBe(false);
  });
});

describe('Purchase Unit (ADR-0023)', () => {
  it('a single and a pair of the same variant at the same power are two lines', () => {
    const single = makeLine({ purchaseUnit: 'single', rx: { sph: -2.5 } as never });
    const pair = makeLine({ purchaseUnit: 'pair', rx: rxA as never });
    expect(single.lineKey).not.toBe(pair.lineKey);
    const s = cartReducer(cartReducer(empty, { type: 'ADD', line: single }), { type: 'ADD', line: pair });
    expect(s.lines).toHaveLength(2);
    // Quantity counts units: adding the same single again bumps that line only.
    const s2 = cartReducer(s, { type: 'ADD', line: single });
    expect(s2.lines.map((l) => l.quantity)).toEqual([2, 1]);
  });

  it('reads a persisted lens line with no unit as a pair, keeping its key', () => {
    const legacy = JSON.parse(JSON.stringify(atA));
    delete legacy.purchaseUnit;
    const read = readPersistedLine(legacy);
    expect(read?.purchaseUnit).toBe('pair');
    expect(read?.lineKey).toBe(atA.lineKey);
    // ...so a fresh pair add at the same power merges into it.
    const fresh = makeLine({ purchaseUnit: 'pair', rx: rxA as never });
    expect(fresh.lineKey).toBe(read?.lineKey);
  });

  it('leaves a no-Rx line without a unit, and drops a corrupt one', () => {
    expect(readPersistedLine(JSON.parse(JSON.stringify(plain)))?.purchaseUnit).toBeUndefined();
    expect(readPersistedLine({ lineKey: 'x' })).toBeNull();
    expect(readPersistedLine({ ...JSON.parse(JSON.stringify(atA)), purchaseUnit: 'single' })).toBeNull();
  });
});
