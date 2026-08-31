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

// ---------------------------------------------------------------------------
// Pricing & vouchers (spec §6, §7) — POST /api/cart/price
// ---------------------------------------------------------------------------

export const voucherTypeSchema = z.enum(['percent', 'fixed', 'shipping']);
export const voucherStatusSchema = z.enum(['active', 'used', 'expired']);

/**
 * A promotional voucher (spec §6). In M2 the shopper never enters a code —
 * `POST /api/cart/price` auto-selects the best applicable one (see
 * lib/api/resources/pricing/mock.ts). `value` is whole units: percentage
 * points for `percent`, whole currency for `fixed`/`shipping`.
 */
export const voucherSchema = z
  .object({
    code: z.string().min(1),
    title: z.string(),
    description: z.string(),
    type: voucherTypeSchema,
    value: z.number().int().nonnegative(),
    minSpend: z.number().int().nonnegative().optional(),
    expiresAt: z.string(),
    status: voucherStatusSchema,
  })
  .superRefine((v, ctx) => {
    if (v.type === 'percent' && v.value > 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['value'],
        message: 'a percent voucher value cannot exceed 100',
      });
    }
  });

/**
 * One line of the pricing request body. Deliberately narrow: `variantId` +
 * `quantity` are all that determine money, and both are resolved
 * server-side against the catalogue — nothing here lets a client name its
 * own price. `lineKey` is an opaque passthrough so the response can be
 * matched back to the shopper's cart lines.
 */
export const priceLineInputSchema = z.object({
  lineKey: z.string().min(1),
  variantId: z.string().min(1),
  rx: rxSchema.optional(),
  quantity: z.number().int().positive(),
});

export const priceCartRequestSchema = z.object({
  lines: z.array(priceLineInputSchema).min(1),
});

export const pricedLineSchema = z.object({
  lineKey: z.string(),
  variantId: z.string(),
  quantity: z.number().int().positive(),
  unitPrice: z.number().int().nonnegative(),
  lineTotal: z.number().int().nonnegative(),
  currency: currencySchema,
});

/**
 * Response of POST /api/cart/price. `shipping` is always `0` until Task 8
 * quotes it against a real address — no address exists yet in M2. The field
 * is present and typed from day one regardless, so Task 7's cart summary
 * component is never written against a shape that changes under it later.
 */
export const pricedCartSchema = z.object({
  lines: z.array(pricedLineSchema),
  subtotal: z.number().int().nonnegative(),
  discount: z.number().int().nonnegative(),
  appliedVouchers: z.array(voucherSchema),
  shipping: z.number().int().nonnegative(),
  total: z.number().int().nonnegative(),
  currency: currencySchema,
});

export type VoucherType = z.infer<typeof voucherTypeSchema>;
export type VoucherStatus = z.infer<typeof voucherStatusSchema>;
export type Voucher = z.infer<typeof voucherSchema>;
export type PriceLineInput = z.infer<typeof priceLineInputSchema>;
export type PriceCartRequest = z.infer<typeof priceCartRequestSchema>;
export type PricedLine = z.infer<typeof pricedLineSchema>;
export type PricedCart = z.infer<typeof pricedCartSchema>;
