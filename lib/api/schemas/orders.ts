import { z } from 'zod';
import { ORDER_STATUSES } from '@/lib/orders/statuses';
import { priceLineInputSchema, pricedLineSchema, pricedCartSchema } from './cart';
import { rxSchema } from './rx';
import { addressSchema } from './checkout';
import { paymentMethodTypeSchema, paymentStatusSchema } from './payments';

export const orderStatusSchema = z.enum(ORDER_STATUSES);

export const placeOrderRequestSchema = z.object({
  lines: z.array(priceLineInputSchema).min(1),
  address: addressSchema,
  // Guest order-tracking link is emailed (spec §10); required regardless of
  // session so a member's order carries it too without a second lookup.
  email: z.string().email(),
  paymentMethod: paymentMethodTypeSchema,
});

/** `CartLine` + resolved Rx (spec §6) — price fields are the server's, never the client's. */
export const orderLineSchema = pricedLineSchema.extend({
  rx: rxSchema.optional(),
});

export const orderSchema = z.object({
  id: z.string(),
  // Random, not sequential — spec §10 designs against order-code enumeration.
  code: z.string(),
  status: orderStatusSchema,
  placedAt: z.string(),
  lines: z.array(orderLineSchema),
  totals: pricedCartSchema.omit({ lines: true }),
  address: addressSchema,
  payment: z.object({ method: paymentMethodTypeSchema, status: paymentStatusSchema }),
  // Exactly one of the two: a logged-in shopper's order attaches their user id,
  // a guest's carries the email their tracking link goes to.
  userId: z.string().optional(),
  guestEmail: z.string().email().optional(),
});

export type PlaceOrderRequest = z.infer<typeof placeOrderRequestSchema>;
export type OrderLine = z.infer<typeof orderLineSchema>;
export type Order = z.infer<typeof orderSchema>;
