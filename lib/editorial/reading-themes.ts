import type { Locale } from '@/lib/i18n/config';
import type { Product } from '@/lib/api/schemas/catalog';
import type { ReadingTheme } from '@/lib/api/schemas/editorial';

/**
 * Where an Article's Reading Theme leads in the catalog — the lenses shown beside its
 * body and the collection its closing banner opens (ADR-0018).
 *
 * This table is why an Article needs no product reference of its own, which is what
 * keeps `editorial` migratable ahead of `catalog`. It lives here, in the app, rather
 * than in the editorial resource, so the dependency runs page-ward and not resource-ward.
 *
 * Two kinds, because the table is partial and says so in the type rather than through a
 * runtime `undefined`: `care` covers solution, cases and hygiene, and the catalog sells
 * lenses. Same union shape as `LensEntry`, and for the same reason — a `none` entry has
 * no collection and should not have to carry an empty one.
 */
export type ReadingThemeEntry =
  | { kind: 'none'; readingTheme: ReadingTheme }
  | {
      kind: 'collection';
      readingTheme: ReadingTheme;
      collection: string;
      /** A comma-separated set reaches the catalog as one filter, as a Color Family does. */
      colors?: string[];
      /** Matched as exact catalog wording, not a taxonomy — see `productQuerySchema`. */
      material?: string;
    };

export type ReadingThemeDestination = Extract<ReadingThemeEntry, { kind: 'collection' }>;

/**
 * PROVISIONAL in the same sense as the article fixtures: these pair Vivimoon's writing
 * with Vivimoon's merchandising, and Vivimoon owns both. The pairings are chosen so each
 * one answers the question its articles raise — `comfort` opens the Silicone Hydrogel
 * lenses because that is what its article is about, not because it is a large bucket.
 */
export const READING_THEME_ENTRIES: ReadingThemeEntry[] = [
  /* First-time wearers are steered to dailies: nothing to clean, nothing to store
     wrong. Pointed at `beginner-friendly` rather than `daily-lenses` since #123, so
     the beginner Article and the beginner Guide recommend the same shelf — two
     different "for beginners" destinations is a recommendation a shopper cannot act
     on, because neither says which one it is. */
  { kind: 'collection', readingTheme: 'beginner', collection: 'beginner-friendly' },
  { kind: 'collection', readingTheme: 'comfort', collection: 'all-lenses', material: 'Silicone Hydrogel' },
  { kind: 'collection', readingTheme: 'natural', collection: 'colored-lenses', colors: ['brown', 'gray'] },
  { kind: 'collection', readingTheme: 'makeup', collection: 'colored-lenses' },
  { kind: 'collection', readingTheme: 'occasion', collection: 'bestsellers' },
  // Solution, cases and hygiene. Vivimoon sells no such thing, so this one leads nowhere
  // and the article ends on its last paragraph.
  { kind: 'none', readingTheme: 'care' },
];

export function readingThemeEntry(readingTheme: ReadingTheme): ReadingThemeEntry {
  const found = READING_THEME_ENTRIES.find((entry) => entry.readingTheme === readingTheme);
  // The table is held against the enum by `reading-themes.test.ts`, so this cannot
  // happen without that test failing first.
  if (!found) throw new Error(`no Reading Theme entry for "${readingTheme}"`);
  return found;
}

/**
 * The collection this theme opens, narrowed to what it names.
 *
 * Built by hand rather than through `URLSearchParams`, as `lensEntryHref` is: round-tripping
 * through `toString()` and decoding the result would decode the delimiters too, so the first
 * filter value containing `&`, `=` or `#` would turn its own escape back into a live
 * separator and silently open the collection with a different filter than the one counted.
 * A colour set stays comma-joined, which the catalog reads as one filter and a query string
 * allows unencoded; anything free-form is escaped as a value and nothing else is.
 */
export function readingThemeHref(entry: ReadingThemeDestination, locale: Locale): string {
  const filters = [
    entry.colors ? `color=${entry.colors.join(',')}` : null,
    entry.material ? `material=${encodeURIComponent(entry.material)}` : null,
  ].filter((filter): filter is string => filter !== null);

  const suffix = filters.length > 0 ? `?${filters.join('&')}` : '';
  return `/${locale}/collection/${entry.collection}${suffix}`;
}

/** Whether a product is one of the ones this theme leads to — the twin of its filter. */
export function readingThemeIncludes(entry: ReadingThemeDestination, product: Product): boolean {
  if (entry.colors && !product.variants.some((v) => v.color !== undefined && entry.colors!.includes(v.color))) {
    return false;
  }
  if (entry.material && product.specs.material !== entry.material) return false;
  return true;
}

/**
 * How many products the banner will actually show. Pass the products of
 * `entry.collection` — the count has to be taken inside the collection the entry's own
 * link opens, which is the mistake `countLensEntry` exists to prevent.
 */
export function countReadingTheme(entry: ReadingThemeDestination, productsInCollection: Product[]): number {
  return productsInCollection.filter((product) => readingThemeIncludes(entry, product)).length;
}
