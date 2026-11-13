import { describe, it, expect, beforeEach, vi } from 'vitest';

const jar = new Map<string, string>();
vi.mock('next/headers', () => ({
  cookies: async () => ({
    get: (name: string) => (jar.has(name) ? { name, value: jar.get(name) } : undefined),
  }),
}));

process.env.AUTH_COOKIE_SECRET = 'test-secret';

const { GET } = await import('./route');
const { POST: createReview } = await import('@/app/api/orders/[id]/reviews/route');
const { signSession } = await import('@/lib/auth/cookie');
const { resetMockOrdersState } = await import('@/lib/api/resources/orders/mock');
const { resetMockReviewsState } = await import('@/lib/api/resources/catalog/mock');

function signIn(userId = 'u-001') { jar.set('vivimoon_session', signSession(userId)); }

async function eligibility(slug: string) {
  const res = await GET(new Request(`http://x/api/products/${slug}/reviews/eligibility`), { params: Promise.resolve({ slug }) });
  return { res, body: await res.json() };
}

describe('GET /api/products/:slug/reviews/eligibility', () => {
  beforeEach(() => { jar.clear(); resetMockOrdersState(); resetMockReviewsState(); });

  it('401s a guest', async () => {
    expect((await eligibility('breeze-daily-clear')).res.status).toBe(401);
  });

  it('404s an unknown product', async () => {
    signIn();
    expect((await eligibility('no-such-lens')).res.status).toBe(404);
  });

  it('returns none when the member has no delivered, paid line of the product', async () => {
    signIn();
    // order-seed-4 is delivered but its QR transfer was never paid.
    expect((await eligibility('mystic-daily-colored')).body.data).toEqual([]);
    // u-002's only Breeze order was returned.
    signIn('u-002');
    expect((await eligibility('breeze-daily-clear')).body.data).toEqual([]);
  });

  it('returns the one line, with what the picker shows', async () => {
    signIn();
    expect((await eligibility('breeze-daily-clear')).body.data).toEqual([
      { orderId: 'order-seed-10', orderCode: 'VVM-SEED0010', placedAt: '2026-07-28T08:15:00.000Z', lineKey: 'l2', variantLabel: expect.any(String) },
    ]);
  });

  it('counts a line whose Review was rejected, and drops a line once it has a live Review', async () => {
    signIn();
    // order-seed-10 l1 carries rejected Review r12: the line is free again.
    expect((await eligibility('aqua-daily-clear')).body.data).toMatchObject([{ orderId: 'order-seed-10', lineKey: 'l1' }]);

    const body = JSON.stringify({ lineKey: 'l2', rating: 5, tags: [], body: 'Đeo cả ngày đi làm vẫn êm, không khô mắt chút nào.' });
    const created = await createReview(
      new Request('http://x/api/orders/order-seed-10/reviews', { method: 'POST', body }),
      { params: Promise.resolve({ id: 'order-seed-10' }) },
    );
    expect(created.status).toBe(201);
    expect((await eligibility('breeze-daily-clear')).body.data).toEqual([]);
  });

  it('returns several lines, newest order first, leaving out a line with a pending Review', async () => {
    signIn();
    // order-seed-9 (a joined guest order) is Hazel too, but its pending Review r11 holds the line.
    expect((await eligibility('hazel-monthly-colored')).body.data).toEqual([
      { orderId: 'order-seed-12', orderCode: 'VVM-SEED0012', placedAt: '2026-09-21T11:05:00.000Z', lineKey: 'l1', variantLabel: expect.stringContaining('Storm Gray') },
      { orderId: 'order-seed-11', orderCode: 'VVM-SEED0011', placedAt: '2026-08-12T03:40:00.000Z', lineKey: 'l1', variantLabel: expect.stringContaining('Hazel Brown') },
    ]);
  });
});
