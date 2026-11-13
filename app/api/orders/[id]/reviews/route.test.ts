import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { Review } from '@/lib/types';
import type { Order } from '@/lib/api/schemas/orders';

const jar = new Map<string, string>();
vi.mock('next/headers', () => ({
  cookies: async () => ({
    get: (name: string) => (jar.has(name) ? { name, value: jar.get(name) } : undefined),
  }),
}));

process.env.AUTH_COOKIE_SECRET = 'test-secret';

const { POST } = await import('./route');
const { DELETE } = await import('@/app/api/reviews/[id]/route');
const { GET: getOrder } = await import('@/app/api/orders/[id]/route');
const { GET: getProductReviews } = await import('@/app/api/products/[slug]/reviews/route');
const { signSession } = await import('@/lib/auth/cookie');
const { resetMockOrdersState } = await import('@/lib/api/resources/orders/mock');
const { resetMockReviewsState, moderateReview, mockCatalog } = await import('@/lib/api/resources/catalog/mock');

function signIn(userId = 'u-001') { jar.set('vivimoon_session', signSession(userId)); }

const VALID = { rating: 5, subRatings: { comfort: 5 }, tags: ['allDay'], title: 'Êm thật', body: 'Đeo cả ngày đi làm vẫn êm, không khô mắt chút nào.' };

async function create(orderId: string, body: Record<string, unknown>) {
  const res = await POST(
    new Request(`http://x/api/orders/${orderId}/reviews`, { method: 'POST', body: JSON.stringify(body) }),
    { params: Promise.resolve({ id: orderId }) },
  );
  return { res, body: await res.json() };
}

async function remove(id: string) {
  const res = await DELETE(new Request(`http://x/api/reviews/${id}`, { method: 'DELETE' }), { params: Promise.resolve({ id }) });
  return { res, body: await res.json() };
}

async function lineStates(orderId: string) {
  const body = await (await getOrder(new Request('http://x'), { params: Promise.resolve({ id: orderId }) })).json();
  return Object.fromEntries((body.data as Order).lines.map((l) => [l.lineKey, l.review]));
}

async function publicReviews(slug: string): Promise<Review[]> {
  const res = await getProductReviews(new Request(`http://x/api/products/${slug}/reviews`), { params: Promise.resolve({ slug }) });
  return (await res.json()).data;
}

describe('POST /api/orders/:id/reviews', () => {
  beforeEach(() => { jar.clear(); resetMockOrdersState(); resetMockReviewsState(); });
  afterEach(() => { vi.useRealTimers(); });

  it('401s a guest', async () => {
    expect((await create('order-seed-10', { ...VALID, lineKey: 'l2' })).res.status).toBe(401);
  });

  it('creates a pending Review of a delivered, paid line, under the short name', async () => {
    signIn();
    const { res, body } = await create('order-seed-10', { ...VALID, lineKey: 'l2' });
    expect(res.status).toBe(201);
    expect(body.data.status).toBe('pending');
    expect((await lineStates('order-seed-10')).l2).toMatchObject({ status: 'pending', reviewId: body.data.id });
    // Pending Reviews stay off the product page.
    expect((await publicReviews('breeze-daily-clear')).map((r) => r.id)).not.toContain(body.data.id);
  });

  it('refuses a line on someone else\'s order like a missing one', async () => {
    signIn('u-002');
    const other = await create('order-seed-10', { ...VALID, lineKey: 'l2' });
    const missing = await create('order-seed-10', { ...VALID, lineKey: 'l9' });
    expect(other.res.status).toBe(404);
    expect(missing.res.status).toBe(404);
  });

  it('refuses a line that is not delivered, or delivered but unpaid', async () => {
    signIn();
    expect((await create('order-seed-3', { ...VALID, lineKey: 'l1' })).res.status).toBe(409); // shipped
    expect((await create('order-seed-4', { ...VALID, lineKey: 'l1' })).res.status).toBe(409); // delivered, QR unpaid
  });

  it('refuses a second live Review of the same line, pending or approved', async () => {
    signIn();
    expect((await create('order-seed-9', { ...VALID, lineKey: 'l1' })).res.status).toBe(409); // seeded pending r11
    const { body } = await create('order-seed-10', { ...VALID, lineKey: 'l2' });
    expect((await create('order-seed-10', { ...VALID, lineKey: 'l2' })).res.status).toBe(409);
    moderateReview(body.data.id, 'approved');
    expect((await create('order-seed-10', { ...VALID, lineKey: 'l2' })).res.status).toBe(409);
  });

  it('lets a rejected Review\'s line be reviewed again', async () => {
    signIn();
    expect((await lineStates('order-seed-10')).l1).toMatchObject({ status: 'rejected', reason: 'Nội dung không liên quan đến sản phẩm.' });
    expect((await create('order-seed-10', { ...VALID, lineKey: 'l1' })).res.status).toBe(201);
    expect((await lineStates('order-seed-10')).l1).toMatchObject({ status: 'pending' });
  });

  it('marks a line that cannot be reviewed with no Review state', async () => {
    signIn();
    expect((await lineStates('order-seed-4')).l1).toBeUndefined();
    expect((await lineStates('order-seed-10')).l2).toMatchObject({ status: 'none', productSlug: 'breeze-daily-clear' });
  });

  it.each([
    ['no rating', { rating: undefined }, 'rating'],
    ['a rating over 5', { rating: 6 }, 'rating'],
    ['a sub-rating of 0', { subRatings: { comfort: 0 } }, 'subRatings.comfort'],
    ['text under 20 characters', { body: 'Quá ngắn' }, 'body'],
    ['text over 1000 characters', { body: 'a'.repeat(1001) }, 'body'],
    ['four wearer tags', { tags: ['allDay', 'myopic', 'beginner', 'sensitiveEyes'] }, 'tags'],
    ['an unknown tag', { tags: ['sleepy'] }, 'tags.0'],
  ])('rejects %s', async (_name, patch, field) => {
    signIn();
    const { res, body } = await create('order-seed-10', { ...VALID, ...patch, lineKey: 'l2' });
    expect(res.status).toBe(400);
    expect(body.error.field).toBe(field);
  });

  it('takes text of exactly 20 and 1000 characters, and no title', async () => {
    signIn();
    const { title: _t, ...noTitle } = VALID;
    expect((await create('order-seed-10', { ...noTitle, body: 'a'.repeat(20), lineKey: 'l2' })).res.status).toBe(201);
    expect((await create('order-seed-10', { ...noTitle, body: 'a'.repeat(1000), lineKey: 'l1' })).res.status).toBe(201);
  });
});

