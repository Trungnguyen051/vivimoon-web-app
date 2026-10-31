import type { ProductQuery } from '@/lib/api/schemas/catalog';

/**
 * The query fields that change *which* products a list contains, in the order they
 * appear in an id. `sort` is deliberately absent: it reorders a list rather than
 * changing its membership, so including it would report one list under four ids and
 * split the engagement figures for no gain.
 */
const MEMBERSHIP_FILTERS = [
  'brandId', 'color', 'diameter', 'material', 'productLine', 'replacement',
] as const;

/**
 * `color` is an unvalidated string the catalog matches as a set, so a URL can carry
 * junk alongside a real colour and still render products. Left as-is it would reach
 * GA4 verbatim — unbounded distinct ids for one list, past the 100-character limit,
 * which is the cardinality problem this id exists to avoid. Sorting and de-duplicating
 * also keeps `?color=gray,brown` and `?color=brown,gray` one list rather than two.
 */
function normalizeColors(color: string | undefined, collectionColors: string[]): string | undefined {
  if (!color) return undefined;

  const known = [...new Set(color.split(',').filter((value) => collectionColors.includes(value)))].sort();
  return known.length > 0 ? known.join(',') : undefined;
}

/**
 * The GA4 `item_list_id` for a collection view.
 *
 * A collection alone cannot identify the list: every Color Family tile opened
 * `colored-lenses` and every duration tile `all-lenses`, so "which colour do shoppers
 * browse" was unanswerable from the data, and a filtered view looked like the whole
 * catalog (#57). The active filters join the slug, in a fixed field order so the same
 * list reports one id however its URL was built.
 *
 * An unfiltered view keeps the bare slug, so ids already collected stay continuous.
 * `collectionColors` are the colours this collection contains, which bound the only
 * free-form field.
 */
export function collectionListId(slug: string, query: ProductQuery, collectionColors: string[]): string {
  const values = {
    brandId: query.brandId,
    color: normalizeColors(query.color, collectionColors),
    // Neither of these needs `color`'s treatment. The catalog matches both by
    // equality rather than as a set, so junk cannot ride along with a real value
    // and still return products — a junk id would label an empty list, where a
    // junk colour labels a populated one. `diameter` is shape-checked by the
    // schema besides. Unbounded in principle, as `brandId` already is.
    diameter: query.diameter,
    material: query.material,
    productLine: query.productLine,
    replacement: query.replacement,
  };

  const applied = MEMBERSHIP_FILTERS
    .filter((field) => values[field] !== undefined)
    .map((field) => `${field}=${values[field]}`);

  return [slug, ...applied].join(':');
}
