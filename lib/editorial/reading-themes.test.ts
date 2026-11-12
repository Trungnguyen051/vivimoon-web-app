import { describe, it, expect } from 'vitest';
import {
  READING_THEME_ENTRIES,
  readingThemeDestination,
  readingThemeHref,
  readingThemeIncludes,
  countReadingTheme,
} from './reading-themes';
import { readingThemeSchema } from '@/lib/api/schemas/editorial';
import { catalog } from '@/lib/api/resources/catalog';
import type { Product } from '@/lib/api/schemas/catalog';

/** The products of the collection an entry's own link opens — what its count is taken within. */
async function productsBehind(collection: string): Promise<Product[]> {
  const found = await catalog.getCollection(collection);
  return found ? catalog.getProductsByIds(found.productIds) : [];
}

describe('Reading Theme destinations', () => {
  it('has exactly one entry per Reading Theme', () => {
    expect(READING_THEME_ENTRIES.map((e) => e.readingTheme).sort()).toEqual(
      [...readingThemeSchema.options].sort(),
    );
  });

  /**
   * The table is partial on purpose (ADR-0018). Chăm sóc lens is about solution, cases
   * and hygiene; the catalog sells lenses. An article under it ends without a product
   * strip or a banner, which is the honest outcome — defaulting it to the whole catalog
   * would merchandise lenses beneath an article about cleaning solution.
   */
  it('gives chăm sóc lens no destination, and every other theme one', () => {
    expect(readingThemeDestination('care')).toBeNull();

    for (const theme of readingThemeSchema.options.filter((t) => t !== 'care')) {
      expect(readingThemeDestination(theme), theme).not.toBeNull();
    }
  });

  it('carries its filter in the href, so one link opens a narrowed collection', () => {
    const natural = readingThemeDestination('natural')!;
    const beginner = readingThemeDestination('beginner')!;

    expect(readingThemeHref(natural, 'vi')).toBe('/vi/collection/colored-lenses?color=brown,gray');
    // An unfiltered destination carries no query at all rather than a trailing "?".
    expect(readingThemeHref(beginner, 'en')).toBe('/en/collection/beginner-friendly');
  });

  /**
   * A material is free-form catalog wording, so it is escaped as a value — and only as a
   * value. Decoding a whole built query string would hand back any `&`, `=` or `#` inside
   * it as a live delimiter, opening the collection with a filter nobody chose.
   */
  it('escapes a free-form filter value without touching the delimiters', () => {
    const comfort = readingThemeDestination('comfort')!;

    expect(readingThemeHref(comfort, 'vi')).toBe('/vi/collection/all-lenses?material=Silicone%20Hydrogel');
    expect(new URL(readingThemeHref(comfort, 'vi'), 'https://x').searchParams.get('material'))
      .toBe(comfort.material);

    expect(readingThemeHref({ ...comfort, material: 'A & B=C#D' }, 'vi'))
      .toBe('/vi/collection/all-lenses?material=A%20%26%20B%3DC%23D');
    expect(new URL(readingThemeHref({ ...comfort, material: 'A & B=C#D' }, 'vi'), 'https://x').searchParams.get('material'))
      .toBe('A & B=C#D');
  });

  /**
   * The banner states "Xem {n} mẫu…", so a destination that resolves to nothing is a
   * link promising products it will not show. `#116` added `material`, which the catalog
   * matches as exact wording rather than a taxonomy — a near-miss like "silicone hydrogel"
   * answers 200 with an empty collection, and only a count catches that.
   */
  it('never points a shopper at an empty collection', async () => {
    for (const entry of READING_THEME_ENTRIES) {
      if (entry.kind !== 'collection') continue;

      const count = countReadingTheme(entry, await productsBehind(entry.collection));
      expect(count, `${entry.readingTheme} → ${entry.collection}`).toBeGreaterThan(0);
    }
  });

  /**
   * The count has to be taken inside the collection the entry's own link opens, and
   * narrowed the same way — the lesson `lens-entries` records, where counting a tile
   * against the wrong collection reported zero for a tile holding two.
   *
   * Fourteen of the twenty-four catalog products are Silicone Hydrogel, counted from the fixtures.
   */
  it('counts within its own filter, not across the whole collection', async () => {
    const comfort = readingThemeDestination('comfort')!;

    const all = await productsBehind(comfort.collection);

    expect(countReadingTheme(comfort, all)).toBe(14);
    expect(countReadingTheme(comfort, all)).toBeLessThan(all.length);
  });

  /** The predicate and the href must agree, or the count describes a different page than the link opens. */
  it('includes exactly the products its filter selects', async () => {
    const natural = readingThemeDestination('natural')!;

    const all = await productsBehind(natural.collection);
    const matched = all.filter((p) => readingThemeIncludes(natural, p));

    expect(matched.length).toBeGreaterThan(0);
    for (const product of matched) {
      expect(product.variants.some((v) => v.color === 'brown' || v.color === 'gray'), product.slug).toBe(true);
    }
  });
});
