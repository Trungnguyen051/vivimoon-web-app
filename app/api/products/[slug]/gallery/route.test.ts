import { describe, it, expect } from 'vitest';
import { GET } from './route';
import { envelopeSchema } from '@/lib/api/schemas/common';
import { lensGallerySchema } from '@/lib/api/schemas/catalog';

function req(slug: string) {
  return GET(new Request(`http://localhost/api/products/${slug}/gallery`), {
    params: Promise.resolve({ slug }),
  });
}

describe('GET /api/products/[slug]/gallery', () => {
  it('returns a schema-valid gallery for a product that has one', async () => {
    const res = await req('aqua-daily-clear');
    const body = await res.json();
    expect(res.status).toBe(200);
    const result = envelopeSchema(lensGallerySchema).safeParse(body);
    expect(result.success, JSON.stringify(result.success ? null : result.error.issues)).toBe(true);
  });

  it('returns ok:true with null data for a product that exists but has no gallery', async () => {
    const res = await req('torica-monthly-toric');
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body).toEqual({ ok: true, data: null });
  });

  it('returns 404 when the product itself does not exist', async () => {
    const res = await req('nope');
    const body = await res.json();
    expect(res.status).toBe(404);
    expect(body.error.code).toBe('not_found');
  });
});
