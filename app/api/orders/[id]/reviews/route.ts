import { orders } from '@/lib/api/resources/orders';
import { catalog } from '@/lib/api/resources/catalog';
import { account } from '@/lib/api/resources/account';
import { REVIEW_MEDIA_LIMITS, reviewCreateSchema } from '@/lib/api/schemas/catalog';
import { apiOk, apiFail } from '@/lib/api/response';
import { parseBody } from '@/lib/api/route-helpers';
import { readSessionUserId } from '@/lib/auth/cookie';
import { lineReview } from '@/lib/orders/line-review';
import { shortName } from '@/lib/products/reviews';

/** A member writes a Review of one line of their own delivered, paid order. It waits in Review Moderation. */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await readSessionUserId();
  if (!userId) return apiFail('unauthorized', 'Sign in to write a review');

  const parsed = await parseBody(request, reviewCreateSchema);
  if (!parsed.ok) return parsed.response;
  const { lineKey, media: mediaIds, ...fields } = parsed.data;

  const { id } = await params;
  const order = await orders.get(id);
  // Same 404 as the order detail: an order id is no oracle for someone else's purchases.
  const line = order?.userId === userId ? order.lines.find((l) => l.lineKey === lineKey) : undefined;
  if (!order || !line) return apiFail('not_found', 'Order line not found');

  const state = await lineReview(order, line);
  if (!state) return apiFail('conflict', 'Only a delivered, paid lens can be reviewed');
  if (state.status === 'pending' || state.status === 'approved') return apiFail('conflict', 'This line already has a review');

  // Each reference must be a file this member uploaded, and together within a Review's limits.
  const stored = await Promise.all(mediaIds.map((m) => catalog.getReviewMedia(m)));
  if (stored.some((m) => m?.userId !== userId)) return apiFail('validation_failed', 'Unknown media', { field: 'media' });
  const media = stored.map((m, i) => ({ type: m!.type, url: `/api/reviews/media/${mediaIds[i]}` }));
  for (const type of ['image', 'video'] as const) {
    if (media.filter((m) => m.type === type).length > REVIEW_MEDIA_LIMITS[type].maxCount) {
      return apiFail('validation_failed', 'Up to 5 photos and 1 video', { field: 'media' });
    }
  }

  const found = (await catalog.getVariantById(line.variantId))!;
  const { name } = await account.get(userId);
  const review = await catalog.createReview({
    ...fields,
    productId: found.product.id,
    author: shortName(name),
    variantLabel: line.variantLabel ?? found.variant.label ?? found.variant.colorLabel,
    media,
    authorUserId: userId,
    orderId: order.id,
    lineKey,
  });
  return apiOk({ id: review.id, status: review.status }, { status: 201 });
}
