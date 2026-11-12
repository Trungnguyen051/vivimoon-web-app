import { describe, it, expect, beforeEach } from 'vitest';
import { mockOrders, resetMockOrdersState, OrderError } from './mock';
import type { PlaceOrderRequest } from '@/lib/api/schemas/orders';

// Every catalogue product is `requiresRx`, and pricing refuses a line for one
// without a prescription — so every real-variant fixture line carries this.
// Single lenses, so each line costs its listed per-lens price (ADR-0023).
const SINGLE = { purchaseUnit: 'single', rx: { sph: -2.5 } } as const;

// Same two known variants as lib/api/resources/pricing/mock.test.ts:
//   p-aqua-daily-30 (price 125.000 VND) x2 + p-hazel-monthly-brown-30 (price 100.000 VND) x1
const BASELINE_LINES = [
  { lineKey: 'l1', variantId: 'p-aqua-daily-30', quantity: 2, ...SINGLE },
  { lineKey: 'l2', variantId: 'p-hazel-monthly-brown-30', quantity: 1, ...SINGLE },
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
    expect(order.totals.subtotal).toBe(350_000);
    expect(order.totals.total).toBeGreaterThan(1);
    expect(order.totals.currency).toBe('VND');
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

  it('refuses a prescription product line that carries no rx', async () => {
    await expect(
      mockOrders.place(req({ lines: [{ lineKey: 'l1', variantId: 'p-aqua-daily-30', quantity: 1 }] }), null),
    ).rejects.toMatchObject({ code: 'validation_failed' });
  });

  // ADR-0012: pricing reports an unknown variant rather than throwing, so
  // placement is the layer that must refuse — never place a smaller order
  // than the cart the shopper submitted.
  it('refuses to place an order containing an unavailable line', async () => {
    await expect(
      mockOrders.place(req({ lines: [{ lineKey: 'l1', variantId: 'ghost', quantity: 1 }] }), null),
    ).rejects.toMatchObject({ code: 'validation_failed' });
  });

  it('refuses even when other lines in the same order price fine', async () => {
    await expect(
      mockOrders.place(
        req({
          lines: [
            { lineKey: 'l1', variantId: 'p-aqua-daily-30', quantity: 1, ...SINGLE },
            { lineKey: 'l2', variantId: 'ghost', quantity: 1 },
          ],
        }),
        null,
      ),
    ).rejects.toMatchObject({ code: 'validation_failed' });
  });

  it("captures a discounted variant's original price on its line, at placement", async () => {
    // p-mystic-daily-violet-30: price 90.000, compareAtPrice 120.000 (content/mock/products.ts).
    const order = await mockOrders.place(
      req({ lines: [...BASELINE_LINES, { lineKey: 'l3', variantId: 'p-mystic-daily-violet-30', quantity: 1, ...SINGLE }] }),
      null,
    );
    const byKey = Object.fromEntries(order.lines.map((l) => [l.lineKey, l]));
    expect(byKey.l3.compareAtUnitPrice).toBe(120_000);
    expect(byKey.l1.compareAtUnitPrice).toBeUndefined();
  });

  it('records the Purchase Unit on each line, reading a unit-less Rx line as a pair (ADR-0023)', async () => {
    const pairRx = { sameBothEyes: true, right: { sph: -3 }, left: { sph: -3 } };
    const order = await mockOrders.place(
      req({
        lines: [
          { lineKey: 'single', variantId: 'p-mystic-daily-violet-30', quantity: 1, ...SINGLE },
          { lineKey: 'pair', variantId: 'p-mystic-daily-violet-30', quantity: 1, purchaseUnit: 'pair', rx: pairRx },
          { lineKey: 'legacy', variantId: 'p-mystic-daily-violet-30', quantity: 1, rx: pairRx },
        ],
      }),
      null,
    );
    const byKey = Object.fromEntries(order.lines.map((l) => [l.lineKey, l]));
    expect(byKey.single).toMatchObject({ purchaseUnit: 'single', rx: { sph: -2.5 }, unitPrice: 90_000, compareAtUnitPrice: 120_000 });
    // A pair's compare-at price is per pair too, like its unit price.
    expect(byKey.pair).toMatchObject({ purchaseUnit: 'pair', unitPrice: 180_000, compareAtUnitPrice: 240_000 });
    expect(byKey.legacy.purchaseUnit).toBe('pair');
  });

  it('charges the cheapest quoted shipping option for the address, with no picker to choose one (M5.4, issue #21)', async () => {
    // District 1 (content/mock/shipping-rates.ts): standard = 30.000, express = 50.000.
    // One 125.000 lens: under the 300.000 free-shipping Spend Tier.
    const order = await mockOrders.place(req({ lines: [BASELINE_LINES[0]] }), null);
    expect(order.totals.shipping).toBe(30_000);
  });

  it('records the Gifts pricing gave at 0₫, and none when there are none', async () => {
    const order = await mockOrders.place(req({ lines: [{ lineKey: 't', variantId: 'p-torica-biweekly-6', quantity: 1, ...SINGLE }] }), null);
    expect(order.gifts).toEqual([
      expect.objectContaining({ variantId: 'a-kits-yeu-mat-1', name: 'Kits Yêu Mắt', quantity: 1, lineTotal: 0 }),
    ]);
    expect((await mockOrders.place(req({ lines: [BASELINE_LINES[0]] }), null)).gifts).toBeUndefined();
  });

  it('records the charged shipping option as the shipping method, with no carrier code yet', async () => {
    const order = await mockOrders.place(req(), null);
    expect(order.shippingMethod).toBe('standard');
    expect(order.carrierTrackingCode).toBeUndefined();
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

describe("mockOrders.cancel", () => {
  beforeEach(() => resetMockOrdersState());

  it("moves a placed order to cancelled", async () => {
    expect((await mockOrders.cancel("order-seed-1")).status).toBe("cancelled");
    expect((await mockOrders.get("order-seed-1"))?.status).toBe("cancelled");
  });

  it("refuses a shipped order", async () => {
    await expect(mockOrders.cancel("order-seed-3")).rejects.toMatchObject({ code: "conflict" });
  });
});
