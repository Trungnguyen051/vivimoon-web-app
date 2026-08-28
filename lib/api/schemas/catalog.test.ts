import { describe, it, expect } from 'vitest';
import { productSchema, reviewSchema, productQuerySchema, parseProductQueryLoose } from './catalog';

const validProduct = {
  id: 'p1', slug: 'aqua', name: 'Aqua', brandId: 'b1', brandName: 'Brand',
  type: 'colored', replacement: 'daily', description: 'd', images: ['/a.jpg'],
  badges: ['new'],
  specs: {
    material: 'Hydrogel', waterContent: '38%', baseCurve: '8.6mm',
    diameter: '14.2mm', uvProtection: true, manufacturer: 'M',
  },
  variants: [{
    id: 'v1', sku: 'S1', packSize: '10 lenses', price: 250000,
    currency: 'VND', stock: 5,
  }],
  rating: 4.5, reviewCount: 10,
};

describe('productSchema', () => {
  it('accepts a valid product', () => {
    expect(productSchema.parse(validProduct).slug).toBe('aqua');
  });

  it('rejects an unknown lens type', () => {
    const bad = { ...validProduct, type: 'banana' };
    expect(() => productSchema.parse(bad)).toThrow();
  });

  it('rejects a rating outside 0-5', () => {
    expect(() => productSchema.parse({ ...validProduct, rating: 9 })).toThrow();
  });

  it('rejects a product with no variants', () => {
    expect(() => productSchema.parse({ ...validProduct, variants: [] })).toThrow();
  });

  it('rejects a non-integer price, since VND has no minor unit', () => {
    const bad = { ...validProduct, variants: [{ ...validProduct.variants[0], price: 1.5 }] };
    expect(() => productSchema.parse(bad)).toThrow();
  });
});

describe('reviewSchema', () => {
  it('defaults source to vivimoon when absent', () => {
    const r = reviewSchema.parse({
      id: 'r1', productId: 'p1', author: 'A', rating: 5,
      title: 't', body: 'b', createdAt: '2026-01-01', hasImages: false,
    });
    expect(r.source).toBe('vivimoon');
  });

  it('accepts a mirrored marketplace review', () => {
    const r = reviewSchema.parse({
      id: 'r2', productId: 'p1', author: 'B', rating: 4,
      title: 't', body: 'b', createdAt: '2026-01-01', hasImages: true,
      source: 'shopee', sourceUrl: 'https://shopee.vn/x',
    });
    expect(r.source).toBe('shopee');
  });
});

describe('productQuerySchema', () => {
  it('parses URL search params, ignoring blanks', () => {
    const q = productQuerySchema.parse({ type: 'colored', color: '', sort: 'price-asc' });
    expect(q).toEqual({ type: 'colored', sort: 'price-asc' });
  });

  it('rejects an unknown sort', () => {
    expect(() => productQuerySchema.parse({ sort: 'cheapest' })).toThrow();
  });
});

describe('parseProductQueryLoose', () => {
  it('keeps a valid field and drops an invalid one from a mixed query', () => {
    const q = parseProductQueryLoose({ type: 'colored', sort: 'banana' });
    expect(q).toEqual({ type: 'colored' });
  });

  it('behaves the same as productQuerySchema.parse for an all-valid query', () => {
    const input = { type: 'colored', sort: 'price-asc' };
    expect(parseProductQueryLoose(input)).toEqual(productQuerySchema.parse(input));
  });

  it('still drops blank-string params', () => {
    const q = parseProductQueryLoose({ type: 'colored', color: '' });
    expect(q).toEqual({ type: 'colored' });
  });
});
