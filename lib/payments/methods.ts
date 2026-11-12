import type { PaymentMethodType } from '@/lib/api/schemas/payments';

export interface PaymentMethodOption {
  /** Also the identity — one entry per method, so `type` alone selects it. */
  type: PaymentMethodType;
}

/**
 * The checkout picker's rows, in the wireframe's order (ADR-0025): QR transfer,
 * cash on delivery, and one e-wallet row (MoMo, ZaloPay, VNPay). SePay left the
 * picker. Labels are dictionary copy (`dict.checkout.payment`), not config.
 * PROVISIONAL — the real gateways are Vivimoon's call (spec §11).
 */
export const paymentMethods: PaymentMethodOption[] = [{ type: 'qr' }, { type: 'cod' }, { type: 'ewallet' }];
