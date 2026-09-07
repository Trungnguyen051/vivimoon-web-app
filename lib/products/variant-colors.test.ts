import { describe, it, expect } from 'vitest';
import { distinctColorVariants } from './variant-colors';
import type { Variant } from '@/lib/api/schemas/catalog';

const variant = (overrides: Partial<Variant>): Variant => ({
  id: 'v', sku: 'S', price: 10, currency: 'USD', stock: 1, ...overrides,
});

describe('distinctColorVariants', () => {
  it('keeps one variant per distinct color, in first-seen order', () => {
    const variants = [
      variant({ id: 'v1', color: 'brown' }),
      variant({ id: 'v2', color: 'gray' }),
    ];
    expect(distinctColorVariants(variants).map((v) => v.id)).toEqual(['v1', 'v2']);
  });

  it('drops variants with no color', () => {
    expect(distinctColorVariants([variant({ id: 'v1' })])).toEqual([]);
  });

  it('collapses a repeated color to one entry (productSchema forbids this in real data)', () => {
    const variants = [
      variant({ id: 'v1', color: 'brown' }),
      variant({ id: 'v2', color: 'brown' }),
    ];
    expect(distinctColorVariants(variants)).toHaveLength(1);
  });
});
