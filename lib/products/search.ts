import type { Product } from '@/lib/api/schemas/catalog';
import { vi } from '@/lib/i18n/dictionaries/vi';
import { en } from '@/lib/i18n/dictionaries/en';
import { MATERIAL_VALUES } from './lens-facets';

/** Lower-cased and stripped of accents, so "nau tu nhien" finds "Nâu tự nhiên". `đ` has no decomposition. */
export const foldText = (text: string) =>
  text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd');

/**
 * The words a shopper sees on a lens, in both locales (CONTEXT.md "Search"): its name,
 * color names and Color Family, Dòng lens, product line, hạn sử dụng, makeup styles and
 * Occasions — plus "lens" itself and whether it comes with a power, which is how shoppers
 * phrase a search ("lens nâu không độ").
 */
function searchText(product: Product): string {
  const material = MATERIAL_VALUES.find((m) => m.material === product.specs.material)?.id;
  const named = (table: object, key: string | undefined) => (key ? (table as Record<string, string | undefined>)[key] : undefined);
  const words: (string | undefined)[] = ['lens', product.name];
  for (const dict of [vi, en]) {
    const t = dict.filters.sidebar;
    words.push(
      ...product.variants.flatMap((v) => [v.colorLabel, named(dict.filters.colors, v.color)]),
      named(dict.collection.card.lines, material),
      named(dict.filters.productLines, product.productLine),
      named(dict.filters.replacements, product.replacement),
      ...(product.makeupStyles ?? []).map((m) => named(t.makeupStyles, m)),
      ...(product.occasions ?? []).map((o) => named(t.occasions, o)),
    );
  }
  const range = product.sphRange;
  if (range && range.max >= 0) words.push('không độ', 'no power');
  if (range && range.min < 0) words.push('có độ', 'cận', 'with power');
  return foldText(words.filter(Boolean).join(' '));
}

/** Whether a lens matches a Search: every typed word appears among the words shown on it. */
export function matchesSearch(product: Product, query: string): boolean {
  const words = foldText(query).split(/\s+/).filter(Boolean);
  if (words.length === 0) return false;
  const text = searchText(product);
  return words.every((word) => text.includes(word));
}
