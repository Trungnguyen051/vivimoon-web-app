import { z } from 'zod';

// ADR-0025: QR transfer, cash on delivery, and one e-wallet row. SePay left the picker.
export const paymentMethodTypeSchema = z.enum(['qr', 'cod', 'ewallet']);

/** The methods that pay through an intent; COD is settled at the door and has none. */
export const intentMethodSchema = paymentMethodTypeSchema.exclude(['cod']);

/**
 * No real payment is processed in M2 (spec §11) — every intent the mock
 * creates just sits `pending` for the UI to render against.
 */
export const paymentStatusSchema = z.enum(['pending']);

export const paymentIntentRequestSchema = z.object({
  method: intentMethodSchema,
});

/**
 * The checkout UI branches on which of `qrCode`/`redirectUrl` is present,
 * never on `method` (spec §11) — that is what makes a fourth provider a
 * config entry in lib/payments/methods.ts, not a new UI branch. Exactly one
 * of the two must be set: neither leaves the UI nothing to branch on, and
 * both make the branch ambiguous.
 */
export const paymentIntentSchema = z
  .object({
    id: z.string(),
    method: intentMethodSchema,
    status: paymentStatusSchema,
    qrCode: z.string().optional(),
    redirectUrl: z.string().optional(),
  })
  .superRefine((v, ctx) => {
    if (Boolean(v.qrCode) === Boolean(v.redirectUrl)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'exactly one of qrCode or redirectUrl must be set',
      });
    }
  });

export type PaymentMethodType = z.infer<typeof paymentMethodTypeSchema>;
export type IntentMethod = z.infer<typeof intentMethodSchema>;
export type PaymentIntentRequest = z.infer<typeof paymentIntentRequestSchema>;
export type PaymentIntent = z.infer<typeof paymentIntentSchema>;
