import { pricing } from '@/lib/api/resources/pricing';
import { shipping } from '@/lib/api/resources/shipping';
import type { Order, PlaceOrderRequest } from '@/lib/api/schemas/orders';

/** Thrown by the mock so the route handler can map it to an envelope. */
export class OrderError extends Error {
  constructor(message: string, readonly code: 'validation_failed') {
    super(message);
    this.name = 'OrderError';
  }
}

function randomSuffix(): string {
  return Math.random().toString(36).slice(2, 10);
}

/** `id` is internal; `code` is what a shopper reads back — both random, per spec §10. */
function randomId(prefix: string): string {
  return `${prefix}-${randomSuffix()}`;
}

function randomOrderCode(): string {
  return `VVM-${randomSuffix().toUpperCase()}`;
}

export const mockOrders = {
  /**
   * Re-prices server-side (same posture as Task 6's pricing route, asserted
   * again here because this is the call that turns into money) and shipping
   * is quoted against the submitted address rather than any client fee. No
   * shipping-option picker exists in M2, so this auto-selects the cheapest
   * quoted option for the district — the same "pick automatically, never
   * make the shopper choose from a checkout-blocking control" posture as
   * pricing's auto-voucher.
   */
  async place(input: PlaceOrderRequest, userId: string | null): Promise<Order> {
    if (input.lines.length === 0) {
      throw new OrderError('cart must contain at least one line', 'validation_failed');
    }

    const options = await shipping.quote({
      province: input.address.province,
      district: input.address.district,
    });
    const cheapest = options.reduce((a, b) => (b.fee < a.fee ? b : a));

    // Propagates PricingError as-is (not_found / validation_failed) on an
    // unknown variantId, a zero quantity, or a mixed-currency cart — the
    // route handler maps it the same way pricing's own route does.
    const priced = await pricing.priceCart({
      lines: input.lines,
      shipping: { province: input.address.province, district: input.address.district, optionId: cheapest.id },
    });

    const lines = priced.lines.map((line, i) => ({ ...line, rx: input.lines[i]?.rx }));

    return {
      id: randomId('order'),
      code: randomOrderCode(),
      status: 'placed',
      placedAt: new Date().toISOString(),
      lines,
      totals: {
        subtotal: priced.subtotal,
        discount: priced.discount,
        appliedVouchers: priced.appliedVouchers,
        shipping: priced.shipping,
        total: priced.total,
        currency: priced.currency,
      },
      address: input.address,
      payment: { method: input.paymentMethod, status: 'pending' },
      ...(userId ? { userId } : { guestEmail: input.email }),
    };
  },
};

export type Orders = typeof mockOrders;
