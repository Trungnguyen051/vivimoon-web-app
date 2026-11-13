import { randomBytes } from 'node:crypto';
import { orders as seedOrders } from '@/content/mock';
import { pricing } from '@/lib/api/resources/pricing';
import { catalog } from '@/lib/api/resources/catalog';
import { payments } from '@/lib/api/resources/payments';
import type { Order, PlaceOrderRequest } from '@/lib/api/schemas/orders';
import { normalizeOrderCode } from '@/lib/api/schemas/orders';
import { lensesIn, purchaseUnitOf } from '@/lib/api/schemas/rx';

/** Thrown by the mock so the route handler can map it to an envelope. */
export class OrderError extends Error {
  constructor(message: string, readonly code: 'validation_failed' | 'conflict') {
    super(message);
    this.name = 'OrderError';
  }
}

// In-memory state, keyed by order id. Resets on every server restart, which
// is correct for a mock. `place()` writes into it; `list()` (and #11's
// `get()`/tracking methods) read from it — same mutable-mock-state
// precedent as lib/api/resources/auth/mock.ts.
// structuredClone, not a shallow `{ ...o }` — seed orders share nested
// objects (content/mock/orders.ts reuses the same address literal across
// several orders), so a shallow copy would let a future in-place mutation
// (#11's status updates) corrupt the shared fixture and survive a reset.
let store = new Map<string, Order>(seedOrders.map((o) => [o.id, structuredClone(o)]));

/** Test helper — restores the fixture state between cases. */
export function resetMockOrdersState(): void {
  store = new Map(seedOrders.map((o) => [o.id, structuredClone(o)]));
}

function randomSuffix(): string {
  return Math.random().toString(36).slice(2, 10);
}

/** `id` is internal; `code` is what a shopper reads back — both random, per spec §10. */
function randomId(prefix: string): string {
  return `${prefix}-${randomSuffix()}`;
}

/**
 * Unlike `randomId`, an Order Code is itself the credential for Order Lookup
 * (ADR-0022) — anyone holding it reads the order's address — so it comes from
 * a CSPRNG, never `Math.random()` or a counter.
 */
// Crockford-style base32: no I/L/O/U, so a code read aloud or retyped survives.
const CODE_ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

function randomOrderCode(): string {
  // 16 chars x 5 bits = 80 bits; 32 divides 256, so `% 32` is unbiased.
  return `VVM-${[...randomBytes(16)].map((b) => CODE_ALPHABET[b % 32]).join('')}`;
}

