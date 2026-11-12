import { catalog } from '@/lib/api/resources/catalog';
import type { OrderLine } from '@/lib/api/schemas/orders';
import type { HistoryLine } from './order-history-card';

/** Catalogue facts per order line, looked up server-side; money stays the order's own, `product` is null once the variant is gone (ADR-0012). */
export async function withProducts(lines: OrderLine[]): Promise<HistoryLine[]> {
  return Promise.all(
    lines.map(async (line) => {
      const found = await catalog.getVariantById(line.variantId);
      return {
        ...line,
        product: found && {
          id: found.product.id, slug: found.product.slug, name: found.product.name, image: found.product.images[0],
          sku: found.variant.sku, color: found.variant.colorLabel, compareAtPrice: found.variant.compareAtPrice, price: found.variant.price,
        },
      };
    }),
  );
}
