import { loyaltyHistory as seedHistory } from '@/content/mock';
import type { LoyaltyBalance, LoyaltyEntry } from '@/lib/api/schemas/loyalty';
import type { Order } from '@/lib/api/schemas/orders';

// In-memory state, keyed by userId. Resets on every server restart — same
// mutable-mock-state precedent as lib/api/resources/orders/mock.ts.
let store: Record<string, LoyaltyEntry[]> = structuredClone(seedHistory);

/** Test helper — restores the fixture state between cases. */
export function resetMockLoyaltyState(): void {
  store = structuredClone(seedHistory);
}

function historyFor(userId: string): LoyaltyEntry[] {
  return (store[userId] ??= []);
}

function randomEntryId(): string {
  return `loy-${Math.random().toString(36).slice(2, 10)}`;
}

export const mockLoyalty = {
  async get(userId: string): Promise<LoyaltyBalance> {
    const history = [...historyFor(userId)].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const balance = history.reduce((sum, e) => sum + e.points, 0);
    return { balance, history };
  },

  /**
   * Called by the orders route handler after `orders.place()` succeeds
   * (issue #10) — never from inside `place()` itself, so M2's order
   * placement tests exercise pricing/shipping/order-shape without this
   * side effect. One point per whole currency unit spent — PROVISIONAL,
   * pending Vivimoon's real earn-rate rules (same posture as
   * lib/orders/statuses.ts's carrier statuses).
   */
  async award(userId: string, order: Order): Promise<LoyaltyEntry> {
    const entry: LoyaltyEntry = {
      id: randomEntryId(),
      points: order.totals.total,
      description: `Order ${order.code}`,
      orderId: order.id,
      createdAt: new Date().toISOString(),
    };
    historyFor(userId).push(entry);
    return entry;
  },
};

export type Loyalty = typeof mockLoyalty;
