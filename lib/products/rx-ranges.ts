/**
 * PROVISIONAL DATA — owner: Vivimoon.
 *
 * These are contact-lens *industry standard* ranges, not Vivimoon-confirmed
 * stock (spec §6, §15). Narrowing them to what Vivimoon actually sells is a
 * data edit in this file: the range table is per-product overridable, so a
 * narrower real catalogue needs no selector changes.
 *
 * Two details differ from spectacle prescriptions and are easy to get wrong:
 *   - The sph step WIDENS to 0.50 below -6.00. Manufacturers do not produce
 *     0.25 increments in high powers, so offering -7.25 would be offering a
 *     lens nobody makes.
 *   - ADD is BANDED (LOW/MID/HIGH), not numeric as on a glasses prescription.
 *
 * `cyl` and `axis` are toric-only. Toric is deferred past M2 (spec §15): the
 * values live here and in the Rx schema, but no selector renders them yet.
 * They exist from day one so that enabling toric later is a selector change
 * rather than a re-keying of every persisted cart — see lib/cart/line-key.ts.
 */

/** Two-decimal rounding. Steps are built from integer hundredths and divided
 *  rather than accumulated, because `+= 0.25` yields -2.7500000000000004 and
 *  every lineKey derived from an Rx would drift with it. */
const hundredths = (n: number): number => Number((n / 100).toFixed(2));

function range(fromHundredths: number, toHundredths: number, stepHundredths: number): number[] {
  const out: number[] = [];
  for (let i = fromHundredths; i <= toHundredths; i += stepHundredths) out.push(i);
  return out;
}

/**
 * Every sph power on offer, ascending: high myopia on a 0.50 grid, ordinary
 * myopia and hyperopia on a 0.25 grid, plus plano (0.00) for cosmetic lenses
 * sold without correction.
 */
export function sphSteps(): number[] {
  const myopiaHigh = range(650, 1000, 50).map((i) => -hundredths(i));
  const myopia = range(25, 600, 25).map((i) => -hundredths(i));
  const hyperopia = range(25, 600, 25).map((i) => hundredths(i));
  const all = [...myopiaHigh, ...myopia, 0, ...hyperopia];
  return [...new Set(all)].sort((a, b) => a - b);
}

/**
 * Display form of an sph power: always two decimals, always signed except
 * plano. Lives here rather than in a component because the selector's options
 * and the cart/order line summaries must render the same power identically —
 * if they drift, a shopper sees a line labelled with a power the selector
 * never offered.
 */
export function formatSph(v: number): string {
  if (v === 0) return '0.00';
  return `${v > 0 ? '+' : ''}${v.toFixed(2)}`;
}

/** Multifocal only. Contact multifocals ship banded, not as a numeric ADD. */
export const addBands = ['LOW', 'MID', 'HIGH'] as const;
export type AddBand = (typeof addBands)[number];

/** Toric only — deferred past M2, rendered by no selector. */
export const cylValues = [-0.75, -1.25, -1.75, -2.25] as const;

/** Toric only — deferred past M2, rendered by no selector. */
export function axisSteps(): number[] {
  return range(10, 180, 10);
}

/** The whole table as data, for per-product narrowing. */
export const RX_RANGES = {
  sph: sphSteps(),
  add: addBands,
  cyl: cylValues,
  axis: axisSteps(),
} as const;
