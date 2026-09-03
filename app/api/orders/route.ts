import { orders, OrderError } from '@/lib/api/resources/orders';
import { PricingError } from '@/lib/api/resources/pricing';
import { placeOrderRequestSchema } from '@/lib/api/schemas/orders';
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

  try {
    return apiOk(await orders.place(parsed.data, userId));
  } catch (error) {
    if (error instanceof OrderError || error instanceof PricingError) {
      return apiFail(error.code, error.message);
    }
    throw error;
  }
}
