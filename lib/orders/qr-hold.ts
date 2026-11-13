/** How long a QR order is held for its transfer (#205, ADR-0025). */
export const QR_HOLD_MINUTES = 15;

/**
 * When a QR order's hold ends, in epoch ms: from when it was placed, or from its
 * last renewal. Computed from the order, so a reloaded page counts down the same.
 */
export function qrExpiresAt(order: { placedAt: string; payment: { renewedAt?: string } }): number {
  return Date.parse(order.payment.renewedAt ?? order.placedAt) + QR_HOLD_MINUTES * 60_000;
}
