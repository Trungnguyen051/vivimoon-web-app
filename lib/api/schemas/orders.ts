import { z } from 'zod';
import { ORDER_STATUSES } from '@/lib/orders/statuses';
import { giftLineSchema, priceCartRequestSchema, priceLineInputSchema, pricedLineSchema, pricedCartSchema } from './cart';
import { currencySchema } from './catalog';
import { lineRxSchema, purchaseUnitSchema } from './rx';
import { addressSchema } from './checkout';
import { paymentIntentSchema, paymentMethodTypeSchema, paymentStatusSchema } from './payments';

export const orderStatusSchema = z.enum(ORDER_STATUSES);

/** Where the order confirmation goes (ADR-0025). Stored only; nothing is sent in the mock. */
export const notificationChannelSchema = z.enum(['zalo', 'sms', 'email']);

export const placeOrderRequestSchema = z
  .object({
    lines: z.array(priceLineInputSchema).min(1),
    address: addressSchema,
    // Optional since ADR-0025: the confirmation goes through `notificationChannel`.
    email: z.string().email().optional(),
    notificationChannel: notificationChannelSchema,
    note: z.string().trim().max(500).optional(),
    paymentMethod: paymentMethodTypeSchema,
    // The Voucher picked in the cart, priced exactly as the preview was; a refused one falls back to the best.
    voucherCode: priceCartRequestSchema.shape.voucherCode,
    usePoints: priceCartRequestSchema.shape.usePoints,
  })
  .refine((v) => v.notificationChannel !== 'email' || v.email, {
    message: 'The email channel needs an email address',
    path: ['email'],
  });

/** `CartLine` + resolved Rx (spec §6) — price fields are the server's, never the client's. */
export const orderLineSchema = pricedLineSchema.extend({
  // Absent on older orders: a lens line without one was a pair (ADR-0023).
  purchaseUnit: purchaseUnitSchema.optional(),
  rx: lineRxSchema.optional(),
  // An accessory's variant option at placement, e.g. '120ml'.
  variantLabel: z.string().optional(),
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
    .omit({ lines: true, unavailableLines: true, shippingMethod: true, shippingEtaDays: true, pointsBalance: true, pointsUsable: true })
    .extend({ currency: currencySchema }),
  // What the order gets at 0₫ (CONTEXT.md "Gift"), as pricing reported it at placement.
  gifts: z.array(giftLineSchema).optional(),
  address: addressSchema,
  // Id of the shipping option charged at placement (localized for display);
  // optional so upstream and older orders without one stay valid ("—").
  shippingMethod: z.string().optional(),
  // The carrier's own waybill number — set once the order ships.
  carrierTrackingCode: z.string().optional(),
  // COD has no intent; QR carries the QR one, e-wallet the redirect one (ADR-0025).
  payment: z.object({ method: paymentMethodTypeSchema, status: paymentStatusSchema, intent: paymentIntentSchema.optional() }),
  // Optional so orders placed before ADR-0025 stay valid.
  notificationChannel: notificationChannelSchema.optional(),
  note: z.string().optional(),
  // A logged-in shopper's order attaches their user id; a guest's carries the
  // email they gave, if any (optional since ADR-0025).
  userId: z.string().optional(),
  guestEmail: z.string().email().optional(),
});

/**
 * What Order Lookup returns to anyone holding the Order Code (ADR-0022): the
 * order minus who owns it and how it was paid — nothing the page shows.
 */
export const publicOrderSchema = orderSchema.omit({ userId: true, guestEmail: true, payment: true });
export type PublicOrder = z.infer<typeof publicOrderSchema>;

export type NotificationChannel = z.infer<typeof notificationChannelSchema>;
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
