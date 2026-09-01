import { describe, it, expect } from 'vitest';
import { POST } from './route';
import { envelopeSchema } from '@/lib/api/schemas/common';
import { shippingQuoteResponseSchema } from '@/lib/api/schemas/checkout';

const ADDRESS = {
  recipient: 'Alice Nguyen',
  phone: '0900000000',
  line1: '1 Le Loi',
  ward: 'Ben Nghe',
  district: 'District 1',
  province: 'Ho Chi Minh City',
  label: 'home' as const,
};

const LINES = [
  { lineKey: 'l1', variantId: 'p-aqua-daily-30', quantity: 2, unitPrice: 25, lineTotal: 50, currency: 'USD' as const },
];

function req(body: unknown): Request {
  return new Request('http://localhost/api/shipping/quote', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/shipping/quote', () => {
  it('returns a schema-valid envelope of options for a known district', async () => {
    const res = await POST(req({ address: ADDRESS, lines: LINES }));
    const body = await res.json();
    expect(res.status).toBe(200);
    const result = envelopeSchema(shippingQuoteResponseSchema).safeParse(body);
    expect(result.success, JSON.stringify(result.success ? null : result.error.issues)).toBe(true);
    expect(body.data).toEqual([
      { id: 'standard', label: 'Standard', fee: 3, etaDays: 2 },
      { id: 'express', label: 'Express', fee: 8, etaDays: 1 },
    ]);
  });

  it('rejects a malformed body with 400 validation_failed', async () => {
    const res = await POST(req({ address: { ...ADDRESS, ward: '' }, lines: LINES }));
    const body = await res.json();
    expect(res.status).toBe(400);
    expect(body.error.code).toBe('validation_failed');
  });
});
