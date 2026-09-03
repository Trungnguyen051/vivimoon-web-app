import { orders } from '@/lib/api/resources/orders';
import { apiOk, apiFail } from '@/lib/api/response';
import { readSessionUserId } from '@/lib/auth/cookie';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await readSessionUserId();
  if (!userId) return apiFail('unauthorized', 'Sign in to view this order');

  const { id } = await params;
  const order = await orders.get(id);
  // Identical 404 for "doesn't exist" and "exists but isn't yours" — an
  // order id must not become an oracle for what other shoppers have bought.
  if (!order || order.userId !== userId) return apiFail('not_found', 'Order not found');

  return apiOk(order);
}
