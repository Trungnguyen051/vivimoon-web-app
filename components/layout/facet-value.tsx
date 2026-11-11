import type { Dictionary } from '@/lib/i18n/dictionaries';
import { diameterBucketLabel, type FacetValue } from '@/lib/products/lens-facets';

/**
 * How a Lens Facet's values read, shared by the two surfaces that offer them: the
 * desktop panel and the mobile drawer (#113).
 *
 * `LENS_FACETS` already stops the two disagreeing about *which* values exist. These stop
 * them disagreeing about what a value is called and what it looks like — the half of the
 * problem data alone cannot hold, since a label is minted at the point of rendering.
 */

/** What a value says. Each axis already has labels; none is minted here. */
export function valueLabel(value: FacetValue, dict: Dictionary): string {
  switch (value.kind) {
    // The same source the homepage's colour row reads, so the two cannot drift.
    case 'colour': return dict.home.shopByFilter.colors[value.id];
    // A range is numbers rather than copy, so it is derived rather than translated.
    case 'diameter': return diameterBucketLabel(value.bucket);
    case 'expiry': return dict.filters.replacements[value.id];
    case 'material': return dict.nav.facets.materials[value.id];
    default: {
      const unhandled: never = value;
      return unhandled;
    }
  }
}

/**
 * Không màu is drawn as one unfilled circle: there is no colour to show, which is the
 * whole point of it. Every other value shows its family's shades.
 *
 * Hidden from assistive technology on both surfaces — the value's name sits beside it in
 * the same link, so announcing the swatches would repeat the colour or, worse, read a
 * row of nothings.
 */
export function Swatches({
  value,
  className = 'size-5',
}: {
  value: Extract<FacetValue, { kind: 'colour' }>;
  className?: string;
}) {
  const unfilled = value.entry.kind === 'line';

  return (
    <span className="flex items-center gap-2" aria-hidden="true">
      {value.entry.swatches.map((swatch, i) => (
        <span
          key={`${swatch}-${i}`}
          className={`${className} rounded-full border border-black/10`}
          style={unfilled ? undefined : { backgroundColor: swatch }}
        />
      ))}
    </span>
  );
}
