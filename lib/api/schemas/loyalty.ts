import { z } from 'zod';

/** One balance movement (M3.6, issue #10) — currently earn-only, from a placed order. */
export const loyaltyEntrySchema = z.object({
  id: z.string(),
  points: z.number().int(),
  description: z.string(),
  orderId: z.string().optional(),
  createdAt: z.string(),
});

export const loyaltyBalanceSchema = z.object({
  balance: z.number().int(),
  // Most recent first.
  history: z.array(loyaltyEntrySchema),
});

export type LoyaltyEntry = z.infer<typeof loyaltyEntrySchema>;
export type LoyaltyBalance = z.infer<typeof loyaltyBalanceSchema>;
