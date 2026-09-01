import { z } from 'zod';
import { isPhone } from '@/lib/api/schemas/auth';
import { addressLabelSchema } from '@/lib/api/schemas/checkout';

/**
 * Vietnamese addressing — province → district → ward, not `city` (spec §6).
 * District-level granularity is also what makes the Task 8 shipping quote
 * meaningful. Saved addresses are M3; this form collects one for checkout
 * without persisting it to the account.
 */
export const checkoutSchema = z.object({
  recipient: z.string().min(1),
  // Guest checkout emails the order-tracking link (spec §10), so email stays
  // required even though saved-address contacts are M3.
  email: z.string().email(),
  phone: z.string().refine(isPhone, 'Enter a valid Vietnamese phone number'),
  line1: z.string().min(1),
  ward: z.string().min(1),
  district: z.string().min(1),
  province: z.string().min(1),
  label: addressLabelSchema.default('home'),
});

/** Form field values before zod applies `label`'s default — what `useForm` manages. */
export type CheckoutFormInput = z.input<typeof checkoutSchema>;
/** Parsed submission shape — what the resolver actually hands `onSubmit`. */
export type CheckoutForm = z.infer<typeof checkoutSchema>;
