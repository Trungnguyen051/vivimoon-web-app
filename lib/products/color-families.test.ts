import { describe, it, expect } from 'vitest';
import { COLOR_FAMILIES, COLOR_FAMILY_COLLECTION, colorFamilyHref, countColorFamily } from './color-families';
import { mockCatalog } from '@/lib/api/resources/catalog/mock';
import { parseProductQueryLoose } from '@/lib/api/schemas/catalog';
import { products } from '@/content/mock';

/**
 * What a shopper gets after following a family tile, by the collection page's own
 * path: the collection's products intersected with the parsed query. Testing the
 * catalog alone would miss a tile pointed at a collection that holds none of the
 * family's colors — the link would look right and land empty.
 */
async function followTile(href: string) {
  const url = new URL(href, 'https://vivimoon.test');
  const collection = await mockCatalog.getCollection(url.pathname.split('/collection/')[1]);
  const base = await mockCatalog.getProductsByIds(collection!.productIds);
  const ids = new Set(base.map((p) => p.id));

  const filtered = await mockCatalog.listProducts(parseProductQueryLoose(Object.fromEntries(url.searchParams)));
  return filtered.filter((p) => ids.has(p.id));
}

describe('Color Family', () => {
  /**
   * A family is a browsing grouping over catalog colors, not a field on a Product
   * (CONTEXT.md). The link is where the grouping becomes real, so this pins the
   * whole path: family → href → query → the products the page lists.
   */
  it.each(COLOR_FAMILIES)('$id lists exactly the products carrying its colors', async (family) => {
    const listed = await followTile(colorFamilyHref(family, 'vi'));
    const collection = await mockCatalog.getCollection('colored-lenses');
    const expected = products.filter(
      (p) => collection!.productIds.includes(p.id) && p.variants.some((v) => v.color && family.colors.includes(v.color)),
    );

    expect(listed.map((p) => p.id).sort()).toEqual(expected.map((p) => p.id).sort());
  });

  /**
   * The tile promises products behind it. `black` is the one knowingly empty tile —
   * the fixtures carry no black lenses until #41 — and that gap is tracked, not hidden.
   */
  it.each(COLOR_FAMILIES.filter((f) => f.id !== 'black'))('$id does not dead-end', async (family) => {
    expect(await followTile(colorFamilyHref(family, 'vi'))).not.toHaveLength(0);
  });

  /**
   * The number on a tile is a promise about the page behind it. Hard-coded counts
   * broke that quietly — Nâu advertised 14 products over a collection holding one,
   * and Đen advertised 10 over none — so the count is derived from the same
   * collection the link opens, and this pins the two together.
   */
  it.each(COLOR_FAMILIES)('$id counts exactly the products its tile lists', async (family) => {
    const collection = await mockCatalog.getCollection(COLOR_FAMILY_COLLECTION);
    const inCollection = await mockCatalog.getProductsByIds(collection!.productIds);

    expect(countColorFamily(family, inCollection)).toBe((await followTile(colorFamilyHref(family, 'vi'))).length);
  });

  /**
   * The families are declared, not derived, so a color added to the catalog without
   * a home here would belong to no tile — unreachable by colour browsing.
   */
  it('gives every catalog color exactly one family', () => {
    const catalogColors = [...new Set(products.flatMap((p) => p.variants.map((v) => v.color).filter((c) => c !== undefined)))];

    for (const color of catalogColors) {
      expect(COLOR_FAMILIES.filter((f) => f.colors.includes(color)).map((f) => f.id)).toHaveLength(1);
    }
  });

  it('shows at most three swatches per family', () => {
    for (const family of COLOR_FAMILIES) expect(family.swatches.length).toBeLessThanOrEqual(3);
  });
});
