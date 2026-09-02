import { describe, it, expect } from 'vitest';
import { POST } from './route';
import { envelopeSchema } from '@/lib/api/schemas/common';
import { paymentIntentSchema } from '@/lib/api/schemas/payments';

function req(body: unknown): Request {
  return new Request('http://localhost/api/payments/intent', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/payments/intent', () => {
  it('returns a schema-valid envelope for a valid method', async () => {
    const res = await POST(req({ method: 'qr' }));
    const body = await res.json();
    expect(res.status).toBe(200);
    const result = envelopeSchema(paymentIntentSchema).safeParse(body);
    expect(result.success, JSON.stringify(result.success ? null : result.error.issues)).toBe(true);
  });

  it('rejects a malformed body with 400 validation_failed', async () => {
    const res = await POST(req({ method: 'cod' }));
    const body = await res.json();
    expect(res.status).toBe(400);
    expect(body.error.code).toBe('validation_failed');
  });

  it('rejects a non-JSON body with 400 validation_failed', async () => {
    const res = await POST(new Request('http://localhost/api/payments/intent', { method: 'POST', body: 'not json' }));
    expect(res.status).toBe(400);
    expect((await res.json()).error.code).toBe('validation_failed');
  });
});
