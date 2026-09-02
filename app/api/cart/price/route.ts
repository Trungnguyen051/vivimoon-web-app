import { pricing, PricingError } from '@/lib/api/resources/pricing';
import { priceCartRequestSchema } from '@/lib/api/schemas/cart';
import { apiOk, apiFail } from '@/lib/api/response';
import { parseBody } from '@/lib/api/route-helpers';
import { readSessionUserId } from '@/lib/auth/cookie';

export async function POST(request: Request) {
  const parsed = await parseBody(request, priceCartRequestSchema);
  if (!parsed.ok) return parsed.response;

  // Presence, not a requirement — guest pricing must still work (spec §7).
  // A signed-in shopper's session unlocks `memberOnly` vouchers (spec §9).
  const userId = await readSessionUserId();

  try {
    return apiOk(await pricing.priceCart(parsed.data, userId));
  } catch (error) {
    if (error instanceof PricingError) return apiFail(error.code, error.message);
    throw error;
  }
}
