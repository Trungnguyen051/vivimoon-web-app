import { describe, it, expect } from 'vitest';
import { lineKey } from './line-key';
import type { RxInput } from '@/lib/api/schemas/rx';

const V = 'v-aqua-daily-3';
const W = 'v-aqua-daily-6';

describe('lineKey — identity', () => {
  it('is equal for the same variant with no prescription', () => {
    expect(lineKey(V)).toBe(lineKey(V));
  });

  it('is equal for the same variant and an identical prescription', () => {
    const rx: RxInput = { right: { sph: -2.5 }, left: { sph: -3 } };
    expect(lineKey(V, rx)).toBe(lineKey(V, { right: { sph: -2.5 }, left: { sph: -3 } }));
  });

  it('DIFFERS for the same variant at different powers', () => {
    // The core spec §7 requirement: -2.50 and -3.00 are two distinct cart lines.
    const a = lineKey(V, { right: { sph: -2.5 }, left: { sph: -2.5 } });
    const b = lineKey(V, { right: { sph: -3 }, left: { sph: -3 } });
    expect(a).not.toBe(b);
  });

  it('DIFFERS when only one eye differs', () => {
    const a = lineKey(V, { right: { sph: -2.5 }, left: { sph: -2.5 } });
    const b = lineKey(V, { right: { sph: -2.5 }, left: { sph: -3 } });
    expect(a).not.toBe(b);
  });

  it('DIFFERS for different variants with an identical prescription', () => {
    const rx: RxInput = { right: { sph: -2.5 }, left: { sph: -2.5 } };
    expect(lineKey(V, rx)).not.toBe(lineKey(W, rx));
  });

  it('DIFFERS between a prescription and none', () => {
    expect(lineKey(V)).not.toBe(lineKey(V, { right: { sph: -2.5 }, left: { sph: -2.5 } }));
  });
});

describe('lineKey — normalisation', () => {
  const base: RxInput = { right: { sph: -2.5 }, left: { sph: -2.5 } };

  it('treats an absent optional field and an explicit undefined as identical', () => {
    const withUndef = { right: { sph: -2.5, cyl: undefined }, left: { sph: -2.5 } } as RxInput;
    expect(lineKey(V, withUndef)).toBe(lineKey(V, base));
  });

  it('treats null and undefined as identical', () => {
    // A JSON round-trip through localStorage drops undefined; a server response
    // may send null. If these hashed differently, a cart line would duplicate
    // itself after a page reload.
    const withNull = { right: { sph: -2.5, cyl: null }, left: { sph: -2.5 } } as unknown as RxInput;
    expect(lineKey(V, withNull)).toBe(lineKey(V, base));
  });

  it('is unaffected by object key order', () => {
    const a = lineKey(V, { right: { sph: -2.5 }, left: { sph: -3 } });
    const b = lineKey(V, { left: { sph: -3 }, right: { sph: -2.5 } } as RxInput);
    expect(a).toBe(b);
  });

  it('treats sameBothEyes absent and false as identical', () => {
    // .default(false) fills this on parse only, so the pre-parse and parsed
    // forms of the same prescription must hash alike.
    const absent = { right: { sph: -2.5 }, left: { sph: -2.5 } } as RxInput;
    const explicit = { sameBothEyes: false, right: { sph: -2.5 }, left: { sph: -2.5 } };
    expect(lineKey(V, absent)).toBe(lineKey(V, explicit));
  });

  it('expands sameBothEyes to explicit equal eyes', () => {
    const collapsed = { sameBothEyes: true, right: { sph: -2.5 } } as RxInput;
    const expanded = { sameBothEyes: true, right: { sph: -2.5 }, left: { sph: -2.5 } };
    expect(lineKey(V, collapsed)).toBe(lineKey(V, expanded));
  });

  it('lets sameBothEyes:true override a stale left eye', () => {
    const stale = { sameBothEyes: true, right: { sph: -2.5 }, left: { sph: -9 } };
    expect(lineKey(V, stale)).toBe(lineKey(V, { sameBothEyes: true, right: { sph: -2.5 } } as RxInput));
  });

  it('hashes -2.5 and -2.50 alike', () => {
    expect(lineKey(V, { right: { sph: -2.5 }, left: { sph: -2.50 } })).toBe(lineKey(V, base));
  });

  it('distinguishes a present optional field from an absent one', () => {
    const withCyl = { right: { sph: -2.5, cyl: -1.25, axis: 90 }, left: { sph: -2.5 } } as RxInput;
    expect(lineKey(V, withCyl)).not.toBe(lineKey(V, base));
  });

  it('distinguishes multifocal ADD bands', () => {
    const low = { right: { sph: -2.5, add: 'LOW' }, left: { sph: -2.5, add: 'LOW' } } as RxInput;
    const high = { right: { sph: -2.5, add: 'HIGH' }, left: { sph: -2.5, add: 'HIGH' } } as RxInput;
    expect(lineKey(V, low)).not.toBe(lineKey(V, high));
  });
});

describe('lineKey — stability', () => {
  const rx: RxInput = { sameBothEyes: false, right: { sph: -2.5, add: 'MID' }, left: { sph: -3 } };

  it('survives a JSON round-trip, as localStorage rehydration performs', () => {
    const round = JSON.parse(JSON.stringify(rx)) as RxInput;
    expect(lineKey(V, round)).toBe(lineKey(V, rx));
  });

  it('is URL-safe and usable as a React key', () => {
    const key = lineKey(V, rx);
    expect(key.length).toBeGreaterThan(0);
    expect(key).not.toMatch(/\s/);
    expect(encodeURIComponent(key)).toBe(key);
  });

  it('is deterministic across repeated calls', () => {
    expect(new Set([lineKey(V, rx), lineKey(V, rx), lineKey(V, rx)]).size).toBe(1);
  });

  it('remains readable enough to debug in DevTools', () => {
    // Deliberately not an opaque digest: a wrong key should be obvious on sight.
    expect(lineKey(V, rx)).toContain(V);
    expect(lineKey(V, rx)).toContain('2.50');
  });
});
