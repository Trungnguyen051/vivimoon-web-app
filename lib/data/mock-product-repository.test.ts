import { describe, it, expect } from 'vitest';
import { MockProductRepository } from './mock-product-repository';

const repo = new MockProductRepository();

describe('MockProductRepository', () => {
  it('finds a product by slug', async () => {
    const p = await repo.getProductBySlug('aqua-daily-clear');
    expect(p?.name).toBe('Aqua Daily Clear');
  });

  it('returns null for unknown slug', async () => {
    expect(await repo.getProductBySlug('nope')).toBeNull();
  });

  it('filters by lens type', async () => {
    const list = await repo.listProducts({ type: 'colored' });
    expect(list.every((p) => p.type === 'colored')).toBe(true);
    expect(list.length).toBeGreaterThan(0);
  });

  it('sorts by price ascending', async () => {
    const list = await repo.listProducts({ sort: 'price-asc' });
    const prices = list.map((p) => Math.min(...p.variants.map((v) => v.price)));
    const sorted = [...prices].sort((a, b) => a - b);
    expect(prices).toEqual(sorted);
  });

  it('excludes the source product from related', async () => {
    const p = await repo.getProductBySlug('aqua-daily-clear');
    const related = await repo.getRelatedProducts(p!, 4);
    expect(related.find((r) => r.id === p!.id)).toBeUndefined();
    expect(related.length).toBeLessThanOrEqual(4);
  });

  it('returns reviews for a product', async () => {
    const rs = await repo.getReviews('p-aqua-daily');
    expect(rs.length).toBeGreaterThanOrEqual(2);
  });
});
