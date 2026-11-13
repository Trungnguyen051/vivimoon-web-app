import { describe, it, expect, beforeEach, vi } from 'vitest';

// Every catalogue product is `requiresRx`, and pricing refuses a line for one
// without a prescription — so every real-variant fixture line carries this.
const RX = { sameBothEyes: true, right: { sph: -2.5 }, left: { sph: -2.5 } };

const jar = new Map<string, string>();
vi.mock('next/headers', () => ({
  cookies: async () => ({
    get: (name: string) => (jar.has(name) ? { name, value: jar.get(name) } : undefined),
    set: (name: string, value: string) => { jar.set(name, value); },
    delete: (name: string) => { jar.delete(name); },
  }),
}));

process.env.AUTH_COOKIE_SECRET = 'test-secret';

const { POST } = await import('./route');
const { signSession } = await import('@/lib/auth/cookie');
const { resetMockOrdersState } = await import('@/lib/api/resources/orders/mock');
const { resetMockLoyaltyState } = await import('@/lib/api/resources/loyalty/mock');
const { loyalty } = await import('@/lib/api/resources/loyalty');

function signIn(userId = 'u-001') { jar.set('vivimoon_session', signSession(userId)); }

const ADDRESS = {
  recipient: 'Alice Nguyen',
  phone: '0900000000',
  line1: '1 Le Loi',
  ward: 'Ben Nghe',
  district: 'District 1',
  province: 'Ho Chi Minh City',
  label: 'home' as const,
};

const LINES = [{ lineKey: 'l1', variantId: 'p-aqua-daily-30', quantity: 1, rx: RX }];

function req(body: unknown): Request {
  return new Request('http://localhost/api/orders', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function validBody(overrides: Record<string, unknown> = {}) {
  return { lines: LINES, address: ADDRESS, email: 'alice@example.com', paymentMethod: 'qr', notificationChannel: 'zalo', ...overrides };
}

describe('order placement awards loyalty points (issue #10)', () => {
  beforeEach(() => { jar.clear(); resetMockOrdersState(); resetMockLoyaltyState(); });

  it('creates a new loyalty history entry referencing the placed order, for a signed-in shopper', async () => {
    signIn('u-fresh-loyalty');
    const before = await loyalty.get('u-fresh-loyalty');
    expect(before.history).toHaveLength(0);

    const placed = await (await POST(req(validBody()))).json();
    const after = await loyalty.get('u-fresh-loyalty');

    expect(after.history).toHaveLength(1);
    expect(after.history[0].orderId).toBe(placed.data.id);
    // One point per 10.000₫ paid (CONTEXT.md "Loyalty").
    expect(placed.data.totals.pointsToEarn).toBe(Math.floor(placed.data.totals.total / 10_000));
    expect(after.balance).toBe(placed.data.totals.pointsToEarn);
  });

  it('debits the points a member spent and credits the points earned, as two history entries', async () => {
    signIn('u-001'); // 40 seeded points
    const placed = await (await POST(req(validBody({ usePoints: true })))).json();
    const { pointsUsed, pointsValue, pointsToEarn, total } = placed.data.totals;
    expect(pointsUsed).toBe(40);
    expect(pointsValue).toBe(4_000);
    expect(pointsToEarn).toBe(Math.floor(total / 10_000));

    const after = await loyalty.get('u-001');
    const forOrder = after.history.filter((e) => e.orderId === placed.data.id).map((e) => e.points);
    expect(forOrder.sort((a, b) => a - b)).toEqual([-40, pointsToEarn]);
    expect(after.balance).toBe(pointsToEarn);
  });

  it('spends nothing when the member leaves points off', async () => {
    signIn('u-001');
    const placed = await (await POST(req(validBody()))).json();
    expect(placed.data.totals.pointsUsed).toBe(0);
    expect((await loyalty.get('u-001')).balance).toBe(40 + placed.data.totals.pointsToEarn);
  });

  it('holds a guest order’s points against its phone, credited to no account (ADR-0024)', async () => {
    const placed = await (await POST(req(validBody({ usePoints: true })))).json();
    // A guest can't spend: their points are Held Points.
    expect(placed.data.totals.pointsUsed).toBe(0);
    expect((await loyalty.get('u-001')).history).toHaveLength(2); // unchanged seed count
    // The phone was typed as 0900000000; +84 is the same number.
    expect(await loyalty.claimHeld('+84900000000', 'u-claimer')).toBe(placed.data.totals.pointsToEarn);
    expect(placed.data.totals.pointsToEarn).toBeGreaterThan(0);
  });
});
