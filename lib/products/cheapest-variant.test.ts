import { describe, it, expect } from 'vitest';
import { cheapestVariant } from './cheapest-variant';
import type { Product } from '@/lib/api/schemas/catalog';

const product = (variants: Product['variants']): Product => ({
  id: 'p', slug: 'p', name: 'P', brandId: 'b', brandName: 'B', type: 'clear', replacement: 'daily',
  description: '', images: ['/a.jpg'], badges: [],
  specs: { material: '', waterContent: '', baseCurve: '', diameter: '', origin: '' },
  requiresRx: true, variants, rating: 4, reviewCount: 0,
});

describe('cheapestVariant', () => {
  it('returns the lowest-priced variant', () => {
    const p = product([
      { id: 'v1', sku: 'S1', price: 30, currency: 'USD', stock: 1 },
      { id: 'v2', sku: 'S2', price: 20, currency: 'USD', stock: 1 },
    ]);
    expect(cheapestVariant(p).id).toBe('v2');
  });

  it('breaks a tie by array order', () => {
    const p = product([
      { id: 'v1', sku: 'S1', price: 20, currency: 'USD', stock: 1 },
      { id: 'v2', sku: 'S2', price: 20, currency: 'USD', stock: 1 },
    ]);
    expect(cheapestVariant(p).id).toBe('v1');
  });
});
