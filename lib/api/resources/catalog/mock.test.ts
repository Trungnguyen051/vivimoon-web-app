import { describe, it, expect } from 'vitest';
import { mockCatalog } from './mock';

describe('mockCatalog', () => {
  it('finds a product by slug', async () => {
    const p = await mockCatalog.getProductBySlug('aqua-daily-clear');
    expect(p?.name).toBe('Aqua Daily Clear');
  });

  it('returns null for an unknown slug', async () => {
    expect(await mockCatalog.getProductBySlug('nope')).toBeNull();
  });

  it('filters by lens type', async () => {
    const list = await mockCatalog.listProducts({ type: 'colored' });
    expect(list.length).toBeGreaterThan(0);
    expect(list.every((p) => p.type === 'colored')).toBe(true);
  });

  it('filters by replacement schedule', async () => {
    const list = await mockCatalog.listProducts({ replacement: 'daily' });
    expect(list.length).toBeGreaterThan(0);
    expect(list.every((p) => p.replacement === 'daily')).toBe(true);
  });

  it('filters by variant color', async () => {
    const all = await mockCatalog.listProducts();
    const color = all.flatMap((p) => p.variants.map((v) => v.color)).find(Boolean)!;
    const list = await mockCatalog.listProducts({ color });
    expect(list.every((p) => p.variants.some((v) => v.color === color))).toBe(true);
  });

  it('sorts by price ascending', async () => {
    const list = await mockCatalog.listProducts({ sort: 'price-asc' });
    const prices = list.map((p) => Math.min(...p.variants.map((v) => v.price)));
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  it('sorts by price descending', async () => {
    const list = await mockCatalog.listProducts({ sort: 'price-desc' });
    const prices = list.map((p) => Math.min(...p.variants.map((v) => v.price)));
    expect(prices).toEqual([...prices].sort((a, b) => b - a));
  });

  it('does not mutate the fixture array when sorting', async () => {
    const before = (await mockCatalog.listProducts()).map((p) => p.id);
    await mockCatalog.listProducts({ sort: 'price-desc' });
    const after = (await mockCatalog.listProducts()).map((p) => p.id);
    expect(after).toEqual(before);
  });

  it('resolves products by id, dropping unknown ids', async () => {
    const all = await mockCatalog.listProducts();
    const list = await mockCatalog.getProductsByIds([all[0].id, 'ghost']);
    expect(list.map((p) => p.id)).toEqual([all[0].id]);
  });

  it('excludes the source product from related products', async () => {
    const p = (await mockCatalog.listProducts())[0];
    const related = await mockCatalog.getRelatedProducts(p);
    expect(related.some((r) => r.id === p.id)).toBe(false);
  });

  it('honours the related-products limit', async () => {
    const p = (await mockCatalog.listProducts())[0];
    const unlimited = await mockCatalog.getRelatedProducts(p);
    if (unlimited.length <= 2) throw new Error('fixtures have no product with more than 2 related products');
    const limited = await mockCatalog.getRelatedProducts(p, 2);
    expect(limited.length).toBe(2);
  });

  it('returns only reviews for the requested product', async () => {
    const all = await mockCatalog.listProducts();
    const withReviews = await Promise.all(
      all.map(async (p) => ({ product: p, reviews: await mockCatalog.getReviews(p.id) })),
    );
    const target = withReviews.find((x) => x.reviews.length > 0);
    if (!target) throw new Error('fixtures have no product with reviews');
    expect(target.reviews.every((r) => r.productId === target.product.id)).toBe(true);
  });

  it('lists collections', async () => {
    expect((await mockCatalog.listCollections()).length).toBeGreaterThan(0);
  });
});
