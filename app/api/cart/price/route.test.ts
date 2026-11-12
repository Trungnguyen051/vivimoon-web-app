import { describe, it, expect, vi } from 'vitest';
import { POST } from './route';
import { envelopeSchema } from '@/lib/api/schemas/common';
import { pricedCartSchema } from '@/lib/api/schemas/cart';

// Every catalogue product is `requiresRx`, and pricing refuses a line for one
// without a prescription — so every real-variant fixture line carries this.
const RX = { sameBothEyes: true, right: { sph: -2.5 }, left: { sph: -2.5 } };

// No session cookie for any test in this file — every case here is a guest
// request. The signed-in / memberOnly-voucher path is covered separately in
// route.session.test.ts, which needs a real jar to sign a session into.
vi.mock('next/headers', () => ({
  cookies: async () => ({ get: () => undefined, set: () => {}, delete: () => {} }),
}));

function req(body: unknown): Request {
  return new Request('http://localhost/api/cart/price', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

// Same two known variants as lib/api/resources/pricing/mock.test.ts:
//   p-aqua-daily-30 (25 per lens) x2 pairs + p-hazel-monthly-brown-30 (20 per lens) x1 pair = 140
const BASELINE_LINES = [
  { lineKey: 'l1', variantId: 'p-aqua-daily-30', quantity: 2, rx: RX },
  { lineKey: 'l2', variantId: 'p-hazel-monthly-brown-30', quantity: 1, rx: RX },
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
    expect(clean.data.subtotal).toBe(140);

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
    expect(rigged.data.subtotal).toBe(140);
  });

  it('rejects a malformed body with 400 validation_failed', async () => {
    const res = await POST(req({ lines: [{ lineKey: 'l1', variantId: 'p-aqua-daily-30', quantity: 0, rx: RX }] }));
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

  // ADR-0012: an unknown variant is a stale persisted cart, not a bad
  // request — the route answers 200 and names the line, so the rest of the
  // cart still prices.
  it('answers ok and reports an unknown variantId as an unavailable line', async () => {
    const res = await POST(req({ lines: [{ lineKey: 'l1', variantId: 'ghost-variant', quantity: 1 }] }));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.data.unavailableLines).toEqual([
      { lineKey: 'l1', variantId: 'ghost-variant' },
    ]);
  });

  it('folds a chosen shipping option into shipping and total end-to-end', async () => {
    const res = await POST(
      req({
        lines: BASELINE_LINES,
        shipping: { province: 'Ho Chi Minh City', district: 'District 1', optionId: 'standard' },
      }),
    );
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.data.shipping).toBe(3);
    expect(body.data.total).toBe(140 + 3 - body.data.discount);
  });

  it('404s a tampered shipping optionId, not a silent 0 fee', async () => {
    const res = await POST(
      req({
        lines: BASELINE_LINES,
        shipping: { province: 'Ho Chi Minh City', district: 'District 1', optionId: 'not-a-real-option' },
      }),
    );
    const body = await res.json();
    expect(res.status).toBe(404);
    expect(body.error.code).toBe('not_found');
  });

  describe('Purchase Unit (ADR-0023)', () => {
    it('prices a pair at twice the per-lens price, and a single at the lens price', async () => {
      // p-hazel-monthly-brown-30 lists at 20 per lens.
      const res = await POST(req({
        lines: [
          { lineKey: 'single', variantId: 'p-hazel-monthly-brown-30', quantity: 1, purchaseUnit: 'single', rx: { sph: -2.5 } },
          { lineKey: 'pair', variantId: 'p-hazel-monthly-brown-30', quantity: 3, purchaseUnit: 'pair', rx: RX },
        ],
      }));
      const body = await res.json();
      expect(res.status).toBe(200);
      const [single, pair] = body.data.lines;
      expect(single).toMatchObject({ unitPrice: 20, lineTotal: 20 });
      expect(pair).toMatchObject({ unitPrice: 40, lineTotal: 120 });
      expect(body.data.subtotal).toBe(140);
    });

    it('reads a line with no unit as a pair', async () => {
      const res = await POST(req({ lines: [{ lineKey: 'l', variantId: 'p-hazel-monthly-brown-30', quantity: 1, rx: RX }] }));
      expect((await res.json()).data.lines[0].unitPrice).toBe(40);
    });

    it('rejects a unit whose Rx has the wrong shape', async () => {
      for (const line of [
        { purchaseUnit: 'single', rx: RX },
        { purchaseUnit: 'pair', rx: { sph: -2.5 } },
        { rx: { sph: -2.5 } },
      ]) {
        const res = await POST(req({ lines: [{ lineKey: 'l', variantId: 'p-hazel-monthly-brown-30', quantity: 1, ...line }] }));
        expect(res.status, JSON.stringify(line)).toBe(400);
      }
    });
  });

  describe('Bundles', () => {
    // p-aqua-daily's Bundle: the lens as a pair (50), drops (3) and tray (2) at 52.
    const set = (bundle?: string) => [
      { lineKey: 'lens', variantId: 'p-aqua-daily-30', quantity: 1, rx: RX, bundle },
      { lineKey: 'drops', variantId: 'a-nuoc-nho-mat-15', quantity: 1, bundle },
      { lineKey: 'tray', variantId: 'a-khay-dung-set', quantity: 1, bundle },
    ];

    it('charges the Bundle price for a complete Bundle and reports the saving', async () => {
      const { data } = await (await POST(req({ lines: set('p-aqua-daily') }))).json();
      expect(data.subtotal).toBe(55);
      expect(data.bundleSaving).toBe(3);
      expect(data.total).toBe(52 - data.discount);
    });

    it('charges separate prices for a partial Bundle', async () => {
      const { data } = await (await POST(req({ lines: set('p-aqua-daily').slice(0, 2) }))).json();
      expect(data.bundleSaving).toBe(0);
      expect(data.total).toBe(data.subtotal - data.discount);
    });
  });
});
