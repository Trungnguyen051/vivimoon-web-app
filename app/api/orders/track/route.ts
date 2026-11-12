import { orders } from '@/lib/api/resources/orders';
import { normalizeOrderCode, publicOrderSchema } from '@/lib/api/schemas/orders';
import { apiOk, apiFail } from '@/lib/api/response';

/**
 * Order Lookup — public, by Order Code alone (ADR-0022, superseding the
 * emailed-link flow of ADR-0006). The code is the credential, which is why
 * codes must stay random.
 */
export async function GET(request: Request) {
  const code = new URL(request.url).searchParams.get('code') ?? '';
  if (!normalizeOrderCode(code)) return apiFail('validation_failed', 'code is required', { field: 'code' });

  const order = await orders.findByCode(code);
  if (!order) return apiFail('not_found', 'No order matches that code');
  // Projected: the code is a bearer secret, so it reveals no owner, email or payment.
  return apiOk(publicOrderSchema.parse(order));
}
