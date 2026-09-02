import { describe, it, expect } from 'vitest';
import { rxEyeSchema, rxSchema, rxSchemaForLensType } from './rx';

const ok = { sph: -2.5 };

describe('rxEyeSchema', () => {
  it('accepts a stocked sph step', () => {
    expect(rxEyeSchema.safeParse(ok).success).toBe(true);
  });

  it('accepts plano — cosmetic lenses are sold without correction', () => {
    expect(rxEyeSchema.safeParse({ sph: 0 }).success).toBe(true);
  });

  it('rejects an off-grid high power', () => {
    // -7.25 is between -6.00 and -10.00 but off the 0.50 grid: nobody makes it.
    expect(rxEyeSchema.safeParse({ sph: -7.25 }).success).toBe(false);
  });

  it('rejects a power beyond the range', () => {
    expect(rxEyeSchema.safeParse({ sph: -12 }).success).toBe(false);
  });

  it('rejects a numeric add — ADD is banded', () => {
    expect(rxEyeSchema.safeParse({ sph: -2.5, add: 2 }).success).toBe(false);
  });

  it('accepts a banded add', () => {
    expect(rxEyeSchema.safeParse({ sph: -2.5, add: 'MID' }).success).toBe(true);
  });

  it('accepts cyl/axis when present and valid', () => {
    expect(rxEyeSchema.safeParse({ sph: -2.5, cyl: -1.25, axis: 90 }).success).toBe(true);
  });

  it('accepts cyl/axis when absent — no lens type requires them in M2', () => {
    expect(rxEyeSchema.safeParse({ sph: -2.5 }).success).toBe(true);
  });

  it('rejects an off-grid axis', () => {
    expect(rxEyeSchema.safeParse({ sph: -2.5, cyl: -1.25, axis: 95 }).success).toBe(false);
  });

  it('rejects an unstocked cyl', () => {
    expect(rxEyeSchema.safeParse({ sph: -2.5, cyl: -1, axis: 90 }).success).toBe(false);
  });
});

describe('rxSchema', () => {
  it('defaults sameBothEyes to false', () => {
    const parsed = rxSchema.parse({ right: ok, left: { sph: -3 } });
    expect(parsed.sameBothEyes).toBe(false);
  });

  it('normalises left to equal right when sameBothEyes is set', () => {
    const parsed = rxSchema.parse({ sameBothEyes: true, right: ok });
    expect(parsed.left).toEqual(parsed.right);
    expect(parsed.left.sph).toBe(-2.5);
  });

  it('overrides a supplied left when sameBothEyes is set', () => {
    const parsed = rxSchema.parse({ sameBothEyes: true, right: ok, left: { sph: -5 } });
    expect(parsed.left.sph).toBe(-2.5);
  });

  it('requires left when the eyes differ', () => {
    expect(rxSchema.safeParse({ sameBothEyes: false, right: ok }).success).toBe(false);
  });

  it('always produces both eyes, so downstream code never branches on absence', () => {
    const parsed = rxSchema.parse({ sameBothEyes: true, right: ok });
    expect(parsed.right).toBeDefined();
    expect(parsed.left).toBeDefined();
  });
});

describe('rxSchemaForLensType', () => {
  const both = (eye: Record<string, unknown>) => ({ right: eye, left: eye });

  it('requires add on both eyes for multifocal', () => {
    const schema = rxSchemaForLensType('multifocal');
    expect(schema.safeParse(both({ sph: -2.5 })).success).toBe(false);
    expect(schema.safeParse(both({ sph: -2.5, add: 'LOW' })).success).toBe(true);
  });

  it('rejects add on non-multifocal lens types', () => {
    for (const type of ['clear', 'colored', 'toric'] as const) {
      const schema = rxSchemaForLensType(type);
      expect(schema.safeParse(both({ sph: -2.5, add: 'LOW' })).success).toBe(false);
      expect(schema.safeParse(both({ sph: -2.5 })).success).toBe(true);
    }
  });

  it('rejects a multifocal missing add on only one eye', () => {
    const schema = rxSchemaForLensType('multifocal');
    const result = schema.safeParse({ right: { sph: -2.5, add: 'LOW' }, left: { sph: -2.5 } });
    expect(result.success).toBe(false);
  });

  it('does not require cyl/axis for toric in M2 — toric is deferred', () => {
    // Spec §15: cyl/axis validate when present but no selector collects them.
    const schema = rxSchemaForLensType('toric');
    expect(schema.safeParse(both({ sph: -2.5 })).success).toBe(true);
    expect(schema.safeParse(both({ sph: -2.5, cyl: -1.25, axis: 90 })).success).toBe(true);
  });
});
