import { describe, it, expect, vi } from 'vitest';

// Dynamic imports below defer loading './route' until after `jar` exists —
// vi.mock('next/headers', ...) is hoisted above every import, so a static
// `import { POST } from './route'` would invoke the factory (reading `jar`)
// before `jar` is declared. Same pattern as app/api/orders/route.test.ts.
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

function signIn(userId = 'user-1') { jar.set('vivimoon_session', signSession(userId)); }

// Same baseline as route.test.ts: 2 x p-aqua-daily-30 (25) + 1 x p-hazel-monthly-brown-30 (48) = 98.
const BASELINE_LINES = [
  { lineKey: 'l1', variantId: 'p-aqua-daily-30', quantity: 2 },
  { lineKey: 'l2', variantId: 'p-hazel-monthly-brown-30', quantity: 1 },
];

function req(body: unknown): Request {
  return new Request('http://localhost/api/cart/price', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/cart/price — guest -> member merge (spec §9)', () => {
  it('applies only guest-eligible vouchers with no session cookie', async () => {
    jar.clear();
    const body = await (await POST(req({ lines: BASELINE_LINES }))).json();
    expect(body.data.appliedVouchers.map((v: { code: string }) => v.code)).toEqual(['SAVE15']);
    expect(body.data.discount).toBe(15);
  });

  it('re-prices the identical cart under a signed-in session and applies the memberOnly voucher', async () => {
    signIn('user-1');
    const body = await (await POST(req({ lines: BASELINE_LINES }))).json();
    expect(body.data.appliedVouchers.map((v: { code: string }) => v.code)).toEqual(['MEMBER20']);
    expect(body.data.discount).toBe(20);
    expect(body.data.total).toBe(98 - 20);
  });

  it('is idempotent — pricing the same session twice does not change or accumulate the discount', async () => {
    signIn('user-1');
    const first = await (await POST(req({ lines: BASELINE_LINES }))).json();
    const second = await (await POST(req({ lines: BASELINE_LINES }))).json();
    expect(second.data.discount).toBe(first.data.discount);
    expect(second.data.total).toBe(first.data.total);
  });
});
