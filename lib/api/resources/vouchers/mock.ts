import { vouchers as voucherFixtures } from '@/content/mock';
import type { Voucher } from '@/lib/api/schemas/cart';

/**
 * Status AND expiry are checked independently — a voucher can be flagged
 * `active` while its date has already passed (the backend hasn't swept it
 * yet — see `STALE-ACTIVE60` in content/mock/vouchers.ts). Same rule as
 * `voucherApplies` in lib/api/resources/pricing/mock.ts, but without its
 * `minSpend`/`memberOnly` cart-eligibility checks: "My Vouchers" (M3.5,
 * issue #9) is every currently-valid voucher a member could apply, not
 * which one would apply to a specific cart.
 */
function isCurrentlyValid(v: Voucher): boolean {
  return v.status === 'active' && Date.parse(v.expiresAt) > Date.now();
}

export const mockVouchers = {
  async listActive(): Promise<Voucher[]> {
    return voucherFixtures.filter(isCurrentlyValid);
  },
};

export type Vouchers = typeof mockVouchers;
