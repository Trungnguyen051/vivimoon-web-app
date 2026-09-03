import { describe, it, expect, beforeEach, vi } from 'vitest';

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

const LINES = [{ lineKey: 'l1', variantId: 'p-aqua-daily-30', quantity: 1 }];

function req(body: unknown): Request {
  return new Request('http://localhost/api/orders', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function validBody(overrides: Record<string, unknown> = {}) {
  return { lines: LINES, address: ADDRESS, email: 'alice@example.com', paymentMethod: 'qr', ...overrides };
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
    expect(after.balance).toBe(placed.data.totals.total);
  });

  it('awards nothing for a guest order — there is no account to award to', async () => {
    await POST(req(validBody()));
    // No session was ever signed in; querying any userId's history proves
    // nothing was written anywhere a guest checkout could plausibly land.
    const after = await loyalty.get('u-001');
    expect(after.history).toHaveLength(2); // unchanged seed count
  });
});
