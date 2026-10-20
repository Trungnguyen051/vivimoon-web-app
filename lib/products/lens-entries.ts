import type { Locale } from '@/lib/i18n/config';
import type { Product, ProductLine } from '@/lib/api/schemas/catalog';

/**
 * One tile in the homepage's "what lens are you after?" row — a place to start
 * browsing, not an attribute of a Product.
 *
 * Two kinds, because the row is not five colours. Four entries gather catalog
 * colors; Không màu selects the trong suốt Product Line by the *absence* of color
 * (CONTEXT.md). A union rather than one shape with optional fields: a `colour`
 * entry has colors and a `line` entry has a productLine, and neither has to carry
 * the other's emptiness. Same reason `NavItem` is a union.
 */
export type LensEntry =
  | { kind: 'colour'; id: 'brown' | 'black' | 'gray' | 'vivid'; colors: string[]; swatches: string[] }
  | { kind: 'line'; id: 'clear'; productLine: ProductLine; swatches: string[] };

export type LensEntryId = LensEntry['id'];

/**
 * PROVISIONAL — Vivimoon owns the real palette.
 *
 * The swatches follow the design (Figma frame `38:1531`), which shows blue, gold
 * and green under Màu sắc nổi bật. The catalog carries one vivid lens, a violet,
 * so these chips currently name shades we do not stock: the tile filters on
 * `colors` and will return violet while the chips show three other colours. That
 * divergence is deliberate — the mock catalog is the thin thing, not the design —
 * and closes itself when Vivimoon's real catalog lands. Do not reconcile the
 * swatches with `colors`; widen `colors` when the lenses exist (#80).
 */
export const LENS_ENTRIES: LensEntry[] = [
  { kind: 'colour', id: 'brown', colors: ['brown'], swatches: ['#8b6914', '#6b4423', '#c4956a'] },
  { kind: 'colour', id: 'black', colors: ['black'], swatches: ['#1a1a1a', '#2e2e2e', '#0a0a0a'] },
  { kind: 'colour', id: 'gray', colors: ['gray'], swatches: ['#8a8f98', '#b9bec6', '#5c6470'] },
  { kind: 'colour', id: 'vivid', colors: ['violet'], swatches: ['#7eb3f5', '#e3c14e', '#63bd6e'] },
  // One swatch, drawn as an outlined white circle: there is no colour to show.
  { kind: 'line', id: 'clear', productLine: 'trongSuot', swatches: ['#ffffff'] },
];

/** Coloured lenses are their own collection; clear ones are only reachable through the whole catalog. */
export function lensEntryCollection(entry: LensEntry): string {
  return entry.kind === 'colour' ? 'colored-lenses' : 'all-lenses';
}

/**
 * The collection this tile opens, narrowed to what the tile names. The catalog
 * matches `color` against a comma-separated set, so a multi-colour entry stays one
 * link; `productLine` is a plain equality filter the catalog already supports,
 * which is why Không màu needs no collection of its own.
 */
export function lensEntryHref(entry: LensEntry, locale: Locale): string {
  const query =
    entry.kind === 'colour'
      ? `color=${entry.colors.join(',')}`
      : `productLine=${entry.productLine}`;

  return `/${locale}/collection/${lensEntryCollection(entry)}?${query}`;
}

/** Whether a product is one of the ones this tile leads to — the client-side twin of its filter. */
export function lensEntryIncludes(entry: LensEntry, product: Product): boolean {
  return entry.kind === 'colour'
    ? product.variants.some((v) => v.color !== undefined && entry.colors.includes(v.color))
    : product.productLine === entry.productLine;
}

/**
 * How many products the tile will actually show. Pass the products of
 * `lensEntryCollection(entry)` — each entry counts inside the collection its own
 * link opens, which is the point of the rule travelling with the entry: counting
 * Không màu among coloured lenses would report zero for a tile the design says
 * holds two.
 */
export function countLensEntry(entry: LensEntry, productsInCollection: Product[]): number {
  return productsInCollection.filter((product) => lensEntryIncludes(entry, product)).length;
}
