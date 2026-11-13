import { catalog } from '@/lib/api/resources/catalog';
import { orders } from '@/lib/api/resources/orders';
import { apiOk, apiFail } from '@/lib/api/response';
import { readSessionUserId } from '@/lib/auth/cookie';
import { lineReview } from '@/lib/orders/line-review';

/** One order line the member may review, as the product page's order picker shows it. */
export type EligibleLine = { orderId: string; orderCode: string; placedAt: string; lineKey: string; variantLabel: string };

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
      const state = await lineReview(order, line);
      if (state?.productSlug !== slug || state.status === 'pending' || state.status === 'approved') continue;
      const { variant } = (await catalog.getVariantById(line.variantId))!;
      eligible.push({
        orderId: order.id, orderCode: order.code, placedAt: order.placedAt, lineKey: line.lineKey,
        variantLabel: line.variantLabel ?? variant.label ?? variant.colorLabel ?? '',
      });
    }
  }
  return apiOk(eligible);
}
