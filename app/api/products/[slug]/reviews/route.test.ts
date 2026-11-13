import { describe, it, expect, vi } from 'vitest';
import { GET } from './route';
import type { Review } from '@/lib/types';

// A guest: the route reads the session for per-viewer flags.
vi.mock('next/headers', () => ({ cookies: async () => ({ get: () => undefined }) }));

async function get(query = '') {
  const res = await GET(new Request(`http://localhost/api/products/aqua-daily-clear/reviews${query}`), {
    params: Promise.resolve({ slug: 'aqua-daily-clear' }),
  });
  return { res, body: await res.json() };
}

describe('GET /api/products/:slug/reviews', () => {
  it('returns every review with no filter', async () => {
    const { body } = await get();
    expect(body.ok).toBe(true);
    expect(body.data.length).toBeGreaterThan(2);
  });

  it('never returns a pending or rejected review, with or without a filter', async () => {
    for (const query of ['', '?tag=sensitiveEyes', '?hasMedia=true']) {
      const { body } = await get(query);
      expect(body.data.every((r: Review) => r.status === 'approved')).toBe(true);
    }
    // The seed holds a pending (Hazel) and a rejected (this product) review.
    const ids = ((await get()).body.data as Review[]).map((r) => r.id);
    expect(ids).not.toContain('r11');
    expect(ids).not.toContain('r12');
  });

  it('filters by wearer tag', async () => {
    const all = (await get()).body.data as Review[];
    const { body } = await get('?tag=sensitiveEyes');
    expect(body.data.length).toBeGreaterThan(0);
    expect(body.data.length).toBeLessThan(all.length);
    expect(body.data.every((r: Review) => r.tags.includes('sensitiveEyes'))).toBe(true);
  });

  it('filters to reviews with a photo or video', async () => {
    const all = (await get()).body.data as Review[];
    const { body } = await get('?hasMedia=true');
    expect(body.data.length).toBeGreaterThan(0);
    expect(body.data.length).toBeLessThan(all.length);
    expect(body.data.every((r: Review) => r.media.length > 0)).toBe(true);
  });

  it('rejects an unknown tag with validation_failed', async () => {
    const { res, body } = await get('?tag=sleepy');
    expect(res.status).toBe(400);
    expect(body.error.code).toBe('validation_failed');
  });
});
