import { randomBytes } from 'node:crypto';
import { orders as seedOrders } from '@/content/mock';
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

// In-memory state, keyed by order id. Resets on every server restart, which
// is correct for a mock. `place()` writes into it; `list()` (and #11's
// `get()`/tracking methods) read from it — same mutable-mock-state
// precedent as lib/api/resources/auth/mock.ts.
// structuredClone, not a shallow `{ ...o }` — seed orders share nested
// objects (content/mock/orders.ts reuses the same address literal across
// several orders), so a shallow copy would let a future in-place mutation
// (#11's status updates) corrupt the shared fixture and survive a reset.
let store = new Map<string, Order>(seedOrders.map((o) => [o.id, structuredClone(o)]));

interface TrackingTokenRecord { orderId: string; expiresAt: number }
// A tracking link should outlive a typical delivery window.
const TRACKING_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const trackingTokens = new Map<string, TrackingTokenRecord>();

/** Test helper — restores the fixture state between cases. */
export function resetMockOrdersState(): void {
  store = new Map(seedOrders.map((o) => [o.id, structuredClone(o)]));
  trackingTokens.clear();
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

/**
 * Unlike `randomId`/`randomOrderCode` (opaque identifiers, fine from
 * `Math.random()`), a tracking token is itself the credential that grants
 * access to an order's PII — it needs a CSPRNG, not a cheap-and-guessable
 * source.
 */
function randomTrackingToken(): string {
  return `trk-${randomBytes(32).toString('base64url')}`;
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
    const priced = await pricing.priceCart(
      {
        lines: input.lines,
        shipping: { province: input.address.province, district: input.address.district, optionId: cheapest.id },
      },
      userId,
    );

    const lines = priced.lines.map((line, i) => ({ ...line, rx: input.lines[i]?.rx }));

    const order: Order = {
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

  /**
   * A guest order carries no user account to hold a "my orders" link, so
   * tracking is requested by code + the email it was placed with (issue
   * #11). Only ever matches a guest order (`guestEmail`, not `userId`) — a
   * member's order stores no email at all, and reaches this same tracking
   * view through their session-gated history instead.
   *
   * Returns `{}` for no match. The route handler wraps this in an identical
   * envelope either way, so the response itself never reveals which order
   * codes exist.
   */
  async requestTracking(code: string, email: string): Promise<{ devLink?: string }> {
    const normalizedCode = code.trim().toUpperCase();
    const normalizedEmail = email.trim().toLowerCase();
    const order = [...store.values()].find(
      (o) => !o.userId && o.guestEmail?.toLowerCase() === normalizedEmail && o.code.toUpperCase() === normalizedCode,
    );
    if (!order) return {};

    const token = randomTrackingToken();
    trackingTokens.set(token, { orderId: order.id, expiresAt: Date.now() + TRACKING_TOKEN_TTL_MS });
    return { devLink: `/orders/track/${token}` };
  },

  /** Resolves a tracking token to the order it was issued for — public, no session required. */
  async resolveTrackingToken(token: string): Promise<Order | null> {
    const record = trackingTokens.get(token);
    if (!record || record.expiresAt < Date.now()) return null;
    return store.get(record.orderId) ?? null;
  },
};

export type Orders = typeof mockOrders;
