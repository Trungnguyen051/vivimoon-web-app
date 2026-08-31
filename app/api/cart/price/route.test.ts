import { describe, it, expect } from 'vitest';
import { POST } from './route';
import { envelopeSchema } from '@/lib/api/schemas/common';
import { pricedCartSchema } from '@/lib/api/schemas/cart';

function req(body: unknown): Request {
  return new Request('http://localhost/api/cart/price', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

// Same two known variants as lib/api/resources/pricing/mock.test.ts:
//   p-aqua-daily-30 (price 25) x2 + p-hazel-monthly-brown-30 (price 48) x1
const BASELINE_LINES = [
  { lineKey: 'l1', variantId: 'p-aqua-daily-30', quantity: 2 },
  { lineKey: 'l2', variantId: 'p-hazel-monthly-brown-30', quantity: 1 },
];

describe('POST /api/cart/price', () => {
  it('returns a schema-valid envelope for a valid body', async () => {
    const res = await POST(req({ lines: BASELINE_LINES }));
    const body = await res.json();
    expect(res.status).toBe(200);
    const result = envelopeSchema(pricedCartSchema).safeParse(body);
    expect(result.success, JSON.stringify(result.success ? null : result.error.issues)).toBe(true);
  });

  it('prices a non-trivial baseline from the catalogue, then ignores a posted unitPrice claiming otherwise', async () => {
    const clean = await (await POST(req({ lines: BASELINE_LINES }))).json();
    expect(clean.data.subtotal).toBe(98);

    // Every line claims unitPrice: 1 — an untyped JSON body, exactly what a
    // hand-crafted client request could send. priceLineInputSchema does not
    // list `unitPrice`, so parseBody strips it before pricing ever runs.
    const rigged = await (
      await POST(
        req({
          lines: BASELINE_LINES.map((l) => ({ ...l, unitPrice: 1 })),
        }),
      )
    ).json();
    expect(rigged.data.subtotal).toBe(98);
  });

  it('rejects a malformed body with 400 validation_failed', async () => {
    const res = await POST(req({ lines: [{ lineKey: 'l1', variantId: 'p-aqua-daily-30', quantity: 0 }] }));
    const body = await res.json();
    expect(res.status).toBe(400);
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe('validation_failed');
  });

  it('rejects a non-JSON body with 400 validation_failed', async () => {
    const res = await POST(new Request('http://localhost/api/cart/price', { method: 'POST', body: 'not json' }));
    expect(res.status).toBe(400);
    expect((await res.json()).error.code).toBe('validation_failed');
  });

  it('404s an unknown variantId with the typed not_found error', async () => {
    const res = await POST(req({ lines: [{ lineKey: 'l1', variantId: 'ghost-variant', quantity: 1 }] }));
    const body = await res.json();
    expect(res.status).toBe(404);
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe('not_found');
  });
});
