import { orders } from '@/lib/api/resources/orders';
import { apiOk, apiFail } from '@/lib/api/response';

/** Public — a tracking token is itself the credential, matching the emailed link it came from. */
export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const order = await orders.resolveTrackingToken(token);
  if (!order) return apiFail('not_found', 'That tracking link is invalid or has expired');
  return apiOk(order);
}
