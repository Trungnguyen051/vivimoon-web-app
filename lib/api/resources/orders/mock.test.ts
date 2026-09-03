import { describe, it, expect, beforeEach } from 'vitest';
import { mockOrders, resetMockOrdersState, OrderError } from './mock';
import type { PlaceOrderRequest } from '@/lib/api/schemas/orders';

// Same two known variants as lib/api/resources/pricing/mock.test.ts:
//   p-aqua-daily-30 (price 25 USD) x2 + p-hazel-monthly-brown-30 (price 48 USD) x1
const BASELINE_LINES = [
  { lineKey: 'l1', variantId: 'p-aqua-daily-30', quantity: 2 },
  { lineKey: 'l2', variantId: 'p-hazel-monthly-brown-30', quantity: 1 },
];

// Known district (content/mock/shipping-rates.ts).
const ADDRESS = {
  recipient: 'Alice Nguyen',
  phone: '0900000000',
  line1: '1 Le Loi',
  ward: 'Ben Nghe',
  district: 'District 1',
  province: 'Ho Chi Minh City',
  label: 'home' as const,
};

function req(overrides: Partial<PlaceOrderRequest> = {}): PlaceOrderRequest {
  return {
    lines: BASELINE_LINES,
    address: ADDRESS,
    email: 'alice@example.com',
    paymentMethod: 'qr',
    ...overrides,
  };
}

describe('mockOrders.place', () => {
  beforeEach(() => { resetMockOrdersState(); });

  it('re-prices server-side and stores the server total, ignoring a posted total', async () => {
    // An untyped body with a claimed total — placeOrderRequestSchema has no
    // such field, but the mock itself must not trust one even if handed it.
    const rigged = { ...req(), total: 1 } as unknown as PlaceOrderRequest;
    const order = await mockOrders.place(rigged, null);
    expect(order.totals.subtotal).toBe(98);
    expect(order.totals.total).toBeGreaterThan(1);
    expect(order.totals.currency).toBe('USD');
  });

  it('carries the resolved rx and lineKey on each order line', async () => {
    // Direct-call fixture, so this is the post-parse Rx shape (left filled) —
    // priceLineInputSchema's actual parse (via parseBody) is what does that
    // fill-in for a real request; nothing runs it here.
    const rx = {
      sameBothEyes: true,
      right: { sph: -2.5 },
      left: { sph: -2.5 },
    };
    const order = await mockOrders.place(
      req({ lines: [{ lineKey: 'l1', variantId: 'p-aqua-daily-30', quantity: 1, rx }] }),
      null,
    );
    expect(order.lines).toEqual([
      expect.objectContaining({ lineKey: 'l1', variantId: 'p-aqua-daily-30', rx }),
    ]);
  });

  it('accepts a guest order (no session) and carries the guest email', async () => {
    const order = await mockOrders.place(req({ email: 'guest@example.com' }), null);
    expect(order.userId).toBeUndefined();
    expect(order.guestEmail).toBe('guest@example.com');
  });

  it('attaches the user id for a logged-in order', async () => {
    const order = await mockOrders.place(req(), 'user-42');
    expect(order.userId).toBe('user-42');
    expect(order.guestEmail).toBeUndefined();
  });

  it('rejects an empty cart', async () => {
    await expect(mockOrders.place(req({ lines: [] }), null)).rejects.toMatchObject({
      code: 'validation_failed',
    });
    await expect(mockOrders.place(req({ lines: [] }), null)).rejects.toBeInstanceOf(OrderError);
  });

  it('gives each order a random, non-sequential code', async () => {
    const a = await mockOrders.place(req(), null);
    const b = await mockOrders.place(req(), null);
    expect(a.code).not.toBe(b.code);
    expect(a.code).not.toMatch(/^(order|vvm)-1$/i);
    expect(b.code).not.toMatch(/^(order|vvm)-2$/i);
  });

  it('stores the chosen payment method and the submitted address', async () => {
    const order = await mockOrders.place(req({ paymentMethod: 'zalopay' }), null);
    expect(order.payment.method).toBe('zalopay');
    expect(order.address).toEqual(ADDRESS);
  });

  it('rejects an unknown variantId with a typed not_found error', async () => {
    await expect(
      mockOrders.place(req({ lines: [{ lineKey: 'l1', variantId: 'ghost', quantity: 1 }] }), null),
    ).rejects.toMatchObject({ code: 'not_found' });
  });
});

describe('mockOrders.list', () => {
  beforeEach(() => { resetMockOrdersState(); });

  it('returns only the seeded orders belonging to the given user', async () => {
    const list = await mockOrders.list('u-001');
    expect(list.length).toBeGreaterThan(0);
    expect(list.every((o) => o.userId === 'u-001')).toBe(true);
  });

  it('is empty for a user with no orders', async () => {
    expect(await mockOrders.list('u-no-orders')).toEqual([]);
  });

  it('surfaces an order placed during the session immediately, most recent first', async () => {
    const placed = await mockOrders.place(req(), 'u-001');
    const list = await mockOrders.list('u-001');
    expect(list[0].id).toBe(placed.id);
  });

  it('never returns another user\'s orders', async () => {
    const list = await mockOrders.list('u-002');
    expect(list.every((o) => o.userId === 'u-002')).toBe(true);
  });
});
