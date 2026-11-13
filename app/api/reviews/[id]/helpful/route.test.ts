import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Review } from '@/lib/types';

const jar = new Map<string, string>();
vi.mock('next/headers', () => ({
  cookies: async () => ({
    get: (name: string) => (jar.has(name) ? { name, value: jar.get(name) } : undefined),
  }),
}));

process.env.AUTH_COOKIE_SECRET = 'test-secret';

const { POST, DELETE } = await import('./route');
const { GET: listReviews } = await import('../../../products/[slug]/reviews/route');
const { signSession } = await import('@/lib/auth/cookie');
const { resetMockHelpfulVotes } = await import('@/lib/api/resources/catalog/mock');

const signIn = (userId: string) => jar.set('vivimoon_session', signSession(userId));
const ctx = (id: string) => ({ params: Promise.resolve({ id }) });
const req = (id: string, method: string) => new Request(`http://localhost/api/reviews/${id}/helpful`, { method });
const vote = (id: string) => POST(req(id, 'POST'), ctx(id));
const unvote = (id: string) => DELETE(req(id, 'DELETE'), ctx(id));

async function listed(id: string): Promise<Review> {
  const res = await listReviews(new Request('http://localhost/api/products/aqua-daily-clear/reviews'), {
    params: Promise.resolve({ slug: 'aqua-daily-clear' }),
  });
  return ((await res.json()).data as Review[]).find((r) => r.id === id)!;
}

// Seed: r1 is u-001's own Review (24 votes); r2 has 6 votes; r4 is a Mirrored Shopee Review (11 marketplace, 0 votes).
describe('/api/reviews/:id/helpful', () => {
  beforeEach(() => { jar.clear(); resetMockHelpfulVotes(); });

  it('refuses a guest', async () => {
    const res = await vote('r4');
    expect(res.status).toBe(401);
    expect((await res.json()).error.code).toBe('unauthorized');
    expect((await unvote('r4')).status).toBe(401);
  });

  it('counts a vote once, so a repeat adds nothing', async () => {
    signIn('u-002');
    expect((await (await vote('r2')).json()).data).toEqual({ hasVoted: true, helpfulVoteCount: 7 });
    expect((await (await vote('r2')).json()).data).toEqual({ hasVoted: true, helpfulVoteCount: 7 });
  });

  it('takes a vote back, once', async () => {
    signIn('u-002');
    await vote('r2');
    expect((await (await unvote('r2')).json()).data).toEqual({ hasVoted: false, helpfulVoteCount: 6 });
    expect((await (await unvote('r2')).json()).data).toEqual({ hasVoted: false, helpfulVoteCount: 6 });
  });

  it('refuses a vote on your own Review', async () => {
    signIn('u-001');
    const res = await vote('r1');
    expect(res.status).toBe(409);
    expect((await res.json()).error.code).toBe('conflict');
  });

  it('404s an unknown or unpublished Review', async () => {
    signIn('u-002');
    expect((await vote('nope')).status).toBe(404);
    expect((await vote('r11')).status).toBe(404);
  });

  it('works on a Mirrored Review, and the list shows the marketplace count plus votes', async () => {
    signIn('u-002');
    await vote('r4');
    signIn('u-003');
    await vote('r4');
    const r4 = await listed('r4');
    expect(r4.marketplaceHelpfulCount + r4.helpfulVoteCount).toBe(11 + 2);
  });

  it('tells a signed-in viewer per Review whether they voted and whether it is theirs, never the author id', async () => {
    signIn('u-001');
    await vote('r4');
    expect(await listed('r4')).toMatchObject({ hasVoted: true, isOwn: false });
    expect(await listed('r1')).toMatchObject({ hasVoted: false, isOwn: true });
    expect(await listed('r1')).not.toHaveProperty('authorUserId');

    jar.clear();
    const guestView = await listed('r1');
    expect(guestView).not.toHaveProperty('authorUserId');
    expect(guestView).not.toHaveProperty('isOwn');
    expect(guestView).not.toHaveProperty('hasVoted');
  });
});
