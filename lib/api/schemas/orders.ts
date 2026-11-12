import { z } from 'zod';
import { ORDER_STATUSES } from '@/lib/orders/statuses';
import { priceLineInputSchema, pricedLineSchema, pricedCartSchema } from './cart';
import { currencySchema } from './catalog';
import { rxSchema } from './rx';
import { addressSchema } from './checkout';
import { paymentMethodTypeSchema, paymentStatusSchema } from './payments';

export const orderStatusSchema = z.enum(ORDER_STATUSES);

export const placeOrderRequestSchema = z.object({
  lines: z.array(priceLineInputSchema).min(1),
  address: addressSchema,
  // The order confirmation is emailed; required regardless of
  // session so a member's order carries it too.
  email: z.string().email(),
  paymentMethod: paymentMethodTypeSchema,
});

/** `CartLine` + resolved Rx (spec §6) — price fields are the server's, never the client's. */
export const orderLineSchema = pricedLineSchema.extend({
  rx: rxSchema.optional(),
  // The variant's compare-at price as it stood when the order was placed —
  // only when it was above what was charged — so a past order never quotes
  // today's catalogue.
  compareAtUnitPrice: z.number().int().nonnegative().optional(),
});

export const orderSchema = z.object({
  id: z.string(),
  // Random, not sequential — spec §10 designs against order-code enumeration.
  code: z.string(),
  status: orderStatusSchema,
  placedAt: z.string(),
  lines: z.array(orderLineSchema),
  // A placed order has no unavailable lines — placement refuses while any
  // exist (ADR-0012) — so the field is dropped rather than carried as an
  // always-empty array, and `currency` is narrowed back to required: an
  // order that priced nothing cannot exist.
  totals: pricedCartSchema
    .omit({ lines: true, unavailableLines: true })
    .extend({ currency: currencySchema }),
  address: addressSchema,
  payment: z.object({ method: paymentMethodTypeSchema, status: paymentStatusSchema }),
  // Exactly one of the two: a logged-in shopper's order attaches their user id,
  // a guest's carries the email its order confirmation goes to.
  userId: z.string().optional(),
  guestEmail: z.string().email().optional(),
});

export type PlaceOrderRequest = z.infer<typeof placeOrderRequestSchema>;
export type OrderLine = z.infer<typeof orderLineSchema>;
export type Order = z.infer<typeof orderSchema>;

/**
 * Order Lookup input (ADR-0022): trimmed, one leading `#` dropped (the page's
 * placeholder shows codes as `#VVM-…`), uppercased. Empty means no code.
 */
export function normalizeOrderCode(raw: string): string {
  return raw.trim().replace(/^#/, '').trim().toUpperCase();
}
