import { orders, OrderError } from '@/lib/api/resources/orders';
import { apiOk, apiFail } from '@/lib/api/response';
import { readSessionUserId } from '@/lib/auth/cookie';

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await readSessionUserId();
  if (!userId) return apiFail('unauthorized', 'Sign in to cancel this order');

  const { id } = await params;
  const order = await orders.get(id);
  if (!order || order.userId !== userId) return apiFail('not_found', 'Order not found');

  try {
    return apiOk(await orders.cancel(id));
  } catch (error) {
    if (error instanceof OrderError) return apiFail(error.code, error.message);
    throw error;
  }
}
