import { catalog } from '@/lib/api/resources/catalog';
import type { LineReview } from '@/lib/api/schemas/catalog';
import type { Order, OrderLine } from '@/lib/api/schemas/orders';

/**
 * A line's Review as its writer sees it, or null when the line can't be reviewed: the order isn't
 * delivered and paid, or the line isn't a lens. Ownership is the caller's check; Gifts aren't lines.
 */
export async function lineReview(order: Order, line: OrderLine): Promise<LineReview | null> {
  if (order.status !== 'delivered' || order.payment.status !== 'paid') return null;
  const found = await catalog.getVariantById(line.variantId);
  if (!found || found.product.kind === 'accessory') return null;
  const review = await catalog.getLineReview(order.id, line.lineKey);
  const productSlug = found.product.slug;
  return review ? { status: review.status, reviewId: review.id, reason: review.reason, productSlug } : { status: 'none', productSlug };
}
