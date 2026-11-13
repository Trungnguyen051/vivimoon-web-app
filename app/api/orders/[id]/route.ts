import { orders } from '@/lib/api/resources/orders';
import { apiOk, apiFail } from '@/lib/api/response';
import { readSessionUserId } from '@/lib/auth/cookie';
import { reviewableLine } from '@/lib/orders/line-review';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await readSessionUserId();
  if (!userId) return apiFail('unauthorized', 'Sign in to view this order');

  const { id } = await params;
  const order = await orders.get(id);
  // Identical 404 for "doesn't exist" and "exists but isn't yours" — an
  // order id must not become an oracle for what other shoppers have bought.
  if (!order || order.userId !== userId) return apiFail('not_found', 'Order not found');

  // Each line's Review state, for the order detail's "Viết đánh giá" and its moderation states.
  const lines = await Promise.all(order.lines.map(async (line) => {
    const reviewable = await reviewableLine(order, line);
    return reviewable ? { ...line, review: reviewable.review } : line;
  }));
  return apiOk({ ...order, lines });
}
