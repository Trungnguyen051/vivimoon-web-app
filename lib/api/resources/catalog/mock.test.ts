import { describe, it, expect } from 'vitest';
import { mockCatalog, minPrice } from './mock';
import { PRICE_PRESETS, type Product } from '@/lib/api/schemas/catalog';
import { accessories, reviews } from '@/content/mock';

describe('mockCatalog', () => {
  it('finds a product by slug', async () => {
    const p = await mockCatalog.getProductBySlug('aqua-daily-clear');
    expect(p?.name).toBe('Aqua Daily Clear');
  });

  it('never lists an accessory, with or without filters (Product Kind)', async () => {
    const accessoryIds = new Set(accessories.map((a) => a.id));
    const lists = await Promise.all([
      mockCatalog.listProducts(),
      mockCatalog.listProducts({ sort: 'price-asc' }),
      mockCatalog.listProducts({ brandId: 'vivimoon' }),
    ]);
    for (const list of lists) {
      expect(list.length).toBeGreaterThan(0);
      expect(list.filter((p) => accessoryIds.has(p.id))).toEqual([]);
    }
  });

  it('has no detail page for an accessory, but prices it by variant id', async () => {
    expect(await mockCatalog.getProductBySlug('nuoc-ngam-lens')).toBeNull();
    const found = await mockCatalog.getVariantById('a-nuoc-ngam-120');
    expect(found?.product.kind).toBe('accessory');
    expect(found?.variant.label).toBe('120ml');
  });

  it('returns null for an unknown slug', async () => {
    expect(await mockCatalog.getProductBySlug('nope')).toBeNull();
  });

  it('filters by a comma-separated set of colors', async () => {
    const [brown, violet, both] = await Promise.all([
      mockCatalog.listProducts({ color: 'brown' }),
      mockCatalog.listProducts({ color: 'violet' }),
      mockCatalog.listProducts({ color: 'brown,violet' }),
    ]);

    expect(brown.length).toBeGreaterThan(0);
    expect(violet.length).toBeGreaterThan(0);
    expect(both.map((p) => p.id).sort()).toEqual([...new Set([...brown, ...violet].map((p) => p.id))].sort());
  });

  it('matches no product for an unknown color', async () => {
    expect(await mockCatalog.listProducts({ color: 'chartreuse' })).toHaveLength(0);
  });

  it('filters by product line', async () => {
    const list = await mockCatalog.listProducts({ productLine: 'coMau' });
    expect(list.length).toBeGreaterThan(0);
    expect(list.every((p) => p.productLine === 'coMau')).toBe(true);
  });

  it('filters by replacement schedule', async () => {
    const list = await mockCatalog.listProducts({ replacement: 'daily' });
    expect(list.length).toBeGreaterThan(0);
    expect(list.every((p) => p.replacement === 'daily')).toBe(true);
  });

  it('filters by a diameter bucket, taking both ends', async () => {
    const all = await mockCatalog.listProducts();
    const widths = all.map((p) => Number.parseFloat(p.specs.diameter));
    const [min, max] = [Math.min(...widths), Math.max(...widths)];

    const whole = await mockCatalog.listProducts({ diameter: `${min}-${max}` });
    expect(whole).toHaveLength(all.length);

    const narrowed = await mockCatalog.listProducts({ diameter: `${min}-${min}` });
    expect(narrowed.length).toBeGreaterThan(0);
    expect(narrowed.every((p) => Number.parseFloat(p.specs.diameter) === min)).toBe(true);
  });

  // Three of the five buckets the facet menu draws match no stock against this
  // catalog. That is the thin fixtures, not a broken filter — an empty collection
  // is the right answer, the same one an unknown color already gets.
  it('matches no product for a bucket nothing falls into', async () => {
    expect(await mockCatalog.listProducts({ diameter: '1.0-2.0' })).toHaveLength(0);
  });

  it('filters by material', async () => {
    const list = await mockCatalog.listProducts({ material: 'Hydrogel' });
    expect(list.length).toBeGreaterThan(0);
    expect(list.every((p) => p.specs.material === 'Hydrogel')).toBe(true);
  });

  it('filters by variant color', async () => {
    const all = await mockCatalog.listProducts();
    const color = all.flatMap((p) => p.variants.map((v) => v.color)).find(Boolean)!;
    const list = await mockCatalog.listProducts({ color });
    expect(list.length).toBeGreaterThan(0);
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
    expect(target.reviews.length).toBeLessThan(reviews.length);
  });

  it('lists collections', async () => {
    expect((await mockCatalog.listCollections()).length).toBeGreaterThan(0);
  });

  it('finds a gallery for a product that has one', async () => {
    const g = await mockCatalog.getGallery('p-aqua-daily');
    expect(g?.productId).toBe('p-aqua-daily');
  });

  it('returns null for a product with no gallery entry', async () => {
    expect(await mockCatalog.getGallery('p-torica-monthly')).toBeNull();
  });

  describe('searchProducts (#194)', () => {
    it('carries about two dozen lenses, so paging and counts are real', async () => {
      expect((await mockCatalog.listProducts()).length).toBeGreaterThanOrEqual(24);
    });

    it('pages with offset and limit and reports the total of the whole result', async () => {
      const all = await mockCatalog.listProducts({ sort: 'bestselling' });
      const page = await mockCatalog.searchProducts({ sort: 'bestselling' }, { offset: 8, limit: 8 });
      expect(page.total).toBe(all.length);
      expect(page.products.map((p) => p.id)).toEqual(all.slice(8, 16).map((p) => p.id));
    });

    it('narrows to a subset of ids when a collection is given', async () => {
      const all = await mockCatalog.listProducts();
      const ids = all.slice(0, 3).map((p) => p.id);
      const result = await mockCatalog.searchProducts({}, { ids });
      expect(result.total).toBe(3);
      expect(result.products.map((p) => p.id).sort()).toEqual([...ids].sort());
    });

    it.each([
      ['makeupStyle', 'pink', (p: Product) => Boolean(p.makeupStyles?.includes('pink'))],
      ['series', 'eyeconic', (p: Product) => Boolean(p.series?.includes('eyeconic'))],
      ['occasion', 'wedding', (p: Product) => Boolean(p.occasions?.includes('wedding'))],
    ] as const)('filters by %s', async (key, value, has) => {
      const all = await mockCatalog.listProducts();
      const list = await mockCatalog.listProducts({ [key]: value });
      expect(list.length).toBeGreaterThan(0);
      expect(list.length).toBeLessThan(all.length);
      expect(list.every(has)).toBe(true);
      expect(all.filter(has)).toHaveLength(list.length);
    });

    it('matches any value of a set within one facet', async () => {
      const [pink, orange, both] = await Promise.all([
        mockCatalog.listProducts({ makeupStyle: 'pink' }),
        mockCatalog.listProducts({ makeupStyle: 'orange' }),
        mockCatalog.listProducts({ makeupStyle: 'pink,orange' }),
      ]);
      const union = new Set([...pink, ...orange].map((p) => p.id));
      expect(both.map((p) => p.id).sort()).toEqual([...union].sort());
    });

    it('filters by an inclusive price range on the cheapest variant', async () => {
      const all = await mockCatalog.listProducts();
      const prices = all.map(minPrice).sort((a, b) => a - b);
      const mid = prices[Math.floor(prices.length / 2)];
      const list = await mockCatalog.listProducts({ minPrice: mid, maxPrice: mid });
      expect(list.length).toBeGreaterThan(0);
      expect(list.every((p) => minPrice(p) === mid)).toBe(true);
      expect((await mockCatalog.listProducts({ minPrice: mid })).every((p) => minPrice(p) >= mid)).toBe(true);
      expect((await mockCatalog.listProducts({ maxPrice: mid })).every((p) => minPrice(p) <= mid)).toBe(true);
    });

    it('counts each option against every other active facet but not its own', async () => {
      const { counts } = await mockCatalog.searchProducts({ replacement: 'daily', makeupStyle: 'natural' });
      // Within Hạn sử dụng an option counts what picking it would show, so other expiries are not zeroed.
      for (const r of ['daily', 'monthly'] as const) {
        expect(counts.replacement[r] ?? 0).toBe(
          (await mockCatalog.listProducts({ replacement: r, makeupStyle: 'natural' })).length,
        );
      }
      // Across facets, the active expiry narrows the makeup counts.
      expect(counts.makeupStyle.pink ?? 0).toBe(
        (await mockCatalog.listProducts({ replacement: 'daily', makeupStyle: 'pink' })).length,
      );
    });

    it('counts colours, diameters and the clear line too', async () => {
      const { counts } = await mockCatalog.searchProducts({});
      expect(counts.color.brown).toBe((await mockCatalog.listProducts({ color: 'brown' })).length);
      expect(counts.productLine.trongSuot).toBe((await mockCatalog.listProducts({ productLine: 'trongSuot' })).length);
      expect(counts.diameter['14.2-14.2']).toBe((await mockCatalog.listProducts({ diameter: '14.2-14.2' })).length);
    });

    it('counts an active value no product states, so a menu bucket still shows its number', async () => {
      const { counts } = await mockCatalog.searchProducts({ diameter: '14.3-14.5' });
      expect(counts.diameter['14.3-14.5']).toBe((await mockCatalog.listProducts({ diameter: '14.3-14.5' })).length);
    });

    it('counts each price preset against the other facets', async () => {
      const { counts } = await mockCatalog.searchProducts({ replacement: 'monthly' });
      for (const preset of PRICE_PRESETS) {
        expect(counts.price[preset.id] ?? 0).toBe(
          (await mockCatalog.listProducts({ replacement: 'monthly', minPrice: preset.min, maxPrice: preset.max })).length,
        );
      }
    });

    it('sorts best-selling by sold count', async () => {
      const list = await mockCatalog.listProducts({ sort: 'bestselling' });
      const sold = list.map((p) => p.soldCount ?? 0);
      expect(sold).toEqual([...sold].sort((a, b) => b - a));
    });
  });

  describe('Default Rx filter (#196)', () => {
    const covers = (p: Product, sph: number) => Boolean(p.sphRange && p.sphRange.min <= sph && sph <= p.sphRange.max);

    it('every lens fixture states the sph range it is stocked in', async () => {
      expect((await mockCatalog.listProducts()).every((p) => p.sphRange)).toBe(true);
    });

    it('keeps only lenses whose range covers both eyes', async () => {
      const all = await mockCatalog.listProducts();
      const list = await mockCatalog.listProducts({ rx: '-2.5,-7' });
      expect(list.length).toBeGreaterThan(0);
      expect(list.length).toBeLessThan(all.length);
      expect(list.every((p) => covers(p, -2.5) && covers(p, -7))).toBe(true);
      expect(all.filter((p) => covers(p, -2.5) && covers(p, -7))).toHaveLength(list.length);
    });

    it('drops a lens when only one eye is out of its range', async () => {
      const shallow = (await mockCatalog.listProducts()).find((p) => p.sphRange!.min > -10)!;
      const outside = shallow.sphRange!.min - 0.5;
      expect((await mockCatalog.listProducts({ rx: `-1,-1` })).map((p) => p.id)).toContain(shallow.id);
      expect((await mockCatalog.listProducts({ rx: `-1,${outside}` })).map((p) => p.id)).not.toContain(shallow.id);
      expect((await mockCatalog.listProducts({ rx: `${outside},-1` })).map((p) => p.id)).not.toContain(shallow.id);
    });

    it("narrows the other facets' counts too", async () => {
      const { counts } = await mockCatalog.searchProducts({ rx: '-8,-8' });
      expect(counts.replacement.monthly ?? 0).toBe((await mockCatalog.listProducts({ rx: '-8,-8', replacement: 'monthly' })).length);
    });
  });
});