export const mockOrders = {
  /**
   * Re-prices server-side (same posture as Task 6's pricing route, asserted
   * again here because this is the call that turns into money) and shipping
   * is quoted against the submitted address rather than any client fee. No
   * `optionId` is passed — `pricing.priceCart` auto-selects the cheapest
   * quoted option itself (M5.4 issue #21), the same "pick automatically,
   * never make the shopper choose from a checkout-blocking control" posture
   * as pricing's auto-voucher, and the same selection checkout's price
   * preview shows before this call ever runs.
   */
  async place(input: PlaceOrderRequest, userId: string | null): Promise<Order> {
    if (input.lines.length === 0) {
      throw new OrderError('cart must contain at least one line', 'validation_failed');
    }

    // Propagates PricingError as-is (not_found / validation_failed) on an
    // unknown variantId, a zero quantity, or a mixed-currency cart — the
    // route handler maps it the same way pricing's own route does.
    const priced = await pricing.priceCart(
      {
        lines: input.lines,
        shipping: { province: input.address.province, district: input.address.district },
        voucherCode: input.voucherCode,
        usePoints: input.usePoints,
      },
      userId,
    );

    // Never places a partial order (ADR-0012): pricing reports lines it could
    // not price rather than throwing, so placement is the layer that must
    // refuse — silently dropping one here would charge the shopper for less
    // than the cart they submitted.
    if (priced.unavailableLines.length > 0) {
      throw new OrderError(
        `cart contains ${priced.unavailableLines.length} line(s) that are no longer available`,
        'validation_failed',
      );
    }

    // Matched by lineKey, not by position: `priced.lines` is a partition of
    // the request's lines, so an index into `input.lines` is only ever the
    // same line by luck — and would silently attach one line's prescription
    // to another.
    const inputByLineKey = new Map(input.lines.map((l) => [l.lineKey, l]));
    const lines = await Promise.all(
      priced.lines.map(async (line) => {
        const requested = inputByLineKey.get(line.lineKey);
        const rx = requested?.rx;
        const purchaseUnit = requested && purchaseUnitOf(requested);
        const variant = (await catalog.getVariantById(line.variantId))?.variant;
        const perLens = variant?.compareAtPrice;
        // Per unit, like `unitPrice`: a pair's compare-at is two lenses' (ADR-0023).
        const compareAt = perLens === undefined ? undefined : perLens * lensesIn(purchaseUnit);
        return {
          ...line,
          rx,
          ...(purchaseUnit ? { purchaseUnit } : {}),
          ...(variant?.label ? { variantLabel: variant.label } : {}),
          ...(compareAt !== undefined && compareAt > line.unitPrice ? { compareAtUnitPrice: compareAt } : {}),
        };
      }),
    );

    const order: Order = {
      id: randomId('order'),
      code: randomOrderCode(),
      status: 'placed',
      placedAt: new Date().toISOString(),
      lines,
      totals: {
        subtotal: priced.subtotal,
        // A Bundle's saving, a Spend Tier's amount off and points spent are money off too, so the order's totals still add up.
        discount: priced.discount + (priced.bundleSaving ?? 0) + (priced.tierDiscount ?? 0) + (priced.pointsValue ?? 0),
        appliedVouchers: priced.appliedVouchers,
        shipping: priced.shipping,
        total: priced.total,
        pointsUsed: priced.pointsUsed ?? 0,
        pointsValue: priced.pointsValue ?? 0,
        pointsToEarn: priced.pointsToEarn ?? 0,
        // Present whenever any line priced, and the guard above means at
        // least one did — an all-unavailable cart never reaches here.
        currency: priced.currency!,
      },
      ...(priced.gifts?.length ? { gifts: priced.gifts } : {}),
      address: input.address,
      ...(priced.shippingMethod ? { shippingMethod: priced.shippingMethod } : {}),
      payment: {
        method: input.paymentMethod,
        status: 'pending',
        // COD places with no intent (ADR-0025).
        ...(input.paymentMethod === 'cod' ? {} : { intent: await payments.createIntent({ method: input.paymentMethod }) }),
      },
      notificationChannel: input.notificationChannel,
      ...(input.note ? { note: input.note } : {}),
      ...(userId ? { userId } : input.email ? { guestEmail: input.email } : {}),
    };
    store.set(order.id, order);
    return order;
  },

  /** A logged-in shopper's order history, most recently placed first. */
  async list(userId: string): Promise<Order[]> {
    return [...store.values()]
      .filter((o) => o.userId === userId)
      .sort((a, b) => b.placedAt.localeCompare(a.placedAt));
  },

  /** Looked up by id alone — the route handler is what enforces ownership (issue #11). */
  async get(id: string): Promise<Order | null> {
    return store.get(id) ?? null;
  },

  /** Only a not-yet-packed order can be cancelled; ownership is the route's check. */
  async cancel(id: string): Promise<Order> {
    const order = store.get(id);
    if (!order) throw new OrderError('order not found', 'validation_failed');
    if (order.status !== 'placed' && order.status !== 'confirmed') {
      throw new OrderError(`a ${order.status} order cannot be cancelled`, 'conflict');
    }
    order.status = 'cancelled';
    return order;
  },

  /** Order Lookup (ADR-0022): by Order Code alone, public, leniently normalized. */
  async findByCode(code: string): Promise<Order | null> {
    const normalized = normalizeOrderCode(code);
    if (!normalized) return null;
    return [...store.values()].find((o) => o.code.toUpperCase() === normalized) ?? null;
  },
};

export type Orders = typeof mockOrders;
