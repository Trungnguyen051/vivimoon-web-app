import { catalog } from '@/lib/api/resources/catalog';
import { orders } from '@/lib/api/resources/orders';
import { apiOk, apiFail } from '@/lib/api/response';
import { readSessionUserId } from '@/lib/auth/cookie';
import { hasLiveReview, reviewableLine } from '@/lib/orders/line-review';
import type { EligibleLine } from '@/lib/api/schemas/catalog';

/**
 * The member's delivered, paid order lines of this product with no live Review, newest order first.
 * Drives "Viết đánh giá" on the product page: none, one (straight to the form) or several (a picker).
 */
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const userId = await readSessionUserId();
  if (!userId) return apiFail('unauthorized', 'Sign in to write a review');

  const { slug } = await params;
  if (!(await catalog.getProductBySlug(slug))) return apiFail('not_found', `No product with slug "${slug}"`);

  const eligible: EligibleLine[] = [];
  for (const order of await orders.list(userId)) {
    for (const line of order.lines) {
      // The same rules the create route enforces, so the picker never offers a line it would refuse.
      const reviewable = await reviewableLine(order, line);
      if (reviewable?.product.slug !== slug || hasLiveReview(reviewable.review)) continue;
      const { variant } = reviewable;
      eligible.push({
        orderId: order.id, orderCode: order.code, placedAt: order.placedAt, lineKey: line.lineKey,
        variantLabel: line.variantLabel ?? variant.label ?? variant.colorLabel ?? '',
      });
    }
  }
  return apiOk(eligible);
}
