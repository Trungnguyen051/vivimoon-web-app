import { catalog } from '@/lib/api/resources/catalog';
import { shipping } from '@/lib/api/resources/shipping';
import { vouchers as voucherFixtures } from '@/content/mock';
import type { Currency } from '@/lib/api/schemas/catalog';
import { lensesIn, purchaseUnitOf } from '@/lib/api/schemas/rx';
import type {
  GiftLine, PriceCartRequest, PricedCart, PricedLine, UnavailableLine, Voucher,
} from '@/lib/api/schemas/cart';
import { spendTiersFor, TIER_GIFT_VARIANT_ID } from './spend-tiers';

/** PROVISIONAL: a 6-month lens comes with this Gift (CONTEXT.md "Gift"). */
const SIX_MONTH_GIFT_VARIANT_ID = 'a-kits-yeu-mat-1';

async function giftLine(variantId: string, reason: GiftLine['reason'], forProductId?: string): Promise<GiftLine | null> {
  const found = await catalog.getVariantById(variantId);
  if (!found) return null;
  return {
    productId: found.product.id,
    variantId,
    name: found.product.name,
    image: found.product.images[0],
    quantity: 1,
    lineTotal: 0,
    reason,
    ...(forProductId ? { forProductId } : {}),
  };
}

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
    const unavailableLines: UnavailableLine[] = [];
    // Bundle-tagged lines, by the lens they were bundled with, then by product:
    // that product's listed price (per lens for a lens) and its units.
    const bundled = new Map<string, Map<string, { price: number; units: number }>>();
    const bundleDefs = new Map<string, { accessoryIds: string[]; price: number }>();
    // The first 6-month lens in the cart, which earns the Kits Yêu Mắt Gift.
    let sixMonthLensId: string | undefined;
    for (const line of input.lines) {
      if (!Number.isInteger(line.quantity) || line.quantity <= 0) {
        throw new PricingError(
          `quantity must be a positive integer for line "${line.lineKey}"`,
          'validation_failed',
        );
      }

      const found = await catalog.getVariantById(line.variantId);
      if (!found) {
        // Reported, not thrown (ADR-0012). A cart persisted in localStorage
        // outlives any catalogue change, so an unknown variant is an expected
        // state of a returning shopper's cart, not a malformed request —
        // throwing let one stale line blank out the price of every other.
        unavailableLines.push({ lineKey: line.lineKey, variantId: line.variantId });
        continue;
      }

      // The PDP refuses to add a prescription product without an rx, but
      // that is the client's check; this is the one a crafted request meets.
      if (found.product.requiresRx && !line.rx) {
        throw new PricingError(`line "${line.lineKey}" requires a prescription`, 'validation_failed');
      }

      if (!found.product.requiresRx && (line.purchaseUnit || line.rx)) {
        throw new PricingError(`line "${line.lineKey}" is not a lens: it takes no unit or prescription`, 'validation_failed');
      }

      // A Gift is never a Cart Line (CONTEXT.md "Gift"): a gift-only item is not for sale.
      if ('giftOnly' in found.product && found.product.giftOnly) {
        throw new PricingError(`line "${line.lineKey}" is a gift and cannot be bought`, 'validation_failed');
      }

      // The listed price is per single lens; a pair costs two (ADR-0023).
      // A unit-less line with an Rx predates units and is read as a pair.
      const unitPrice = found.variant.price * lensesIn(purchaseUnitOf(line));
      lines.push({
        lineKey: line.lineKey,
        variantId: line.variantId,
        quantity: line.quantity,
        unitPrice,
        lineTotal: unitPrice * line.quantity,
        currency: found.variant.currency,
      });

      if ('replacement' in found.product && found.product.replacement === 'sixMonth') sixMonthLensId ??= found.product.id;

      if (line.bundle) {
        if (found.product.id === line.bundle && 'bundle' in found.product && found.product.bundle) {
          bundleDefs.set(line.bundle, found.product.bundle);
        }
        const items = bundled.get(line.bundle) ?? new Map();
        const item = items.get(found.product.id);
        // shortcut: two variants of one product in a set price the set at the first one's; fine while Bundles add one variant each.
        items.set(found.product.id, { price: item?.price ?? found.variant.price, units: (item?.units ?? 0) + line.quantity });
        bundled.set(line.bundle, items);
      }
    }

    // Undefined only when nothing priced — there is then no catalogue variant
    // to read a currency off, and every total below is 0 anyway.
    const currency: Currency | undefined = lines[0]?.currency;
    if (lines.some((l) => l.currency !== currency)) {
      throw new PricingError('Cart lines must share a single currency', 'validation_failed');
    }

    const subtotal = lines.reduce((sum, l) => sum + l.lineTotal, 0);

    // The Bundle price applies once per complete set added through the Bundle
    // (CONTEXT.md "Bundle"). Its price counts the lens as a pair; a single lens
    // buys the combo less one lens, so either way the set saves the same.
    let bundleSaving = 0;
    for (const [lensId, def] of bundleDefs) {
      const items = bundled.get(lensId)!;
      const ids = [lensId, ...def.accessoryIds];
      if (!ids.every((id) => items.has(id))) continue;
      const sets = Math.min(...ids.map((id) => items.get(id)!.units));
      const apart = items.get(lensId)!.price * 2 + def.accessoryIds.reduce((sum, id) => sum + items.get(id)!.price, 0);
      bundleSaving += sets * Math.max(0, apart - def.price);
    }
    const payable = subtotal - bundleSaving;
    // DECISION: Spend Tiers count from the subtotal after the Bundle saving and
    // before vouchers — what the shopper's goods cost — so a voucher never
    // takes back the free shipping it was applied next to.
    const tiers = spendTiersFor(payable);
    // shortcut: one Gift per order whatever the quantity; revisit when Vivimoon confirms its Gift rules.
    const gifts = (await Promise.all([
      sixMonthLensId ? giftLine(SIX_MONTH_GIFT_VARIANT_ID, 'product', sixMonthLensId) : null,
      tiers.gift ? giftLine(TIER_GIFT_VARIANT_ID, 'spendTier') : null,
    ])).filter((g) => g !== null);

    // Stays 0 when `shipping` is omitted (Task 7's cart page — no address
    // exists there). When present, the fee is never the client's number:
    // re-quote the real options for this province/district and use the fee
    // of whichever one actually matches `optionId` — or, when `optionId`
    // itself is omitted (checkout's price preview and order placement,
    // M5.4 issue #21 — there is no delivery-method picker), the cheapest
    // quoted option, same selection order placement already made itself.
    let shippingFee = 0;
    let shippingMethod: string | undefined;
    let shippingEtaDays: number | undefined;
    if (input.shipping) {
      const options = await shipping.quote({
        province: input.shipping.province,
        district: input.shipping.district,
      });
      const match = input.shipping.optionId
        ? options.find((o) => o.id === input.shipping!.optionId)
        : options.reduce((a, b) => (b.fee < a.fee ? b : a));
      if (!match) {
        throw new PricingError(`Unknown shipping option "${input.shipping.optionId}"`, 'not_found');
      }
      // The free-shipping Spend Tier zeroes the fee of whichever option was chosen.
      shippingFee = tiers.freeShipping ? 0 : match.fee;
      shippingMethod = match.id;
      shippingEtaDays = match.etaDays;
    }

    const { discount, applied } = bestVoucher(payable, shippingFee, userId !== null);
    const total = Math.max(0, payable + shippingFee - discount - tiers.discount);

    return {
      lines,
      unavailableLines,
      subtotal,
      bundleSaving,
      bundledSubtotal: payable,
      discount,
      appliedVouchers: applied,
      spendTiers: tiers.tiers,
      ...(tiers.next ? { nextSpendTier: tiers.next } : {}),
      tierDiscount: tiers.discount,
      gifts,
      shipping: shippingFee,
      ...(shippingMethod ? { shippingMethod, shippingEtaDays } : {}),
      total,
      currency,
    };
  },
};

export type Pricing = typeof mockPricing;
