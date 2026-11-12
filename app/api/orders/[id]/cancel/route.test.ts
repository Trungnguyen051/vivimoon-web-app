import { describe, it, expect, beforeEach, vi } from 'vitest';

const jar = new Map<string, string>();
vi.mock('next/headers', () => ({
  cookies: async () => ({
    get: (name: string) => (jar.has(name) ? { name, value: jar.get(name) } : undefined),
  }),
}));

process.env.AUTH_COOKIE_SECRET = 'test-secret';

const { POST } = await import('./route');
const { signSession } = await import('@/lib/auth/cookie');
const { resetMockOrdersState } = await import('@/lib/api/resources/orders/mock');

function signIn(userId = 'u-001') { jar.set('vivimoon_session', signSession(userId)); }
function params(id: string) { return { params: Promise.resolve({ id }) }; }
const post = (id: string) => POST(new Request('http://x', { method: 'POST' }), params(id));

// Seeds (u-001): 1 placed, 2 confirmed, 3 shipped, 4 delivered, 5 cancelled.
describe('POST /api/orders/[id]/cancel', () => {
  beforeEach(() => { jar.clear(); resetMockOrdersState(); });

  it('401s without a session', async () => {
    expect((await post('order-seed-1')).status).toBe(401);
  });

  it.each(['order-seed-1', 'order-seed-2'])('cancels %s (placed/confirmed)', async (id) => {
    signIn();
    const res = await post(id);
    expect(res.status).toBe(200);
    expect((await res.json()).data.status).toBe('cancelled');
  });

  it.each(['order-seed-3', 'order-seed-4', 'order-seed-5'])('rejects %s with 409', async (id) => {
    signIn();
    const res = await post(id);
    expect(res.status).toBe(409);
    expect((await res.json()).error.code).toBe('conflict');
  });

  it("404s another shopper's order", async () => {
    signIn('u-002');
    expect((await post('order-seed-1')).status).toBe(404);
  });
});
