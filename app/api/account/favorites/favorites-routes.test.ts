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

const { GET, POST } = await import('./route');
const { DELETE } = await import('./[productId]/route');
const { signSession } = await import('@/lib/auth/cookie');
const { resetMockFavoritesState } = await import('@/lib/api/resources/account/mock');

function req(body: unknown, method = 'POST'): Request {
  return new Request('http://localhost/api/account/favorites', {
    method,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function params(productId: string) {
  return { params: Promise.resolve({ productId }) };
}

function signIn(userId = 'u-001') { jar.set('vivimoon_session', signSession(userId)); }

describe('account favorites routes', () => {
  beforeEach(() => { jar.clear(); resetMockFavoritesState(); });

  it('401s every operation without a session', async () => {
    expect((await GET()).status).toBe(401);
    expect((await POST(req({ productId: 'p-aqua-daily' }))).status).toBe(401);
    expect((await DELETE(req({}, 'DELETE'), params('p-aqua-daily'))).status).toBe(401);
  });

  it('lists favorited products, silently omitting one whose product no longer exists', async () => {
    signIn();
    const body = await (await GET()).json();
    const ids = body.data.map((p: { id: string }) => p.id);
    expect(ids).toEqual(['p-aqua-daily', 'p-hazel-monthly']);
    expect(ids).not.toContain('p-does-not-exist');
  });

  it('favorites a product', async () => {
    signIn('u-002'); // seeded with just p-breeze-daily
    const body = await (await POST(req({ productId: 'p-ocean-biweekly' }))).json();
    expect(body.data).toEqual(['p-breeze-daily', 'p-ocean-biweekly']);
  });

  it('favoriting the same product twice is a no-op', async () => {
    signIn();
    const body = await (await POST(req({ productId: 'p-aqua-daily' }))).json();
    expect(body.data.filter((id: string) => id === 'p-aqua-daily')).toHaveLength(1);
  });

  it('unfavorites a product', async () => {
    signIn();
    const body = await (await DELETE(req({}, 'DELETE'), params('p-aqua-daily'))).json();
    expect(body.data).not.toContain('p-aqua-daily');
  });

  it('unfavoriting something never favorited is a no-op, not an error', async () => {
    signIn();
    const res = await DELETE(req({}, 'DELETE'), params('p-ocean-biweekly'));
    expect(res.status).toBe(200);
  });

  it('rejects a favorite request missing productId', async () => {
    signIn();
    expect((await POST(req({}))).status).toBe(400);
  });
});
