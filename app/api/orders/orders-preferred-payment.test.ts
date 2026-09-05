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
const { resetMockAuthState } = await import('@/lib/api/resources/auth/mock');
const { account } = await import('@/lib/api/resources/account');

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

describe('order placement updates preferred payment method (M5.3, issue #20)', () => {
  beforeEach(() => { jar.clear(); resetMockOrdersState(); resetMockAuthState(); });

  it("updates a signed-in shopper's account to whatever method the order paid with", async () => {
    signIn('u-001');
    await POST(req(validBody({ paymentMethod: 'zalopay' })));
    const after = await account.get('u-001');
    expect(after.preferredPaymentMethod).toBe('zalopay');
  });

  it('overwrites a previously-set preference with the latest order', async () => {
    signIn('u-001');
    await POST(req(validBody({ paymentMethod: 'sepay' })));
    await POST(req(validBody({ paymentMethod: 'qr' })));
    const after = await account.get('u-001');
    expect(after.preferredPaymentMethod).toBe('qr');
  });

  it('never touches any account for a guest order', async () => {
    await POST(req(validBody({ paymentMethod: 'zalopay' })));
    const after = await account.get('u-001');
    expect(after.preferredPaymentMethod).toBeUndefined();
  });
});
