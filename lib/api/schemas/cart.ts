import { z } from 'zod';
import { currencySchema } from './catalog';
import { rxSchema } from './rx';

/**
 * A line in the shopper's cart.
 *
 * `lineKey` is the line's identity, derived from `variantId` + `rx` (spec §7)
 * by lib/cart/line-key.ts. The same variant at two different powers is two
 * lines, so `variantId` alone is NOT the identity.
 *
 * `unitPrice` is a display snapshot only. Money is server-owned: totals come
 * from POST /api/cart/price, and nothing on the client multiplies this field.
 */
export const cartLineSchema = z.object({
  lineKey: z.string().min(1),
  productId: z.string(),
  variantId: z.string(),
  name: z.string(),
  sku: z.string(),
  color: z.string().optional(),
  packSize: z.string(),
  unitPrice: z.number().int().nonnegative(),
  currency: currencySchema,
  quantity: z.number().int().positive(),
  image: z.string().optional(),
  rx: rxSchema.optional(),
});

export const cartStateSchema = z.object({
  lines: z.array(cartLineSchema),
});

export type CartLine = z.infer<typeof cartLineSchema>;
export type CartState = z.infer<typeof cartStateSchema>;
