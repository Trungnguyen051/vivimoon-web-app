import { describe, it, expect } from 'vitest';
import { mockPricing, PricingError } from './mock';
import type { PriceCartRequest } from '@/lib/api/schemas/cart';

// Every catalogue product is `requiresRx`, and pricing refuses a line for one
// without a prescription — so every real-variant fixture line carries this.
// Single lenses, so each line costs its listed per-lens price (ADR-0023).
const SINGLE = { purchaseUnit: 'single', rx: { sph: -2.5 } } as const;

// Two known variants from content/mock/products.ts:
//   p-aqua-daily-30        price 125.000, VND
//   p-hazel-monthly-brown-30  price 100.000, VND
// 2 x 125.000 + 1 x 100.000 = 350.000 — a non-trivial baseline, not a single variant's price, so a
// broken implementation (e.g. one that prices everything at 0, or at the
// posted `unitPrice`) cannot pass by accident.
const BASELINE_LINES = [
  { lineKey: 'l1', variantId: 'p-aqua-daily-30', quantity: 2, ...SINGLE },
  { lineKey: 'l2', variantId: 'p-hazel-monthly-brown-30', quantity: 1, ...SINGLE },
];

// 2 x 125.000 = 250.000: under the 300.000 free-shipping Spend Tier, so shipping is charged.
const UNDER_FREESHIP_LINES = [{ lineKey: 'l1', variantId: 'p-aqua-daily-30', quantity: 2, ...SINGLE }];

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
    expect(result.subtotal).toBe(350_000);
    expect(result.lines).toEqual([
      {
        lineKey: 'l1',
        variantId: 'p-aqua-daily-30',
        quantity: 2,
        unitPrice: 125_000,
        lineTotal: 250_000,
        currency: 'VND',
      },
      {
        lineKey: 'l2',
        variantId: 'p-hazel-monthly-brown-30',
        quantity: 1,
        unitPrice: 100_000,
        lineTotal: 100_000,
        currency: 'VND',
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
    expect(result.subtotal).toBe(350_000);
  });

  it('auto-applies the best applicable voucher and does not stack', async () => {
    // At subtotal 350.000: SUMMER10 (10%) = 35.000, SAVE15 (fixed) = 75.000. SAVE15 wins.
    // EXPIRED50, STALE-ACTIVE60 and USED5OFF would all win bigger discounts
    // if they were wrongly considered — they must not be.
    const result = await mockPricing.priceCart(req(BASELINE_LINES));
    expect(result.appliedVouchers).toHaveLength(1);
    expect(result.appliedVouchers[0].code).toBe('SAVE15');
    expect(result.discount).toBe(75_000);
    // Pinned literally, not derived from result.shipping — shipping is
    // always 0 until Task 8, and this proves both that value and the
    // subtotal + shipping - discount arithmetic in one assertion.
    expect(result.shipping).toBe(0);
    expect(result.total).toBe(275_000);
  });

  it('below every minSpend, applies only the no-minimum NEW30', async () => {
    // A single line at 110.000 clears no minSpend (SUMMER10/SAVE15 need 250.000,
    // BIGSPEND needs 1.000.000). FREESHIP has no minSpend and is active/unexpired,
    // but its discount against shipping=0 is 0 — a zero-discount candidate
    // is excluded from selection, so it does not "apply" for nothing either.
    const result = await mockPricing.priceCart(
      req([{ lineKey: 'l1', variantId: 'p-breeze-daily-30', quantity: 1, ...SINGLE }]),
    );
    expect(result.subtotal).toBe(110_000);
    expect(result.discount).toBe(30_000);
    expect(result.appliedVouchers.map((v) => v.code)).toEqual(['NEW30']);
  });

  describe('a voucher the shopper picked or typed (CONTEXT.md "Voucher")', () => {
    const priced = (voucherCode: string, userId: string | null = null) =>
      mockPricing.priceCart({ lines: BASELINE_LINES, voucherCode }, userId);

    it('lists every currently valid Voucher for the radio list, members-only ones only with a session', async () => {
      const guest = await mockPricing.priceCart(req(BASELINE_LINES));
      const codes = guest.vouchers?.map((v) => v.code);
      expect(codes).toEqual(expect.arrayContaining(['NEW30', 'SUMMER10', 'SAVE15', 'BIGSPEND', 'FREESHIP']));
      expect(codes).not.toEqual(expect.arrayContaining(['MEMBER20']));
      for (const gone of ['USED5OFF', 'EXPIRED50', 'STALE-ACTIVE60']) expect(codes).not.toContain(gone);
      const member = await mockPricing.priceCart(req(BASELINE_LINES), 'user-1');
      expect(member.vouchers?.map((v) => v.code)).toContain('MEMBER20');
    });

    it('applies a valid code in place of the best one, case-insensitively', async () => {
      const result = await priced('new30');
      expect(result.appliedVouchers.map((v) => v.code)).toEqual(['NEW30']);
      expect(result.discount).toBe(30_000);
      expect(result.total).toBe(350_000 - 30_000);
      expect(result.voucherError).toBeUndefined();
    });

    it.each([
      ['NOPE', 'unknown'],
      ['EXPIRED50', 'expired'],
      ['STALE-ACTIVE60', 'expired'],
      ['USED5OFF', 'expired'],
      ['MEMBER20', 'memberOnly'],
      ['BIGSPEND', 'minSpend'],
    ] as const)('refuses %s with a typed "%s" error and keeps the best Voucher and the rest of the price', async (code, reason) => {
      const result = await priced(code);
      expect(result.voucherError).toEqual({ code, reason });
      expect(result.appliedVouchers.map((v) => v.code)).toEqual(['SAVE15']);
      expect(result.subtotal).toBe(350_000);
      expect(result.total).toBe(275_000);
    });

    it('accepts a member-only code with a session', async () => {
      const result = await priced('MEMBER20', 'user-1');
      expect(result.voucherError).toBeUndefined();
      expect(result.discount).toBe(100_000);
    });

    it('reports what the shopper saves: Bundle, Voucher and Spend Tier discounts together', async () => {
      const result = await priced('NEW30');
      expect(result.saved).toBe(30_000);
    });
  });

  it('never applies an expired or used voucher even when it would pay more', async () => {
    const result = await mockPricing.priceCart(req(BASELINE_LINES));
    const codes = result.appliedVouchers.map((v) => v.code);
    expect(codes).not.toContain('EXPIRED50');
    expect(codes).not.toContain('USED5OFF');
    expect(codes).not.toContain('STALE-ACTIVE60');
  });

  // ADR-0012. A cart persisted in localStorage outlives any catalogue change,
  // so an unknown variant is an expected state of a returning shopper's cart
  // — reported per line, never thrown, and never silently dropped either.
  it('reports an unknown variantId as unavailable instead of throwing', async () => {
    const result = await mockPricing.priceCart(
      req([{ lineKey: 'l1', variantId: 'nope-does-not-exist', quantity: 1 }]),
    );
    expect(result.unavailableLines).toEqual([
      { lineKey: 'l1', variantId: 'nope-does-not-exist' },
    ]);
    expect(result.lines).toEqual([]);
  });

  it('still prices every known line when one line is unavailable', async () => {
    const result = await mockPricing.priceCart(
      req([
        { lineKey: 'l1', variantId: 'p-aqua-daily-30', quantity: 2, ...SINGLE },
        { lineKey: 'l2', variantId: 'nope-does-not-exist', quantity: 1 },
      ]),
    );
    expect(result.lines.map((l) => l.lineKey)).toEqual(['l1']);
    expect(result.unavailableLines.map((l) => l.lineKey)).toEqual(['l2']);
    // The surviving line's own total, not a zero, and not the whole cart's
    // price blanked out by its stale neighbour.
    expect(result.subtotal).toBe(250_000);
  });

  it('omits currency, and zeroes every total, when no line could be priced', async () => {
    const result = await mockPricing.priceCart(
      req([{ lineKey: 'l1', variantId: 'ghost', quantity: 1 }]),
    );
    expect(result.currency).toBeUndefined();
    expect(result.subtotal).toBe(0);
    expect(result.total).toBe(0);
  });

  it('every requested line comes back in exactly one of lines/unavailableLines', async () => {
    const requested = [
      { lineKey: 'l1', variantId: 'p-aqua-daily-30', quantity: 1, ...SINGLE },
      { lineKey: 'l2', variantId: 'ghost', quantity: 1 },
      { lineKey: 'l3', variantId: 'p-breeze-daily-30', quantity: 1, ...SINGLE },
    ];
    const result = await mockPricing.priceCart(req(requested));
    const returned = [...result.lines, ...result.unavailableLines].map((l) => l.lineKey).sort();
    expect(returned).toEqual(['l1', 'l2', 'l3']);
  });

  it('rejects a line for a prescription product that carries no rx', async () => {
    await expect(
      mockPricing.priceCart({ lines: [{ lineKey: 'l1', variantId: 'p-aqua-daily-30', quantity: 1 }] }),
    ).rejects.toMatchObject({ name: 'PricingError', code: 'validation_failed' });
  });

  describe('accessories (Product Kind)', () => {
    // a-nuoc-ngam-120: price 89.000, a-nuoc-ngam-360: price 159.000 (content/mock/accessories.ts).
    it('prices an accessory by its variant, with no Rx and no unit', async () => {
      const result = await mockPricing.priceCart(req([
        { lineKey: 'a1', variantId: 'a-nuoc-ngam-120', quantity: 2 },
        { lineKey: 'a2', variantId: 'a-nuoc-ngam-360', quantity: 1 },
      ]));
      expect(result.lines.map((l) => [l.unitPrice, l.lineTotal])).toEqual([[89_000, 178_000], [159_000, 159_000]]);
      expect(result.subtotal).toBe(337_000);
    });

    it('prices an accessory alongside a lens in one cart', async () => {
      const result = await mockPricing.priceCart(req([
        { lineKey: 'l1', variantId: 'p-aqua-daily-30', quantity: 1, ...SINGLE },
        { lineKey: 'a1', variantId: 'a-nuoc-ngam-120', quantity: 1 },
      ]));
      expect(result.subtotal).toBe(214_000);
    });

    it('rejects an accessory line that carries an Rx', async () => {
      await expect(
        mockPricing.priceCart(req([{ lineKey: 'a1', variantId: 'a-nuoc-ngam-120', quantity: 1, ...SINGLE }])),
      ).rejects.toMatchObject({ name: 'PricingError', code: 'validation_failed' });
    });

    it('rejects a gift-only accessory as a paid line', async () => {
      await expect(
        mockPricing.priceCart(req([{ lineKey: 'g1', variantId: 'a-kits-yeu-mat-1', quantity: 1 }])),
      ).rejects.toMatchObject({ name: 'PricingError', code: 'validation_failed' });
    });

    it('rejects an accessory line that carries a Purchase Unit', async () => {
      await expect(
        mockPricing.priceCart(req([{ lineKey: 'a1', variantId: 'a-nuoc-ngam-120', quantity: 1, purchaseUnit: 'pair' }])),
      ).rejects.toMatchObject({ name: 'PricingError', code: 'validation_failed' });
    });
  });

  it('rejects a zero or negative quantity', async () => {
    await expect(
      mockPricing.priceCart(req([{ lineKey: 'l1', variantId: 'p-aqua-daily-30', quantity: 0, ...SINGLE }])),
    ).rejects.toBeInstanceOf(PricingError);
    await expect(
      mockPricing.priceCart(req([{ lineKey: 'l1', variantId: 'p-aqua-daily-30', quantity: 0, ...SINGLE }])),
    ).rejects.toMatchObject({ code: 'validation_failed' });
    await expect(
      mockPricing.priceCart(req([{ lineKey: 'l1', variantId: 'p-aqua-daily-30', quantity: -1, ...SINGLE }])),
    ).rejects.toMatchObject({ code: 'validation_failed' });
  });

  it('folds the quoted shipping fee into shipping and total when a valid selection is given', async () => {
    // Known district (content/mock/shipping-rates.ts): standard = 30.000.
    // Voucher stays SAVE15 (fixed 75.000) — FREESHIP's discount against 30.000 is
    // still smaller (min(50.000, 30.000) = 30.000), so the winner doesn't change.
    const result = await mockPricing.priceCart(
      reqWithShipping(UNDER_FREESHIP_LINES, {
        province: 'Ho Chi Minh City',
        district: 'District 1',
        optionId: 'standard',
      }),
    );
    expect(result.shipping).toBe(30_000);
    expect(result.discount).toBe(75_000);
    expect(result.total).toBe(250_000 + 30_000 - 75_000);
  });

  it('names the charged shipping option and its delivery days, from the same selection as the fee', async () => {
    // District 1: cheapest is standard (fee 30.000, etaDays 2).
    const result = await mockPricing.priceCart(
      reqWithShipping(UNDER_FREESHIP_LINES, { province: 'Ho Chi Minh City', district: 'District 1' }),
    );
    expect(result.shippingMethod).toBe('standard');
    expect(result.shippingEtaDays).toBe(2);
  });

  it('rejects a shipping optionId that does not match any option in the real quote', async () => {
    await expect(
      mockPricing.priceCart(
        reqWithShipping(UNDER_FREESHIP_LINES, {
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

  describe('auto-selecting the cheapest shipping option when optionId is omitted (M5.4, issue #21)', () => {
    it('charges the cheapest of the quoted options for the address, with no optionId given', async () => {
      // Ho Chi Minh City|District 1: standard = 30.000, express = 50.000 — cheapest wins.
      const result = await mockPricing.priceCart(
        reqWithShipping(UNDER_FREESHIP_LINES, { province: 'Ho Chi Minh City', district: 'District 1' }),
      );
      expect(result.shipping).toBe(30_000);
      expect(result.total).toBe(250_000 + 30_000 - 75_000);
    });

    it('matches exactly what an explicit optionId for the cheapest option would charge', async () => {
      const auto = await mockPricing.priceCart(
        reqWithShipping(UNDER_FREESHIP_LINES, { province: 'Hanoi', district: 'Ba Dinh' }),
      );
      const explicit = await mockPricing.priceCart(
        reqWithShipping(UNDER_FREESHIP_LINES, { province: 'Hanoi', district: 'Ba Dinh', optionId: 'standard' }),
      );
      expect(auto.shipping).toBe(explicit.shipping);
      expect(auto.total).toBe(explicit.total);
    });

    it('still resolves a single-option fallback address (unknown province/district) with no optionId', async () => {
      const result = await mockPricing.priceCart(
        reqWithShipping(UNDER_FREESHIP_LINES, { province: 'Nowhere', district: 'Nowhere' }),
      );
      expect(result.shipping).toBe(30_000); // defaultShippingOptions' one entry
    });
  });

  describe('guest -> member cart merge (spec §9)', () => {
    it('excludes a memberOnly voucher for a guest (no userId)', async () => {
      const result = await mockPricing.priceCart(req(BASELINE_LINES));
      const codes = result.appliedVouchers.map((v) => v.code);
      expect(codes).not.toContain('MEMBER20');
      // Unchanged from the guest baseline: SAVE15 still wins at 350.000.
      expect(result.appliedVouchers[0].code).toBe('SAVE15');
      expect(result.discount).toBe(75_000);
    });

    it('applies the memberOnly voucher once signed in, and it outbids the guest winner', async () => {
      // At subtotal 350.000: MEMBER20 (fixed 100.000) beats SAVE15 (fixed 75.000) and
      // SUMMER10 (10% = 35.000) — the same cart, re-priced under a session,
      // yields a *different* (larger) discount purely from userId flipping.
      const result = await mockPricing.priceCart(req(BASELINE_LINES), 'user-1');
      expect(result.appliedVouchers).toHaveLength(1);
      expect(result.appliedVouchers[0].code).toBe('MEMBER20');
      expect(result.discount).toBe(100_000);
      expect(result.total).toBe(350_000 - 100_000);
    });

    it('does not apply a memberOnly voucher below its minSpend even when signed in', async () => {
      const result = await mockPricing.priceCart(
        req([{ lineKey: 'l1', variantId: 'p-breeze-daily-30', quantity: 1, ...SINGLE }]),
        'user-1',
      );
      expect(result.subtotal).toBe(110_000);
      const codes = result.appliedVouchers.map((v) => v.code);
      expect(codes).not.toContain('MEMBER20');
    });
  });
});

// p-aqua-daily's Bundle (content/mock/products.ts): Nước nhỏ mắt 15ml (3) and
// Khay đựng + dụng cụ (2) at 52 with the lens as a pair (2 x 25): 55 apart, saving 3.
describe('mockPricing.priceCart — Bundles', () => {
  const PAIR = { purchaseUnit: 'pair', rx: { left: { sph: -2 }, right: { sph: -2 } } } as const;
  const lens = (extra: object = {}) => ({ lineKey: 'lens', variantId: 'p-aqua-daily-30', quantity: 1, ...PAIR, ...extra });
  const drops = (extra: object = {}) => ({ lineKey: 'drops', variantId: 'a-nuoc-nho-mat-15', quantity: 1, ...extra });
  const tray = (extra: object = {}) => ({ lineKey: 'tray', variantId: 'a-khay-dung-set', quantity: 1, ...extra });
  const via = { bundle: 'p-aqua-daily' };

  it('applies the Bundle price when the whole Bundle was added together', async () => {
    const result = await mockPricing.priceCart(req([lens(via), drops(via), tray(via)]));
    expect(result.subtotal).toBe(354_000);
    expect(result.bundleSaving).toBe(24_000);
    expect(result.bundledSubtotal).toBe(330_000);
    expect(result.total).toBe(330_000 - result.discount);
  });

  it('saves the same with a single lens: the combo less one lens', async () => {
    const result = await mockPricing.priceCart(req([lens({ ...SINGLE, ...via }), drops(via), tray(via)]));
    expect(result.subtotal).toBe(229_000);
    expect(result.bundleSaving).toBe(24_000);
  });

  it('applies nothing to a partial Bundle', async () => {
    const result = await mockPricing.priceCart(req([lens(via), drops(via)]));
    expect(result.bundleSaving).toBe(0);
    expect(result.total).toBe(result.subtotal - result.discount);
  });

  it('applies nothing to the same items bought separately', async () => {
    const result = await mockPricing.priceCart(req([lens(), drops(), tray()]));
    expect(result.bundleSaving).toBe(0);
  });

  it('saves once per complete set', async () => {
    const two = { quantity: 2, ...via };
    expect((await mockPricing.priceCart(req([lens(two), drops(two), tray(two)]))).bundleSaving).toBe(48_000);
    expect((await mockPricing.priceCart(req([lens(two), drops(via), tray(two)]))).bundleSaving).toBe(24_000);
  });

  it('ignores a tag naming a lens that has no Bundle', async () => {
    const result = await mockPricing.priceCart(req([
      { lineKey: 'l', variantId: 'p-hazel-monthly-brown-30', quantity: 1, ...SINGLE, bundle: 'p-hazel-monthly' },
      drops({ bundle: 'p-hazel-monthly' }),
    ]));
    expect(result.bundleSaving).toBe(0);
  });
});

describe('mockPricing.priceCart — Spend Tiers and Gifts', () => {
  const HCMC = { province: 'Ho Chi Minh City', district: 'District 1' };
  const aqua = (quantity: number) => ({ lineKey: 'aqua', variantId: 'p-aqua-daily-30', quantity, ...SINGLE });

  it('charges shipping below the free-shipping tier and zeroes it at the tier', async () => {
    // 2 x 125.000 = 250.000; 3 x 125.000 = 375.000.
    expect((await mockPricing.priceCart(reqWithShipping([aqua(2)], HCMC))).shipping).toBe(30_000);
    const free = await mockPricing.priceCart(reqWithShipping([aqua(3)], HCMC));
    expect(free.shipping).toBe(0);
    expect(free.shippingMethod).toBe('standard');
    expect(free.total).toBe(375_000 - free.discount);
  });

  it('reports the tiers and the amount left to the next one', async () => {
    const result = await mockPricing.priceCart(req([aqua(2)]));
    expect(result.spendTiers?.map((t) => t.reached)).toEqual([false, false, false]);
    expect(result.nextSpendTier).toEqual({ threshold: 300_000, reward: 'freeShipping', remaining: 50_000 });
  });

  it('counts the tiers from the subtotal after the Bundle saving', async () => {
    const via = { bundle: 'p-aqua-daily' };
    // 354.000 Bundle set + 100.000 + 65.000 = 519.000, less the 24.000 saving = 495.000.
    const result = await mockPricing.priceCart(req([
      { lineKey: 'lens', variantId: 'p-aqua-daily-30', quantity: 1, purchaseUnit: 'pair' as const, rx: { sameBothEyes: false, left: { sph: -2 }, right: { sph: -2 } }, ...via },
      { lineKey: 'drops', variantId: 'a-nuoc-nho-mat-15', quantity: 1, ...via },
      { lineKey: 'tray', variantId: 'a-khay-dung-set', quantity: 1, ...via },
      { lineKey: 'hazel', variantId: 'p-hazel-monthly-brown-30', quantity: 1, ...SINGLE },
      { lineKey: 'drops2', variantId: 'a-nuoc-nho-mat-15', quantity: 1 },
    ]));
    expect(result.subtotal).toBe(519_000);
    expect(result.nextSpendTier).toMatchObject({ reward: 'gift', remaining: 5_000 });
    expect(result.gifts).toEqual([]);
  });

  it('adds the Khay đựng Gift at 0₫ from 500.000', async () => {
    // 4 x 125.000 = 500.000.
    const result = await mockPricing.priceCart(req([aqua(4)]));
    expect(result.gifts).toEqual([
      expect.objectContaining({ variantId: 'a-khay-dung-set', quantity: 1, lineTotal: 0, reason: 'spendTier' }),
    ]);
    expect(result.lines).toHaveLength(1);
  });

  it('adds a Kits Yêu Mắt Gift for a 6-month lens, and none for other lenses', async () => {
    const result = await mockPricing.priceCart(req([
      { lineKey: 'torica', variantId: 'p-torica-biweekly-6', quantity: 1, ...SINGLE },
    ]));
    expect(result.gifts).toEqual([
      expect.objectContaining({
        variantId: 'a-kits-yeu-mat-1', name: 'Kits Yêu Mắt', lineTotal: 0, reason: 'product', forProductId: 'p-torica-biweekly',
      }),
    ]);
    expect((await mockPricing.priceCart(req([aqua(1)]))).gifts).toEqual([]);
  });

  it('takes 50.000 off the total from 800.000, after the voucher', async () => {
    // 7 x 125.000 = 875.000 vs 6 x 125.000 = 750.000.
    const under = await mockPricing.priceCart(req([aqua(6)]));
    expect(under.tierDiscount).toBe(0);
    const at = await mockPricing.priceCart(req([aqua(7)]));
    expect(at.tierDiscount).toBe(50_000);
    expect(at.total).toBe(875_000 - at.discount - 50_000);
  });
});
