import { describe, it, expect } from 'vitest';
import { mockPricing, PricingError } from './mock';
import type { PriceCartRequest } from '@/lib/api/schemas/cart';

// Two known variants from content/mock/products.ts:
//   p-aqua-daily-30        price 25, USD
//   p-hazel-monthly-brown-30  price 48, USD
// 2 x 25 + 1 x 48 = 98 — a non-trivial baseline, not a round number, so a
// broken implementation (e.g. one that prices everything at 0, or at the
// posted `unitPrice`) cannot pass by accident.
const BASELINE_LINES = [
  { lineKey: 'l1', variantId: 'p-aqua-daily-30', quantity: 2 },
  { lineKey: 'l2', variantId: 'p-hazel-monthly-brown-30', quantity: 1 },
];

function req(lines: PriceCartRequest['lines']): PriceCartRequest {
  return { lines };
}

function reqWithShipping(
  lines: PriceCartRequest['lines'],
  shipping: PriceCartRequest['shipping'],
): PriceCartRequest {
  return { lines, shipping };
}

describe('mockPricing.priceCart', () => {
  it('sums the server-looked-up price times quantity for a non-trivial cart', async () => {
    const result = await mockPricing.priceCart(req(BASELINE_LINES));
    expect(result.subtotal).toBe(98);
    expect(result.lines).toEqual([
      {
        lineKey: 'l1',
        variantId: 'p-aqua-daily-30',
        quantity: 2,
        unitPrice: 25,
        lineTotal: 50,
        currency: 'USD',
      },
      {
        lineKey: 'l2',
        variantId: 'p-hazel-monthly-brown-30',
        quantity: 1,
        unitPrice: 48,
        lineTotal: 48,
        currency: 'USD',
      },
    ]);
  });

  it('ignores a posted unitPrice and prices from the catalogue instead', async () => {
    // A field not in priceLineInputSchema at all — TS would reject this
    // literal against PriceCartRequest, which is the point: the type never
    // admits a client-supplied price. Cast through `unknown` to simulate the
    // untyped JSON body a real POST would deliver (the end-to-end version of
    // this assertion, exercising `parseBody`'s stripping, lives in
    // app/api/cart/price/route.test.ts).
    const rigged = {
      lines: BASELINE_LINES.map((l) => ({ ...l, unitPrice: 1 })),
    } as unknown as PriceCartRequest;

    const result = await mockPricing.priceCart(rigged);
    expect(result.subtotal).toBe(98);
  });

  it('auto-applies the best applicable voucher and does not stack', async () => {
    // At subtotal 98: SUMMER10 (10%) = 9, SAVE15 (fixed) = 15. SAVE15 wins.
    // EXPIRED50, STALE-ACTIVE60 and USED5OFF would all win bigger discounts
    // if they were wrongly considered — they must not be.
    const result = await mockPricing.priceCart(req(BASELINE_LINES));
    expect(result.appliedVouchers).toHaveLength(1);
    expect(result.appliedVouchers[0].code).toBe('SAVE15');
    expect(result.discount).toBe(15);
    // Pinned literally, not derived from result.shipping — shipping is
    // always 0 until Task 8, and this proves both that value and the
    // subtotal + shipping - discount arithmetic in one assertion.
    expect(result.shipping).toBe(0);
    expect(result.total).toBe(83);
  });

  it('applies no voucher when the cart is below every eligible minSpend', async () => {
    // A single line at 20 clears no minSpend (SUMMER10/SAVE15 need 50,
    // BIGSPEND needs 200). FREESHIP has no minSpend and is active/unexpired,
    // but its discount against shipping=0 is 0 — a zero-discount candidate
    // is excluded from selection, so it does not "apply" for nothing either.
    const result = await mockPricing.priceCart(
      req([{ lineKey: 'l1', variantId: 'p-hazel-monthly-brown-10', quantity: 1 }]),
    );
    expect(result.subtotal).toBe(20);
    expect(result.discount).toBe(0);
    expect(result.appliedVouchers).toEqual([]);
  });

  it('never applies an expired or used voucher even when it would pay more', async () => {
    const result = await mockPricing.priceCart(req(BASELINE_LINES));
    const codes = result.appliedVouchers.map((v) => v.code);
    expect(codes).not.toContain('EXPIRED50');
    expect(codes).not.toContain('USED5OFF');
    expect(codes).not.toContain('STALE-ACTIVE60');
  });

  it('rejects an unknown variantId with a typed not_found error, not a silent zero', async () => {
    await expect(
      mockPricing.priceCart(req([{ lineKey: 'l1', variantId: 'nope-does-not-exist', quantity: 1 }])),
    ).rejects.toMatchObject({ code: 'not_found' });
    await expect(
      mockPricing.priceCart(req([{ lineKey: 'l1', variantId: 'nope-does-not-exist', quantity: 1 }])),
    ).rejects.toBeInstanceOf(PricingError);
  });

  it('rejects a zero or negative quantity', async () => {
    await expect(
      mockPricing.priceCart(req([{ lineKey: 'l1', variantId: 'p-aqua-daily-30', quantity: 0 }])),
    ).rejects.toMatchObject({ code: 'validation_failed' });
    await expect(
      mockPricing.priceCart(req([{ lineKey: 'l1', variantId: 'p-aqua-daily-30', quantity: -1 }])),
    ).rejects.toMatchObject({ code: 'validation_failed' });
  });

  it('folds the quoted shipping fee into shipping and total when a valid selection is given', async () => {
    // Known district (content/mock/shipping-rates.ts): standard = 3.
    // Voucher stays SAVE15 (fixed 15) — FREESHIP's discount against 3 is
    // still smaller (min(5, 3) = 3), so the winner doesn't change.
    const result = await mockPricing.priceCart(
      reqWithShipping(BASELINE_LINES, {
        province: 'Ho Chi Minh City',
        district: 'District 1',
        optionId: 'standard',
      }),
    );
    expect(result.shipping).toBe(3);
    expect(result.discount).toBe(15);
    expect(result.total).toBe(98 + 3 - 15);
  });

  it('rejects a shipping optionId that does not match any option in the real quote', async () => {
    await expect(
      mockPricing.priceCart(
        reqWithShipping(BASELINE_LINES, {
          province: 'Ho Chi Minh City',
          district: 'District 1',
          optionId: 'not-a-real-option',
        }),
      ),
    ).rejects.toMatchObject({ code: 'not_found' });
  });

  it('still prices shipping at 0 when shipping is omitted (Task 7 cart page regression)', async () => {
    const result = await mockPricing.priceCart(req(BASELINE_LINES));
    expect(result.shipping).toBe(0);
  });
});
