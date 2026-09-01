import { shipping, ShippingError } from '@/lib/api/resources/shipping';
import { shippingQuoteRequestSchema } from '@/lib/api/schemas/checkout';
import { apiOk, apiFail } from '@/lib/api/response';
import { parseBody } from '@/lib/api/route-helpers';

export async function POST(request: Request) {
  const parsed = await parseBody(request, shippingQuoteRequestSchema);
  if (!parsed.ok) return parsed.response;

  try {
    const options = await shipping.quote({
      province: parsed.data.address.province,
      district: parsed.data.address.district,
    });
    return apiOk(options);
  } catch (error) {
    if (error instanceof ShippingError) return apiFail(error.code, error.message);
    throw error;
  }
}
