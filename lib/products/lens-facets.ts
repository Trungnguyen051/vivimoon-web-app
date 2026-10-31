import type { Locale } from '@/lib/i18n/config';
import type { ReplacementSchedule } from '@/lib/api/schemas/catalog';
import { replacementScheduleSchema } from '@/lib/api/schemas/catalog';
import { LENS_ENTRIES, lensEntryHref, type LensEntry, type LensEntryId } from './lens-entries';

/**
 * A Lens Facet is one axis a shopper can browse by from the Sản Phẩm menu: what colour
 * their eyes become, how wide the lens sits, how long it lasts, what it is made of.
 *
 * The four of them are data rather than markup because two surfaces render them — the
 * desktop panel and the mobile drawer — and a shopper must be offered the same four
 * either way. Values carry the page they open, the same arrangement `LENS_ENTRIES`
 * already uses, so a value's label and its destination cannot drift apart.
 *
 * Content read from `9bTKBHv3tf3aJy1EhnJc4i`: Màu sắc `38:2019`, Đường kính `38:2374`,
 * Hạn sử dụng `38:2684`, Chất liệu `38:2961`.
 */
export type FacetId = 'color' | 'diameter' | 'expiry' | 'material';

/**
 * An inclusive millimetre range. `id` is the query value the catalog parses, so the
 * bucket and the filter it applies are one thing (#109).
 */
export type DiameterBucket = { id: string; min: number; max: number };

/**
 * PROVISIONAL — these are Vivimoon's drawn buckets, not the catalog's contents.
 *
 * Three match no stock today and open empty collections. That is the thin fixtures
 * rather than a broken facet, the same call made for the colour counts in #79, and it
 * must not be "fixed" by deriving buckets from the catalog.
 *
 * Also worth knowing before anyone edits these: the design leaves 14.1–14.2mm in no
 * bucket at all, and that is where most of the current catalog sits. Widening it is
 * Vivimoon's decision about what the facet offers, not a correctness fix.
 *
 * One correction is applied. The design's `13.5 - 14.0mm` and `14.0mm` overlap, so a
 * 14.0mm lens would fall into two buckets of one axis and the facet would stop being a
 * partition. The first ends at 13.9 instead.
 */
export const DIAMETER_BUCKETS: DiameterBucket[] = [
  { id: '11.9-12.8', min: 11.9, max: 12.8 },
  { id: '12.9-13.4', min: 12.9, max: 13.4 },
  { id: '13.5-13.9', min: 13.5, max: 13.9 },
  { id: '14-14', min: 14.0, max: 14.0 },
  { id: '14.3-14.5', min: 14.3, max: 14.5 },
];

/**
 * The two values Chất liệu offers, against the two materials the catalog carries.
 *
 * This mapping is a claim about Vivimoon's own products rather than something derivable
 * from the catalog. If these labels are ever meant as benefit claims spanning both
 * materials rather than aliases for them, the facet needs a different filter and this
 * decision should be revisited.
 */
export const MATERIAL_VALUES = [
  { id: 'moisture', material: 'Hydrogel' },
  { id: 'breathable', material: 'Silicone Hydrogel' },
] as const;

/**
 * One value under a facet. A union rather than one shape with optional fields: a colour
 * value has an entry and swatches, a diameter value has a range, and neither has to
 * carry the other's emptiness. Same reason `LensEntry` and `NavItem` are unions.
 */
export type FacetValue =
  | { kind: 'colour'; id: LensEntryId; entry: LensEntry }
  | { kind: 'diameter'; id: string; bucket: DiameterBucket }
  | { kind: 'expiry'; id: ReplacementSchedule }
  | { kind: 'material'; id: (typeof MATERIAL_VALUES)[number]['id']; material: string };

export type LensFacet = { id: FacetId; values: FacetValue[] };

/** A facet is an axis, so it opens the whole catalog rather than a narrowed slice of it. */
export const FACET_COLLECTION = 'all-lenses';

/**
 * The order is fixed by the design. Three of its four frames show `Đường kính` in the
 * first slot above `Đường kính (DIA)` — a copy-paste error, not a fifth facet; only the
 * Màu sắc frame draws the left column correctly, and Màu sắc leads in all four states.
 */
export const LENS_FACETS: LensFacet[] = [
  {
    id: 'color',
    // The Color Families plus Không màu — exactly `LENS_ENTRIES`, reused rather than
    // redeclared so the menu and the homepage colour row cannot disagree.
    values: LENS_ENTRIES.map((entry) => ({ kind: 'colour', id: entry.id, entry })),
  },
  {
    id: 'diameter',
    values: DIAMETER_BUCKETS.map((bucket) => ({ kind: 'diameter', id: bucket.id, bucket })),
  },
  {
    id: 'expiry',
    // Every schedule, monthly included. The homepage's duration tiles leave monthly out
    // by design; browsing by expiry is a different question and must not reuse that list.
    values: replacementScheduleSchema.options.map((id) => ({ kind: 'expiry', id })),
  },
  {
    id: 'material',
    values: MATERIAL_VALUES.map(({ id, material }) => ({ kind: 'material', id, material })),
  },
];

/** The catalog page this value opens, narrowed to what the value names. */
export function facetValueHref(value: FacetValue, locale: Locale): string {
  // A colour keeps the homepage's own link, which already knows that Không màu selects
  // the trong suốt Product Line by absence of colour rather than by a colour set.
  if (value.kind === 'colour') return lensEntryHref(value.entry, locale);

  const query =
    value.kind === 'diameter' ? `diameter=${value.bucket.id}`
      : value.kind === 'expiry' ? `replacement=${value.id}`
        : `material=${encodeURIComponent(value.material)}`;

  return `/${locale}/collection/${FACET_COLLECTION}?${query}`;
}

/**
 * Where the facet's own name leads. An axis has no filtered collection of its own, so it
 * opens the whole catalog with its filter control focused — which is what keeps the
 * arrow beside it from being decoration.
 *
 * Per-facet bespoke targets were rejected: Màu sắc would then open the coloured-lens
 * collection while one of its own values, Không màu, is explicitly not coloured.
 */
export function facetHref(facet: LensFacet, locale: Locale): string {
  return `/${locale}/collection/${FACET_COLLECTION}#filter-${facet.id}`;
}
