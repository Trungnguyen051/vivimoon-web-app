/**
 * `eyeEnlargement` is computed here, not stored on `ProductSpecs` — see
 * ADR-0005 for why the band is a pure function of a spec, called only where
 * it's needed (the comparison matrix), rather than a stored field that could
 * drift from its own derivation.
 *
 * ADR-0011: the band derives from `graphicDiameter` (the colored/graphic-zone
 * diameter), not total `diameter` — that's the measurement that actually
 * drives the visual enlargement effect. A lens with no `graphicDiameter`
 * (e.g. a clear lens with no colored zone) has no enlargement effect and
 * bands `natural`.
 *
 * Bands are Vivimoon-adjustable in this one file: narrowing or re-tuning the
 * thresholds later is a data edit here, not a schema or selector change.
 */

export const EYE_ENLARGEMENT_BANDS = ['natural', 'subtle', 'noticeable', 'dramatic'] as const;
export type EyeEnlargementBand = (typeof EYE_ENLARGEMENT_BANDS)[number];

/**
 * Bands a `"13.3mm"`-shaped graphic-diameter string:
 * natural < 13.0, subtle 13.0–13.3, noticeable 13.4–13.7, dramatic > 13.7.
 */
export function eyeEnlargementBand(graphicDiameter: string | undefined): EyeEnlargementBand {
  if (graphicDiameter === undefined) return 'natural';
  const mm = Number.parseFloat(graphicDiameter);
  if (Number.isNaN(mm)) {
    throw new Error(`eyeEnlargementBand: unparseable graphic diameter "${graphicDiameter}"`);
  }
  if (mm < 13.0) return 'natural';
  if (mm <= 13.3) return 'subtle';
  if (mm <= 13.7) return 'noticeable';
  return 'dramatic';
}
