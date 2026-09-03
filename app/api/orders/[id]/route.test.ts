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
const { resetMockOrdersState } = await import('@/lib/api/resources/orders/mock');

function signIn(userId = 'u-001') { jar.set('vivimoon_session', signSession(userId)); }
function params(id: string) { return { params: Promise.resolve({ id }) }; }

describe('GET /api/orders/[id]', () => {
  beforeEach(() => { jar.clear(); resetMockOrdersState(); });

  it('401s without a session', async () => {
    expect((await GET(new Request('http://x'), params('order-seed-1'))).status).toBe(401);
  });

  it("returns the owner's order", async () => {
    signIn('u-001');
    const body = await (await GET(new Request('http://x'), params('order-seed-1'))).json();
    expect(body.data.id).toBe('order-seed-1');
    expect(body.data.lines.length).toBeGreaterThan(0);
  });

  it("404s another shopper's order — identical to a nonexistent id", async () => {
    signIn('u-002');
    const otherRes = await GET(new Request('http://x'), params('order-seed-1')); // belongs to u-001
    const missingRes = await GET(new Request('http://x'), params('order-does-not-exist'));
    expect(otherRes.status).toBe(404);
    expect(missingRes.status).toBe(404);
    expect((await otherRes.json()).error.code).toBe((await missingRes.json()).error.code);
  });
});
