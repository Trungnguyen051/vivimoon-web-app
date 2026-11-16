import type { Product } from '@/lib/api/schemas/catalog';
import { vi } from '@/lib/i18n/dictionaries/vi';
import { en } from '@/lib/i18n/dictionaries/en';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { makeupStyleSchema, occasionSchema, replacementScheduleSchema } from '@/lib/api/schemas/catalog';
import { MATERIAL_VALUES } from './lens-facets';
import { LENS_ENTRIES } from './lens-entries';

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

/**
 * Every Suggested Category a Search can offer (CONTEXT.md): one filter value — a Color
 * Family, makeup style, Occasion, Dòng lens or hạn sử dụng. `query` is the listing filter
 * it opens; `label` is how a locale names it, group first ("Màu sắc: Nâu").
 */
const CATEGORIES: { id: string; query: string; label: (dict: Dictionary) => string }[] = [
  ...LENS_ENTRIES.map((entry) => ({
    id: `color:${entry.id}`,
    query: entry.kind === 'colour' ? `color=${entry.colors.join(',')}` : `productLine=${entry.productLine}`,
    label: (dict: Dictionary) => `${dict.nav.facets.color}: ${dict.home.shopByFilter.colors[entry.id]}`,
  })),
  ...makeupStyleSchema.options.map((style) => ({
    id: `makeupStyle:${style}`,
    query: `makeupStyle=${style}`,
    label: (dict: Dictionary) => `${dict.filters.sidebar.makeupStyle}: ${dict.filters.sidebar.makeupStyles[style]}`,
  })),
  ...occasionSchema.options.map((occasion) => ({
    id: `occasion:${occasion}`,
    query: `occasion=${occasion}`,
    label: (dict: Dictionary) => `${dict.filters.sidebar.occasion}: ${dict.filters.sidebar.occasions[occasion]}`,
  })),
  ...MATERIAL_VALUES.map(({ id, material }) => ({
    id: `material:${id}`,
    query: `material=${encodeURIComponent(material)}`,
    label: (dict: Dictionary) => dict.nav.facets.materials[id],
  })),
  ...replacementScheduleSchema.options.map((replacement) => ({
    id: `replacement:${replacement}`,
    query: `replacement=${replacement}`,
    label: (dict: Dictionary) => `${dict.nav.facets.expiry}: ${dict.filters.replacements[replacement]}`,
  })),
];

/** Words that say nothing about which category is meant: the facet's own title and "lens". */
const categoryWords = (label: string) => foldText(label.split(': ').pop()!).split(/\s+/).filter((w) => w && w !== 'lens');

/**
 * The Suggested Categories for typed words, best first, at most `limit`. A category is
 * suggested when the words name it: every word of its label (in either locale) is among
 * the typed words — "nâu tự nhiên" names the brown Color Family, "1 ngày" the daily lenses.
 * Unlike a lens, a category need not match *all* the typed words: it is one way of
 * browsing beside the results, not a result.
 */
export function suggestedCategories(query: string, limit = 3): { id: string; query: string }[] {
  const typed = new Set(foldText(query).split(/\s+/).filter(Boolean));
  return CATEGORIES
    .map((category) => {
      const named = [vi, en].map((dict) => categoryWords(category.label(dict))).filter((words) => words.every((w) => typed.has(w)));
      return { category, words: Math.max(0, ...named.map((words) => words.length)) };
    })
    .filter((c) => c.words > 0)
    .sort((a, b) => b.words - a.words)
    .slice(0, limit)
    .map(({ category }) => ({ id: category.id, query: category.query }));
}

/** How a locale names a Suggested Category; undefined for an id that is not one. */
export const categoryLabel = (id: string, dict: Dictionary) => CATEGORIES.find((c) => c.id === id)?.label(dict);