describe('Review Moderation (mock)', () => {
  beforeEach(() => { jar.clear(); resetMockOrdersState(); resetMockReviewsState(); signIn(); });
  afterEach(() => { vi.useRealTimers(); });

  it('approves a new Review 60 seconds after it is sent, then shows it publicly with the badge data only', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    const { body } = await create('order-seed-10', { ...VALID, lineKey: 'l2' });
    vi.advanceTimersByTime(59_000);
    expect((await lineStates('order-seed-10')).l2?.status).toBe('pending');
    vi.advanceTimersByTime(1_000);
    expect((await lineStates('order-seed-10')).l2).toMatchObject({ status: 'approved', productSlug: 'breeze-daily-clear' });

    const shown = (await publicReviews('breeze-daily-clear')).find((r) => r.id === body.data.id)!;
    expect(shown).toMatchObject({ author: 'Mai N.', source: 'vivimoon', rating: 5, body: VALID.body });
    // Never who wrote it, nor their order.
    expect(JSON.stringify(shown)).not.toMatch(/u-001|order-seed-10|Nguyễn|0912/);
  });

  it('counts an approved Review on the product card numbers', async () => {
    const before = (await mockCatalog.getProductBySlug('breeze-daily-clear'))!;
    const { body } = await create('order-seed-10', { ...VALID, rating: 1, lineKey: 'l2' });
    expect((await mockCatalog.getProductBySlug('breeze-daily-clear'))!.reviewCount).toBe(before.reviewCount);
    moderateReview(body.data.id, 'approved');
    const after = (await mockCatalog.getProductBySlug('breeze-daily-clear'))!;
    expect(after.reviewCount).toBe(before.reviewCount + 1);
    expect(after.rating).toBeCloseTo((before.rating * before.reviewCount + 1) / (before.reviewCount + 1));
  });

  it('approves or rejects at once through the test hook, with a reason', async () => {
    const { body } = await create('order-seed-10', { ...VALID, lineKey: 'l2' });
    moderateReview(body.data.id, 'rejected', 'Có số điện thoại');
    expect((await lineStates('order-seed-10')).l2).toMatchObject({ status: 'rejected', reason: 'Có số điện thoại' });
    expect((await publicReviews('breeze-daily-clear')).map((r) => r.id)).not.toContain(body.data.id);
    moderateReview(body.data.id, 'approved');
    expect((await publicReviews('breeze-daily-clear')).map((r) => r.id)).toContain(body.data.id);
  });
});

describe('DELETE /api/reviews/:id', () => {
  beforeEach(() => { jar.clear(); resetMockOrdersState(); resetMockReviewsState(); });

  it('401s a guest', async () => {
    expect((await remove('r11')).res.status).toBe(401);
  });

  it('deletes the member\'s own Review, freeing the line', async () => {
    signIn();
    const { body } = await create('order-seed-10', { ...VALID, lineKey: 'l2' });
    moderateReview(body.data.id, 'approved');
    expect((await remove(body.data.id)).res.status).toBe(200);
    expect((await lineStates('order-seed-10')).l2).toMatchObject({ status: 'none' });
    expect((await publicReviews('breeze-daily-clear')).map((r) => r.id)).not.toContain(body.data.id);
    expect((await create('order-seed-10', { ...VALID, lineKey: 'l2' })).res.status).toBe(201);
  });

  it('refuses someone else\'s Review, or a Mirrored one, like a missing one', async () => {
    signIn('u-002');
    expect((await remove('r11')).res.status).toBe(404);
    expect((await remove('r4')).res.status).toBe(404);
    expect((await remove('r-nope')).res.status).toBe(404);
  });
});
