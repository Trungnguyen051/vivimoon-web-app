import { describe, it, expect } from 'vitest';
import { products } from '@/content/mock';
import { en } from '@/lib/i18n/dictionaries/en';
import { vi as viDict } from '@/lib/i18n/dictionaries/vi';

/**
 * The collection filter names a colour from the dictionary rather than from a
 * variant's `colorLabel`, which is one shade's marketing name in one language. That
 * makes the map a parallel list, so this is what stops it falling behind the catalog:
 * an unlabelled colour would show its raw token ("violet") to a shopper.
 */
describe('colour filter labels', () => {
  const catalogColors = [...new Set(products.flatMap((p) => p.variants.map((v) => v.color).filter((c) => c !== undefined)))];

  it.each([['en', en], ['vi', viDict]])('%s labels every colour the catalog uses', (_locale, dict) => {
    for (const color of catalogColors) {
      expect(Object.keys(dict.filters.colors), `no label for "${color}"`).toContain(color);
    }
  });
});
