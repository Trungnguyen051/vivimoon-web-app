import { z } from 'zod';
import { orders, OrderError } from '@/lib/api/resources/orders';
import { normalizeOrderCode, paymentActionSchema, paymentOrderSchema } from '@/lib/api/schemas/orders';
import { apiOk, apiFail } from '@/lib/api/response';
import { parseBody } from '@/lib/api/route-helpers';

/**
 * The QR transfer page's order (#205), by Order Code alone like Order Lookup
 * (ADR-0022): a guest has no session, and the code is the credential.
 */
export async function GET(request: Request) {
  const code = new URL(request.url).searchParams.get('code') ?? '';
  if (!normalizeOrderCode(code)) return apiFail('validation_failed', 'code is required', { field: 'code' });

  const order = await orders.findByCode(code);
  if (!order) return apiFail('not_found', 'No order matches that code');
  return apiOk(paymentOrderSchema.parse(order));
}

const actionRequestSchema = z.object({ code: z.string().min(1), action: paymentActionSchema });

/** "Tôi đã chuyển khoản", "Đổi sang COD" or a new QR. */
export async function POST(request: Request) {
  const parsed = await parseBody(request, actionRequestSchema);
  if (!parsed.ok) return parsed.response;

  try {
    const order = await orders.updatePayment(parsed.data.code, parsed.data.action);
    if (!order) return apiFail('not_found', 'No order matches that code');
    return apiOk(paymentOrderSchema.parse(order));
  } catch (error) {
    if (error instanceof OrderError) return apiFail(error.code, error.message);
    throw error;
  }
}
