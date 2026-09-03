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
const { resetMockLoyaltyState } = await import('@/lib/api/resources/loyalty/mock');

function signIn(userId = 'u-001') { jar.set('vivimoon_session', signSession(userId)); }

describe('GET /api/loyalty', () => {
  beforeEach(() => { jar.clear(); resetMockLoyaltyState(); });

  it('401s without a session', async () => {
    const res = await GET();
    expect(res.status).toBe(401);
    expect((await res.json()).error.code).toBe('unauthorized');
  });

  it('renders seeded balance and history for a demo user', async () => {
    signIn('u-001');
    const body = await (await GET()).json();
    expect(body.data.balance).toBe(28 + 47);
    expect(body.data.history).toHaveLength(2);
    // Most recent first.
    expect(body.data.history[0].orderId).toBe('order-seed-1');
  });

  it('is zero balance, empty history, not an error, for a user with none', async () => {
    signIn('u-no-history');
    const body = await (await GET()).json();
    expect(body.data).toEqual({ balance: 0, history: [] });
  });
});
