import { pricing, PricingError } from '@/lib/api/resources/pricing';
import { priceCartRequestSchema } from '@/lib/api/schemas/cart';
import { apiOk, apiFail } from '@/lib/api/response';
import { parseBody } from '@/lib/api/route-helpers';

export async function POST(request: Request) {
  const parsed = await parseBody(request, priceCartRequestSchema);
  if (!parsed.ok) return parsed.response;

  try {
    return apiOk(await pricing.priceCart(parsed.data));
  } catch (error) {
    if (error instanceof PricingError) return apiFail(error.code, error.message);
    throw error;
  }
}
