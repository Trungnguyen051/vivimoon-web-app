import { catalog } from '@/lib/api/resources/catalog';
import type { CatalogItem, LineReview, Variant } from '@/lib/api/schemas/catalog';
import type { Order, OrderLine } from '@/lib/api/schemas/orders';

/** A reviewable line: its Review as its writer sees it, and the lens and variant it is, so callers needn't look them up again. */
export type ReviewableLine = { review: LineReview; product: CatalogItem; variant: Variant };

/**
 * A line's Review state, or null when the line can't be reviewed: the order isn't delivered and paid,
 * or the line isn't a lens. Ownership is the caller's check; Gifts aren't lines.
 */
export async function lineReview(order: Order, line: OrderLine): Promise<ReviewableLine | null> {
  if (order.status !== 'delivered' || order.payment.status !== 'paid') return null;
  const found = await catalog.getVariantById(line.variantId);
  if (!found || found.product.kind === 'accessory') return null;
  const stored = await catalog.getLineReview(order.id, line.lineKey);
  const productSlug = found.product.slug;
  const review: LineReview = stored
    ? { status: stored.status, reviewId: stored.id, reason: stored.reason, productSlug }
    : { status: 'none', productSlug };
  return { review, ...found };
}

/** One live Review per line: a pending or approved one blocks another; a rejected or deleted one doesn't. */
export function hasLiveReview(review: LineReview): boolean {
  return review.status === 'pending' || review.status === 'approved';
}
