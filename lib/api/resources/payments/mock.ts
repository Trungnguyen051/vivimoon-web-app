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
   * the checkout UI renders. `method` must be `qr` or `ewallet`;
   * anything else (COD included) is a typed `not_found`, the same posture as an unknown
   * variantId or shipping optionId.
   */
  async createIntent(input: PaymentIntentRequest): Promise<PaymentIntent> {
    // COD never gets one (ADR-0025); a typed caller cannot send it, an untyped one can.
    if (input.method !== 'qr' && input.method !== 'ewallet') {
      throw new PaymentError(`No payment intent for method "${input.method}"`, 'not_found');
    }

    const id = randomId('pi');
    if (input.method === 'qr') {
      return { id, method: input.method, status: 'pending', qrCode: `vivimoon-qr:${id}` };
    }
    return { id, method: input.method, status: 'pending', redirectUrl: `https://pay.example/${input.method}/${id}` };
  },
};

export type Payments = typeof mockPayments;
