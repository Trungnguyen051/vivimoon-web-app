import { loyaltyHistory as seedHistory } from '@/content/mock';
import type { LoyaltyBalance, LoyaltyEntry } from '@/lib/api/schemas/loyalty';
import type { Order } from '@/lib/api/schemas/orders';
import { normalizePhone } from '@/lib/api/schemas/auth';
import { pointsEarnedFor } from '@/lib/loyalty/rules';

// In-memory state, keyed by userId. Resets on every server restart — same
// mutable-mock-state precedent as lib/api/resources/orders/mock.ts.
let store: Record<string, LoyaltyEntry[]> = structuredClone(seedHistory);
// Held Points (ADR-0024), keyed by normalised phone.
let held = new Map<string, LoyaltyEntry[]>();

/** Test helper — restores the fixture state between cases. */
export function resetMockLoyaltyState(): void {
  store = structuredClone(seedHistory);
  held = new Map();
}

function historyFor(userId: string): LoyaltyEntry[] {
  return (store[userId] ??= []);
}

function randomEntryId(): string {
  return `loy-${Math.random().toString(36).slice(2, 10)}`;
}

function entry(points: number, order: Order): LoyaltyEntry {
  return { id: randomEntryId(), points, description: `Order ${order.code}`, orderId: order.id, createdAt: new Date().toISOString() };
}

/** Pricing's figure; an order placed before #204 has none, so it is earned by today's rule. */
const earnedBy = (order: Order) => order.totals.pointsToEarn ?? pointsEarnedFor(order.totals.total);

// Spaces, dots and dashes are how people type a number; they don't make it a different one.
const phoneKey = (phone: string) => normalizePhone(phone.replace(/[\s.-]/g, ''));

export const mockLoyalty = {
  async get(userId: string): Promise<LoyaltyBalance> {
    const history = [...historyFor(userId)].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const balance = history.reduce((sum, e) => sum + e.points, 0);
    return { balance, history };
  },

  /**
   * Called by the orders route handler after `orders.place()` succeeds
   * (issue #10) — never from inside `place()` itself, so placement tests
   * exercise pricing/shipping/order-shape without this side effect. Debits
   * the points the order spent and credits the points it earned, as two
   * history entries (CONTEXT.md "Loyalty").
   */
  async award(userId: string, order: Order): Promise<LoyaltyEntry[]> {
    // shortcut: pricing checked the balance before placement, so two orders placed at once can overspend it; enforce in the real ledger.
    const entries = [-(order.totals.pointsUsed ?? 0), earnedBy(order)].filter((p) => p !== 0).map((p) => entry(p, order));
    historyFor(userId).push(...entries);
    return entries;
  },

  /** A guest order's points, held against its phone until an account verifies it (ADR-0024). */
  async hold(phone: string, order: Order): Promise<void> {
    const points = earnedBy(order);
    if (points === 0) return;
    const key = phoneKey(phone);
    held.set(key, [...(held.get(key) ?? []), entry(points, order)]);
  },

  /** Credits every Held Point for a phone the account just verified, then clears them, so they pay out once. */
  async claimHeld(phone: string, userId: string): Promise<number> {
    const key = phoneKey(phone);
    const entries = held.get(key) ?? [];
    held.delete(key);
    historyFor(userId).push(...entries);
    return entries.reduce((sum, e) => sum + e.points, 0);
  },
};

export type Loyalty = typeof mockLoyalty;
