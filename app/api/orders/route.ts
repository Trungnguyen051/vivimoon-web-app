import { orders, OrderError } from '@/lib/api/resources/orders';
import { loyalty } from '@/lib/api/resources/loyalty';
import { PricingError } from '@/lib/api/resources/pricing';
import { placeOrderRequestSchema, type Order } from '@/lib/api/schemas/orders';
import { apiOk, apiFail } from '@/lib/api/response';
import { parseBody } from '@/lib/api/route-helpers';
import { readSessionUserId } from '@/lib/auth/cookie';

export async function GET() {
  const userId = await readSessionUserId();
  if (!userId) return apiFail('unauthorized', 'Sign in to view your orders');
  return apiOk(await orders.list(userId));
}

export async function POST(request: Request) {
  const parsed = await parseBody(request, placeOrderRequestSchema);
  if (!parsed.ok) return parsed.response;

  // Presence, not a requirement — guest checkout must work (spec §7). A
  // signed-in shopper's order attaches userId; a signed-out one carries
  // guestEmail instead (lib/api/resources/orders/mock.ts).
  const userId = await readSessionUserId();

  let order: Order;
  try {
    order = await orders.place(parsed.data, userId);
  } catch (error) {
    if (error instanceof OrderError || error instanceof PricingError) {
      return apiFail(error.code, error.message);
    }
    throw error;
  }

  // Awarded here, not inside orders.place() — a guest has no loyalty
  // account to award to, and M2's placement tests must stay unaffected by a
  // side effect they were never written to expect (issue #10). Isolated in
  // its own try/catch, outside the block above: the order already committed
  // to the store by this point, so a loyalty failure must not turn an
  // already-successful placement into a 500 the shopper might retry into a
  // duplicate order.
  if (userId) {
    try {
      await loyalty.award(userId, order);
    } catch {
      // Best-effort — the order stands regardless.
    }
  }

  return apiOk(order);
}
