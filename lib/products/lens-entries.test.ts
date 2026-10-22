import { describe, it, expect } from 'vitest';
import {
  LENS_ENTRIES, lensEntryCollection, lensEntryHref, lensEntryIncludes, countLensEntry,
} from './lens-entries';
import { mockCatalog } from '@/lib/api/resources/catalog/mock';
import { parseProductQueryLoose } from '@/lib/api/schemas/catalog';
import { products } from '@/content/mock';

/**
 * What a shopper gets after following a tile, by the collection page's own path: the
 * collection's products intersected with the parsed query. Testing the catalog alone
 * would miss a tile pointed at a collection holding none of its products — the link
 * would look right and land empty.
 */
async function followTile(href: string) {
  const url = new URL(href, 'https://vivimoon.test');
  const collection = await mockCatalog.getCollection(url.pathname.split('/collection/')[1]);
  const base = await mockCatalog.getProductsByIds(collection!.productIds);
  const ids = new Set(base.map((p) => p.id));

  const filtered = await mockCatalog.listProducts(parseProductQueryLoose(Object.fromEntries(url.searchParams)));
  return filtered.filter((p) => ids.has(p.id));
}

describe('lens entry points', () => {
  it('offers five entries, with Không màu last', () => {
    expect(LENS_ENTRIES.map((e) => e.id)).toEqual(['brown', 'black', 'gray', 'vivid', 'clear']);
  });

  /**
   * Không màu is the trong suốt Product Line, not a fifth colour (CONTEXT.md). Pinned
   * because the obvious shortcut — bolting it onto the colour entries — yields an empty
   * `?color=` filter and a link into the one collection clear lenses are absent from.
   */
  it('opens Không màu on the product line rather than a colour filter', () => {
    const href = lensEntryHref(LENS_ENTRIES.find((e) => e.id === 'clear')!, 'vi');

    expect(href).toContain('productLine=trongSuot');
    expect(href).not.toContain('color=');
  });

  /** Every tile promises products behind it; none is exempt (#41). */
  it.each(LENS_ENTRIES)('$id does not dead-end', async (entry) => {
    expect(await followTile(lensEntryHref(entry, 'vi'))).not.toHaveLength(0);
  });

  /**
   * The number on a tile is a promise about the page behind it. Hard-coded counts broke
   * that quietly once already — Nâu advertised 14 products over a collection holding one.
   * Each entry now counts within the collection its *own* link opens, which is the whole
   * reason the count rule travels with the entry: Không màu counted among coloured lenses
   * would report zero.
   */
  it.each(LENS_ENTRIES)('$id counts exactly the products its tile lists', async (entry) => {
    const collection = await mockCatalog.getCollection(lensEntryCollection(entry));
    const inCollection = await mockCatalog.getProductsByIds(collection!.productIds);

    expect(countLensEntry(entry, inCollection)).toBe((await followTile(lensEntryHref(entry, 'vi'))).length);
  });

  /**
   * The entries are declared, not derived, so a colour added to the catalog without a home
   * here would belong to no tile — unreachable by colour browsing. This is the guard the
   * old `COLOR_FAMILIES` carried, restated against the new shape rather than dropped.
   */
  it('gives every catalog colour exactly one entry', () => {
    const colours = [...new Set(products.flatMap((p) => p.variants.map((v) => v.color).filter((c) => c !== undefined)))];

    for (const colour of colours) {
      const owning = LENS_ENTRIES.filter((e) => e.kind === 'colour' && e.colors.includes(colour));
      expect(owning.map((e) => e.id), `colour with no entry: ${colour}`).toHaveLength(1);
    }
  });

  /**
   * Every product is reachable through the row — at least one tile, not exactly one.
   * A product with a brown variant and a gray one belongs under both Nâu and Xám,
   * which is the point of browsing by colour: `p-hazel-monthly` is sold in two, and
   * a shopper looking for either should find it.
   */
  it('leaves no product unreachable from the row', () => {
    for (const product of products) {
      const owning = LENS_ENTRIES.filter((e) => lensEntryIncludes(e, product));
      expect(owning.map((e) => e.id), `product reachable from no tile: ${product.id}`).not.toHaveLength(0);
    }
  });

  it('shows at most three swatches per entry', () => {
    for (const entry of LENS_ENTRIES) expect(entry.swatches.length).toBeLessThanOrEqual(3);
  });

  /*
   * Swatch *values* are deliberately not asserted. They are provisional placeholders
   * that follow the design ahead of the catalog (#80), so pinning them would fail the
   * day Vivimoon supplies the real palette — which is the day we want them to change.
   */
});
