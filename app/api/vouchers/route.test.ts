import { describe, it, expect, beforeEach, vi } from 'vitest';

const jar = new Map<string, string>();
vi.mock('next/headers', () => ({
  cookies: async () => ({
    get: (name: string) => (jar.has(name) ? { name, value: jar.get(name) } : undefined),
  }),
}));

process.env.AUTH_COOKIE_SECRET = 'test-secret';

const { GET } = await import('./route');
const { signSession } = await import('@/lib/auth/cookie');

function signIn(userId = 'u-001') { jar.set('vivimoon_session', signSession(userId)); }

describe('GET /api/vouchers', () => {
  beforeEach(() => { jar.clear(); });

  it('401s without a session', async () => {
    const res = await GET();
    expect(res.status).toBe(401);
    expect((await res.json()).error.code).toBe('unauthorized');
  });

  it('lists only active, unexpired vouchers, including memberOnly ones', async () => {
    signIn();
    const body = await (await GET()).json();
    const codes: string[] = body.data.map((v: { code: string }) => v.code);

    expect(codes).toContain('SUMMER10');
    expect(codes).toContain('SAVE15');
    expect(codes).toContain('MEMBER20'); // memberOnly — a signed-in shopper sees it

    expect(codes).not.toContain('USED5OFF'); // status: used
    expect(codes).not.toContain('EXPIRED50'); // status: expired
    expect(codes).not.toContain('STALE-ACTIVE60'); // active flag stale, past expiresAt
  });

  it('each voucher carries code, description, discount shape, minSpend, and expiry', async () => {
    signIn();
    const body = await (await GET()).json();
    const summer = body.data.find((v: { code: string }) => v.code === 'SUMMER10');
    expect(summer).toMatchObject({
      code: 'SUMMER10',
      description: expect.any(String),
      type: 'percent',
      value: 10,
      minSpend: 50,
      expiresAt: expect.any(String),
    });
  });
});
