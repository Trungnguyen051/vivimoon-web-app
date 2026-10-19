import type { Locale } from '@/lib/i18n/config';
import type { ReplacementSchedule } from '@/lib/api/schemas/catalog';

/**
 * Duration tiles browse the whole catalog filtered by wear duration. A themed
 * collection would narrow the result for reasons the tile never states, and two of
 * the three had no themed collection to open at all — they opened empty pages (#49).
 */
export const DURATION_COLLECTION = 'all-lenses';

/**
 * The three durations the design gives a tile — `monthly` is a real schedule but not
 * one of them. `Extract` keeps each id a genuine schedule, so a typo is a type error,
 * while the narrowed union matches the dictionary's `durations` keys exactly.
 */
export type DurationTileId = Extract<ReplacementSchedule, 'daily' | 'threeMonth' | 'sixMonth'>;

/** `id` is the schedule itself, so it is also the filter value and the dictionary key. */
export type DurationTile = { id: DurationTileId; image: string };

export const DURATION_TILES: DurationTile[] = [
  { id: 'daily', image: '/images/products/aqua-daily-1.jpg' },
  { id: 'threeMonth', image: '/images/products/hazel-monthly-1.jpg' },
  { id: 'sixMonth', image: '/images/products/torica-monthly-1.jpg' },
];

export function durationTileHref(tile: DurationTile, locale: Locale): string {
  return `/${locale}/collection/${DURATION_COLLECTION}?replacement=${tile.id}`;
}
