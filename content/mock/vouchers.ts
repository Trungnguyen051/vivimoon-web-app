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
 * `BIGSPEND` (minSpend), and `FREESHIP` (a `shipping` voucher, which never
 * has a positive discount while `shipping` is `0`, pre-Task 8).
 */
export const vouchers: Voucher[] = [
  {
    code: 'SUMMER10',
    title: '10% off',
    description: '10% off orders over $50',
    type: 'percent',
    value: 10,
    minSpend: 50,
    expiresAt: '2099-01-01T00:00:00.000Z',
    status: 'active',
  },
  {
    code: 'SAVE15',
    title: '$15 off',
    description: '$15 off orders over $50',
    type: 'fixed',
    value: 15,
    minSpend: 50,
    expiresAt: '2099-01-01T00:00:00.000Z',
    status: 'active',
  },
  {
    code: 'BIGSPEND',
    title: '$30 off',
    description: '$30 off orders over $200',
    type: 'fixed',
    value: 30,
    minSpend: 200,
    expiresAt: '2099-01-01T00:00:00.000Z',
    status: 'active',
  },
  {
    code: 'USED5OFF',
    title: '$50 off (used)',
    description: 'Already redeemed — must never apply again',
    type: 'fixed',
    value: 50,
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
    title: '$60 off (stale)',
    description:
      'Still flagged active — the backend has not swept it past expiry yet. Excluded by the expiresAt check, not status.',
    type: 'fixed',
    value: 60,
    expiresAt: '2020-01-01T00:00:00.000Z',
    status: 'active',
  },
  {
    code: 'FREESHIP',
    title: 'Free shipping',
    description: 'No minimum. Worth $0 until shipping is quoted (Task 8).',
    type: 'shipping',
    value: 5,
    expiresAt: '2099-01-01T00:00:00.000Z',
    status: 'active',
  },
];
