import { describe, it, expect } from 'vitest';
import { POST } from './route';
import { envelopeSchema } from '@/lib/api/schemas/common';
import { comparisonMatrixSchema } from '@/lib/api/schemas/catalog';
import { products } from '@/content/mock';

function req(body: unknown): Request {
  return new Request('http://localhost/api/products/compare', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/products/compare', () => {
  it('returns a schema-valid comparison matrix for known product ids', async () => {
    const ids = products.slice(0, 2).map((p) => p.id);
    const res = await POST(req({ productIds: ids }));
    const body = await res.json();
    expect(res.status).toBe(200);
    const result = envelopeSchema(comparisonMatrixSchema).safeParse(body);
    expect(result.success, JSON.stringify(result.success ? null : result.error.issues)).toBe(true);
    expect(body.data.products).toHaveLength(2);
  });

  it('rejects more than 4 product ids with 400 validation_failed', async () => {
    const res = await POST(req({ productIds: ['a', 'b', 'c', 'd', 'e'] }));
    const body = await res.json();
    expect(res.status).toBe(400);
    expect(body.error.code).toBe('validation_failed');
  });

  it('rejects an empty productIds array', async () => {
    const res = await POST(req({ productIds: [] }));
    expect(res.status).toBe(400);
  });
});
