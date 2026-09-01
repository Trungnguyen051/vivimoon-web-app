import { paymentMethods } from '@/lib/payments/methods';
import type { PaymentIntent, PaymentIntentRequest } from '@/lib/api/schemas/payments';

/** Thrown by the mock so the route handler can map it to an envelope. */
export class PaymentError extends Error {
  constructor(message: string, readonly code: 'not_found') {
    super(message);
    this.name = 'PaymentError';
  }
}

function randomId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

export const mockPayments = {
  /**
   * No real payment is processed in M2 (spec §11) — this only shapes what
   * the checkout UI renders. `method` must be one of `paymentMethods`;
   * anything else is a typed `not_found`, the same posture as an unknown
   * variantId or shipping optionId.
   */
  async createIntent(input: PaymentIntentRequest): Promise<PaymentIntent> {
    const found = paymentMethods.find((m) => m.type === input.method);
    if (!found) {
      throw new PaymentError(`Unknown payment method "${input.method}"`, 'not_found');
    }

    const id = randomId('pi');
    if (found.type === 'qr') {
      return { id, method: found.type, status: 'pending', qrCode: `vivimoon-qr:${id}` };
    }
    return { id, method: found.type, status: 'pending', redirectUrl: `https://pay.example/${found.type}/${id}` };
  },
};

export type Payments = typeof mockPayments;
