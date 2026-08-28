import { describe, it, expect } from 'vitest';
import { GET as listProducts } from './route';
import { GET as getProduct } from './[slug]/route';
import { GET as getReviews } from './[slug]/reviews/route';

function req(url: string): Request {
  return new Request(`http://localhost${url}`);
}

describe('GET /api/products', () => {
  it('returns a success envelope with a product array', async () => {
    const body = await (await listProducts(req('/api/products'))).json();
    expect(body.ok).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeGreaterThan(0);
  });

  it('applies the type filter from search params', async () => {
    const body = await (await listProducts(req('/api/products?type=colored'))).json();
    expect(body.data.every((p: { type: string }) => p.type === 'colored')).toBe(true);
  });

  it('rejects an invalid sort with validation_failed', async () => {
    const res = await listProducts(req('/api/products?sort=cheapest'));
    const body = await res.json();
    expect(res.status).toBe(400);
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe('validation_failed');
  });

  it('ignores blank params rather than rejecting them', async () => {
    const res = await listProducts(req('/api/products?type=&color='));
    expect(res.status).toBe(200);
  });
});

describe('GET /api/products/:slug', () => {
  it('returns the product', async () => {
    const res = await getProduct(req('/api/products/aqua-daily-clear'), {
      params: Promise.resolve({ slug: 'aqua-daily-clear' }),
    });
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.data.slug).toBe('aqua-daily-clear');
  });

  it('404s an unknown slug', async () => {
    const res = await getProduct(req('/api/products/ghost'), {
      params: Promise.resolve({ slug: 'ghost' }),
    });
    expect(res.status).toBe(404);
    expect((await res.json()).error.code).toBe('not_found');
  });
});

describe('GET /api/products/:slug/reviews', () => {
  it('returns reviews for a known product', async () => {
    const res = await getReviews(req('/api/products/aqua-daily-clear/reviews'), {
      params: Promise.resolve({ slug: 'aqua-daily-clear' }),
    });
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
  });

  it('404s reviews for an unknown product', async () => {
    const res = await getReviews(req('/api/products/ghost/reviews'), {
      params: Promise.resolve({ slug: 'ghost' }),
    });
    expect(res.status).toBe(404);
  });
});
