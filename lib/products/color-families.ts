import type { Locale } from '@/lib/i18n/config';

/**
 * A Color Family is a named group of catalog colors used as one browsing entry
 * point on the homepage (CONTEXT.md). It is not a field on a Product or Variant —
 * each still carries one `color` — so the grouping lives here and becomes real
 * only in the link a tile points at.
 */
export type ColorFamily = {
  id: 'brown' | 'black' | 'gray' | 'vivid';
  /** The catalog colors this family gathers. */
  colors: string[];
  /** Up to three representative swatches, in display order. */
  swatches: string[];
};

/**
 * Declared rather than derived, because `vivid` means "every standout color"
 * and no catalog field says which colors those are. `color-families.test.ts`
 * fails if a catalog color ever lacks a family, so the list cannot drift
 * silently — a new vivid color is added here, beside the others.
 */
export const COLOR_FAMILIES: ColorFamily[] = [
  { id: 'brown', colors: ['brown'], swatches: ['#6b4423', '#8a5a33', '#a97b4f'] },
  { id: 'black', colors: ['black'], swatches: ['#1a1a1a', '#2e2e2e', '#4a4a4a'] },
  { id: 'gray', colors: ['gray'], swatches: ['#6f6f6f', '#9c9c9c', '#c4c4c4'] },
  // Shades of what the family can actually deliver. Blue and green chips here would
  // advertise lenses the catalog has none of; add their swatches when their colors join.
  { id: 'vivid', colors: ['violet'], swatches: ['#6d3fb0', '#8f5fd1', '#b48ae4'] },
];

/**
 * Colored lenses filtered to this family. The catalog matches `color` against a
 * comma-separated set, so a family of several colors is one link rather than one
 * link per color.
 */
export function colorFamilyHref(family: ColorFamily, locale: Locale): string {
  return `/${locale}/collection/colored-lenses?color=${family.colors.join(',')}`;
}
