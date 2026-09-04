/**
 * PROVISIONAL BANDS — owner: Vivimoon (spec §10).
 *
 * `eyeEnlargement` is computed here, not stored on `ProductSpecs` (spec §6
 * says specs are unchanged; §10 says eyeEnlargement is a new field on them —
 * those two sentences contradict each other as written). Resolved by making
 * the band a pure function of `diameter`, called only where it's needed (the
 * comparison matrix), so it can never drift from its own derivation and
 * `productSpecsSchema` genuinely stays untouched.
 *
 * Bands are Vivimoon-adjustable in this one file: narrowing or re-tuning the
 * thresholds later is a data edit here, not a schema or selector change.
 */

export const EYE_ENLARGEMENT_BANDS = ['natural', 'subtle', 'noticeable', 'dramatic'] as const;
export type EyeEnlargementBand = (typeof EYE_ENLARGEMENT_BANDS)[number];

/**
 * Bands a `"14.2mm"`-shaped diameter string per spec §10:
 * natural < 14.0, subtle 14.0–14.2, noticeable 14.3–14.5, dramatic > 14.5.
 */
export function eyeEnlargementBand(diameter: string): EyeEnlargementBand {
  const mm = Number.parseFloat(diameter);
  if (Number.isNaN(mm)) {
    throw new Error(`eyeEnlargementBand: unparseable diameter "${diameter}"`);
  }
  if (mm < 14.0) return 'natural';
  if (mm <= 14.2) return 'subtle';
  if (mm <= 14.5) return 'noticeable';
  return 'dramatic';
}
