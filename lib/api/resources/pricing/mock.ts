import { catalog } from '@/lib/api/resources/catalog';
import { shipping } from '@/lib/api/resources/shipping';
import { vouchers as voucherFixtures } from '@/content/mock';
import type { Currency } from '@/lib/api/schemas/catalog';
import type { PriceCartRequest, PricedCart, PricedLine, Voucher } from '@/lib/api/schemas/cart';

/** Thrown by the mock so the route handler can map it to an envelope. */
export class PricingError extends Error {
  constructor(message: string, readonly code: 'not_found' | 'validation_failed') {
    super(message);
    this.name = 'PricingError';
  }
}

/**
 * Eligibility only — active, unexpired, and at/above minSpend. Both `status`
 * AND `expiresAt` are checked independently: a voucher can be flagged
 * `active` while its date has already passed (the backend hasn't swept it
 * yet — see `STALE-ACTIVE60` in content/mock/vouchers.ts), so relying on
 * `status` alone would let a stale voucher apply.
 */
function voucherApplies(v: Voucher, subtotal: number, isMember: boolean): boolean {
  if (v.status !== 'active') return false;
  if (Date.parse(v.expiresAt) <= Date.now()) return false;
  if (v.minSpend !== undefined && subtotal < v.minSpend) return false;
  if (v.memberOnly && !isMember) return false;
  return true;
}

function voucherDiscount(v: Voucher, subtotal: number, shipping: number): number {
  switch (v.type) {
    case 'percent':
      return Math.floor((subtotal * v.value) / 100);
    case 'fixed':
      return Math.min(v.value, subtotal);
    case 'shipping':
      return Math.min(v.value, shipping);
  }
}

/**
 * Auto-selects a single voucher (spec: "auto-voucher behavior identical for
 * guests and members" for eligibility rules other than membership itself —
 * no code is submitted by the client in M2). `isMember` gates only
 * `memberOnly` vouchers (spec §9 guest→member merge); every other rule is
 * unchanged between guest and member carts.
 *
 * DECISION: vouchers do NOT stack. Exactly one voucher, or none, is applied
 * — whichever eligible voucher yields the largest discount. A candidate
 * whose computed discount is 0 (a `shipping` voucher while `shipping` is
 * still 0, pre-Task 8) is dropped before comparison, so it never "applies"
 * for zero benefit even when it is the only eligible voucher.
 */
function bestVoucher(
  subtotal: number,
  shipping: number,
  isMember: boolean,
): { discount: number; applied: Voucher[] } {
  const candidates = voucherFixtures
    .filter((v) => voucherApplies(v, subtotal, isMember))
    .map((v) => ({ voucher: v, discount: voucherDiscount(v, subtotal, shipping) }))
    .filter((c) => c.discount > 0);

  if (candidates.length === 0) return { discount: 0, applied: [] };

  const best = candidates.reduce((a, b) => (b.discount > a.discount ? b : a));
  return { discount: best.discount, applied: [best.voucher] };
}

export const mockPricing = {
  /**
   * The server re-prices every line from its own catalogue by `variantId`.
   * `priceLineInputSchema` never admits a client-supplied price, so there is
   * nothing here to "ignore" at runtime — the field simply cannot arrive.
   *
   * `userId` comes from the route handler's own verified session cookie,
   * never the request body (same posture as `orders.place`) — it only
   * decides `memberOnly` voucher eligibility (spec §9).
   */
  async priceCart(input: PriceCartRequest, userId: string | null = null): Promise<PricedCart> {
    if (input.lines.length === 0) {
      throw new PricingError('cart must contain at least one line', 'validation_failed');
    }

    const lines: PricedLine[] = [];
    for (const line of input.lines) {
      if (!Number.isInteger(line.quantity) || line.quantity <= 0) {
        throw new PricingError(
          `quantity must be a positive integer for line "${line.lineKey}"`,
          'validation_failed',
        );
      }

      const found = await catalog.getVariantById(line.variantId);
      if (!found) {
        throw new PricingError(`Unknown variant "${line.variantId}"`, 'not_found');
      }

      lines.push({
        lineKey: line.lineKey,
        variantId: line.variantId,
        quantity: line.quantity,
        unitPrice: found.variant.price,
        lineTotal: found.variant.price * line.quantity,
        currency: found.variant.currency,
      });
    }

    const currency: Currency = lines[0].currency;
    if (lines.some((l) => l.currency !== currency)) {
      throw new PricingError('Cart lines must share a single currency', 'validation_failed');
    }

    const subtotal = lines.reduce((sum, l) => sum + l.lineTotal, 0);

    // Stays 0 when `shipping` is omitted (Task 7's cart page — no address
    // exists there). When present, the fee is never the client's number:
    // re-quote the real options for this province/district and use the
    // fee of whichever one actually matches `optionId`.
    let shippingFee = 0;
    if (input.shipping) {
      const options = await shipping.quote({
        province: input.shipping.province,
        district: input.shipping.district,
      });
      const match = options.find((o) => o.id === input.shipping!.optionId);
      if (!match) {
        throw new PricingError(`Unknown shipping option "${input.shipping.optionId}"`, 'not_found');
      }
      shippingFee = match.fee;
    }

    const { discount, applied } = bestVoucher(subtotal, shippingFee, userId !== null);
    const total = Math.max(0, subtotal + shippingFee - discount);

    return {
      lines,
      subtotal,
      discount,
      appliedVouchers: applied,
      shipping: shippingFee,
      total,
      currency,
    };
  },
};

export type Pricing = typeof mockPricing;
