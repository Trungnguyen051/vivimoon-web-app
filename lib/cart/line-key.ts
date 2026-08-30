import type { RxInput } from '@/lib/api/schemas/rx';

/**
 * Derives the stable identity of a cart line from its variant and prescription
 * (spec §7). The same variant at -2.50 and at -3.00 must be two distinct lines.
 *
 * Everything downstream keys on this — the reducer, the persisted cart, pricing,
 * and order lines — so normalisation matters more than the format:
 *
 *   - `null` and `undefined` and an absent key all collapse to the same thing.
 *     The cart is persisted to localStorage as JSON, where `JSON.stringify`
 *     drops undefined while a server response may send null. If those hashed
 *     differently, a line would duplicate itself after a page reload.
 *   - Fields are read in a fixed order, so object key order cannot matter.
 *   - `sameBothEyes` is expanded to explicit equal eyes and then dropped, so the
 *     pre-parse form (where `.default(false)` has not run) and the parsed form
 *     of the same prescription hash alike.
 *   - Numbers are emitted at a fixed 2 decimals, so -2.5 and -2.50 agree.
 *
 * Takes `RxInput`, not `Rx`, because it sits on BOTH sides of the parse
 * boundary: the selector hands it an unparsed prescription, the store hands it
 * one rehydrated from JSON.
 *
 * The output is deliberately readable rather than a digest — a wrong key should
 * be obvious in DevTools and in a failing test diff — and uses only URL-safe
 * unreserved characters so it can be a route param or a React key as-is.
 */

/** Read in a fixed order so the caller's key order is irrelevant. */
const EYE_FIELDS = ['sph', 'add', 'cyl', 'axis'] as const;

type LooseEye = Partial<Record<(typeof EYE_FIELDS)[number], unknown>>;

function eyeToken(eye: LooseEye | null | undefined): string {
  if (!eye) return '';
  const parts: string[] = [];
  for (const field of EYE_FIELDS) {
    const value = eye[field];
    // Covers null AND undefined; an absent key reads as undefined too.
    if (value === null || value === undefined) continue;
    parts.push(`${field}.${typeof value === 'number' ? value.toFixed(2) : String(value)}`);
  }
  return parts.join('_');
}

export function lineKey(variantId: string, rx?: RxInput | null): string {
  if (!rx) return variantId;

  const right = rx.right as LooseEye | undefined;
  // An expanded `left` makes sameBothEyes itself redundant, so it is not hashed:
  // "same for both eyes" and "two eyes that happen to match" are one prescription.
  const left = rx.sameBothEyes ? right : ((rx.left as LooseEye | undefined) ?? right);

  return `${variantId}~${eyeToken(right)}~${eyeToken(left)}`;
}
