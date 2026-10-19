import { describe, it, expect } from 'vitest';
import { DURATION_TILES, durationTileHref } from './duration-tiles';
import { mockCatalog } from '@/lib/api/resources/catalog/mock';
import { parseProductQueryLoose } from '@/lib/api/schemas/catalog';

/** What a shopper gets after following a tile, by the collection page's own path. */
async function followTile(href: string) {
  const url = new URL(href, 'https://vivimoon.test');
  const collection = await mockCatalog.getCollection(url.pathname.split('/collection/')[1]);
  if (!collection) return null;

  const base = await mockCatalog.getProductsByIds(collection.productIds);
  const ids = new Set(base.map((p) => p.id));
  const filtered = await mockCatalog.listProducts(parseProductQueryLoose(Object.fromEntries(url.searchParams)));
  return filtered.filter((p) => ids.has(p.id));
}

describe('duration tiles', () => {
  /**
   * The bug #49 records: two tiles pointed at a collection holding no product of
   * their duration, so they opened empty pages while the catalog had the lenses all
   * along. Asserting the fixtures alone cannot catch that — it was the tile's
   * destination that was wrong — so this follows each tile where it actually goes.
   */
  it.each(DURATION_TILES)('$id opens a collection that has products of that duration', async (tile) => {
    const listed = await followTile(durationTileHref(tile, 'vi'));

    expect(listed, `${tile.id} points at a collection that does not exist`).not.toBeNull();
    expect(listed).not.toHaveLength(0);
    expect(listed!.every((p) => p.replacement === tile.id)).toBe(true);
  });
});
