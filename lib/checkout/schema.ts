import { z } from 'zod';
import { isPhone } from '@/lib/api/schemas/auth';
import { addressLabelSchema } from '@/lib/api/schemas/checkout';
import { notificationChannelSchema } from '@/lib/api/schemas/orders';

/**
 * Vietnamese addressing — province → district → ward, not `city` (spec §6).
 * District-level granularity is also what makes the shipping quote meaningful.
 * Email is optional (ADR-0025): the confirmation goes through the chosen
 * notification channel, which needs an email only when it *is* email.
 */
export const checkoutSchema = z
  .object({
    recipient: z.string().min(1),
    // An empty input is "no email", not an invalid one.
    email: z.union([z.literal(''), z.string().email()]).optional(),
    phone: z.string().refine(isPhone, 'Enter a valid Vietnamese phone number'),
    line1: z.string().min(1),
    ward: z.string().min(1),
    district: z.string().min(1),
    province: z.string().min(1),
    label: addressLabelSchema.default('home'),
    note: z.string().max(500).optional(),
    notificationChannel: notificationChannelSchema.default('zalo'),
  })
  .refine((v) => v.notificationChannel !== 'email' || v.email, {
    message: 'The email channel needs an email address',
    path: ['email'],
  });

/** Form field values before zod applies the defaults — what `useForm` manages. */
export type CheckoutFormInput = z.input<typeof checkoutSchema>;
/** Parsed submission shape — what the resolver actually hands `onSubmit`. */
export type CheckoutForm = z.infer<typeof checkoutSchema>;
