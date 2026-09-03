import type { LoyaltyEntry } from '@/lib/api/schemas/loyalty';

/**
 * Seeded loyalty history (M3.6, issue #10), keyed by userId — points equal
 * the totals of the matching seed orders in content/mock/orders.ts, so the
 * demo balance is consistent with a shopper's actual order history.
 */
export const loyaltyHistory: Record<string, LoyaltyEntry[]> = {
  'u-001': [
    { id: 'loy-seed-1', points: 28, description: 'Order VVM-SEED0001', orderId: 'order-seed-1', createdAt: '2026-08-20T03:15:00.000Z' },
    { id: 'loy-seed-2', points: 47, description: 'Order VVM-SEED0002', orderId: 'order-seed-2', createdAt: '2026-08-15T07:40:00.000Z' },
  ],
  'u-002': [
    { id: 'loy-seed-3', points: 53, description: 'Order VVM-SEED0006', orderId: 'order-seed-6', createdAt: '2026-08-18T05:20:00.000Z' },
  ],
};
