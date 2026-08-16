import { z } from 'zod';

export const checkoutSchema = z.object({
  fullName: z.string().min(1),
  email: z.string().email(),
  address: z.string().min(1),
  city: z.string().min(1),
  phone: z.string().min(6),
});

export type CheckoutForm = z.infer<typeof checkoutSchema>;
