import type { Voucher } from '@/lib/api/schemas/cart';

/**
 * Mock vouchers (spec §6). `POST /api/cart/price` auto-selects the single
 * best-applicable one from this list — the shopper never enters a code in
 * M2. See lib/api/resources/pricing/mock.ts for the selection rule.
 *
 * `SUMMER10` and `SAVE15` are the two live, competing vouchers most fixture
 * carts should see. The rest exist to prove specific exclusion rules:
 * `USED5OFF` (status), `EXPIRED50` (status, belt-and-braces with a past
 * date), `STALE-ACTIVE60` (an `active` voucher backend hasn't swept past its
 * `expiresAt` yet — proves the date check fires independently of `status`),
 * `BIGSPEND` (minSpend), `FREESHIP` (a `shipping` voucher, which never has a
 * positive discount while `shipping` is `0`, pre-Task 8), and `MEMBER20`
 * (`memberOnly` — proves the guest→member merge re-prices under the new
 * session rather than replaying a cached guest quote).
 */
export const vouchers: Voucher[] = [
  {
    code: 'SUMMER10',
    title: '10% off',
    description: '10% off orders over 250.000₫',
    type: 'percent',
    value: 10,
    minSpend: 250_000,
    expiresAt: '2099-01-01T00:00:00.000Z',
    status: 'active',
  },
  {
    code: 'SAVE15',
    title: '75.000₫ off',
    description: '75.000₫ off orders over 250.000₫',
    type: 'fixed',
    value: 75_000,
    minSpend: 250_000,
    expiresAt: '2099-01-01T00:00:00.000Z',
    status: 'active',
  },
  {
    code: 'BIGSPEND',
    title: '150.000₫ off',
    description: '150.000₫ off orders over 1.000.000₫',
    type: 'fixed',
    value: 150_000,
    minSpend: 1_000_000,
    expiresAt: '2099-01-01T00:00:00.000Z',
    status: 'active',
  },
  {
    code: 'USED5OFF',
    title: '250.000₫ off (used)',
    description: 'Already redeemed — must never apply again',
    type: 'fixed',
    value: 250_000,
    expiresAt: '2099-01-01T00:00:00.000Z',
    status: 'used',
  },
  {
    code: 'EXPIRED50',
    title: '90% off (expired)',
    description: 'Expired last cycle — excluded by status',
    type: 'percent',
    value: 90,
    expiresAt: '2020-01-01T00:00:00.000Z',
    status: 'expired',
  },
  {
    code: 'STALE-ACTIVE60',
    title: '300.000₫ off (stale)',
    description:
      'Still flagged active — the backend has not swept it past expiry yet. Excluded by the expiresAt check, not status.',
    type: 'fixed',
    value: 300_000,
    expiresAt: '2020-01-01T00:00:00.000Z',
    status: 'active',
  },
  {
    code: 'FREESHIP',
    title: 'Free shipping',
    description: 'No minimum. Worth 0₫ until shipping is quoted (Task 8).',
    type: 'shipping',
    value: 30_000,
    expiresAt: '2099-01-01T00:00:00.000Z',
    status: 'active',
  },
  {
    code: 'MEMBER20',
    title: '100.000₫ off for members',
    description: '100.000₫ off orders over 250.000₫ — signed-in shoppers only',
    type: 'fixed',
    value: 100_000,
    minSpend: 250_000,
    expiresAt: '2099-01-01T00:00:00.000Z',
    status: 'active',
    memberOnly: true,
  },
];
