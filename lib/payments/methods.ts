import type { PaymentMethodType } from '@/lib/api/schemas/payments';

export interface PaymentMethodOption {
  /** Also the identity — one entry per method in M2, so `type` alone selects it. */
  type: PaymentMethodType;
  label: string;
}

/**
 * PROVISIONAL — Vivimoon's payment solution is not finalised yet (spec §11).
 * Exactly these three methods ship in M2; cash-on-delivery is deliberately
 * excluded, not guessed at. Owner: Vivimoon.
 *
 * The checkout UI never branches on `type` for its own logic — it branches
 * on whether the `PaymentIntent` response carries `qrCode` or `redirectUrl`.
 * Adding a fourth method is a new entry here, not a UI change.
 */
export const paymentMethods: PaymentMethodOption[] = [
  { type: 'qr', label: 'QR Pay' },
  { type: 'zalopay', label: 'ZaloPay' },
  { type: 'sepay', label: 'SePay' },
];
