import { z } from 'zod';
import { pricedLineSchema } from './cart';

/**
 * Vietnamese addressing (spec §6) — province → district → ward, not `city`.
 * Mirrors `lib/checkout/schema.ts`'s form fields; this is the wire shape
 * consumed by `/api/shipping/quote` and folded into `/api/cart/price`.
 */
export const addressLabelSchema = z.enum(['home', 'office', 'other']);

export const addressSchema = z.object({
  recipient: z.string().min(1),
  phone: z.string().min(1),
  line1: z.string().min(1),
  ward: z.string().min(1),
  district: z.string().min(1),
  province: z.string().min(1),
  label: addressLabelSchema,
});

/** One selectable shipping option returned by a quote. */
export const shippingOptionSchema = z.object({
  id: z.string().min(1),
  label: z.string(),
  fee: z.number().int().nonnegative(),
  etaDays: z.number().int().positive(),
});

/**
 * POST /api/shipping/quote body. `lines` is carried alongside the address so
 * the interface matches a real weight/volume-aware carrier API later — the
 * mock quote only keys off `address.province`/`address.district` today.
 */
export const shippingQuoteRequestSchema = z.object({
  address: addressSchema,
  lines: z.array(pricedLineSchema).min(1),
});

export const shippingQuoteResponseSchema = z.array(shippingOptionSchema);

export type Address = z.infer<typeof addressSchema>;
export type ShippingOption = z.infer<typeof shippingOptionSchema>;
export type ShippingQuoteRequest = z.infer<typeof shippingQuoteRequestSchema>;
