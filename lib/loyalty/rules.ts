/**
 * The Loyalty earn and spend rules (CONTEXT.md "Loyalty"). PROVISIONAL, pending
 * Vivimoon's real program design. Pricing is the only caller, so the points a
 * shopper is shown are the ones placement credits (ADR-0024).
 */

/** What one point is worth when spent, in ₫. */
export const POINT_VALUE = 100;

/** One point per 10.000₫ paid, rounded down. */
export const pointsEarnedFor = (paid: number) => Math.floor(paid / 10_000);

/** The most points an order may spend: 10% of its subtotal, and never more than the balance. */
export const spendablePoints = (subtotal: number, balance = Infinity) =>
  Math.max(0, Math.min(balance, Math.floor(subtotal / 10 / POINT_VALUE)));
