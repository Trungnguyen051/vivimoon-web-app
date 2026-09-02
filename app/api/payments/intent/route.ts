import { payments, PaymentError } from '@/lib/api/resources/payments';
import { paymentIntentRequestSchema } from '@/lib/api/schemas/payments';
import { apiOk, apiFail } from '@/lib/api/response';
import { parseBody } from '@/lib/api/route-helpers';

export async function POST(request: Request) {
  const parsed = await parseBody(request, paymentIntentRequestSchema);
  if (!parsed.ok) return parsed.response;

  try {
    return apiOk(await payments.createIntent(parsed.data));
  } catch (error) {
    if (error instanceof PaymentError) return apiFail(error.code, error.message);
    throw error;
  }
}
