import { z } from 'zod';

/**
 * The weekly digest sign-up (#132).
 *
 * An address and nothing else. A subscription references no product and no account,
 * which is what lets `newsletter` point at a real mailing provider the day one is
 * chosen — ahead of every other resource, and with no entry in the dependency table.
 *
 * These messages are for the envelope and the server log, not for a shopper: the form
 * branches on `validation_failed` and shows its own dictionary copy, because a message
 * authored here exists in one language only.
 */
export const subscribeRequestSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Enter your email address')
    .email('That does not look like an email address'),
});

/**
 * What the route hands back: the address as it was accepted, trimmed.
 *
 * No message. The confirmation a shopper reads is dictionary copy, because it has to
 * exist in both locales — an English sentence travelling in the envelope would land
 * unchanged on the Vietnamese storefront (#64). The address is echoed so the form can
 * show what was actually subscribed rather than what was typed.
 *
 * Deliberately carries no "already subscribed": the mock has no list, so any such
 * answer would be invented. The upstream implementation can widen this when there is
 * a list behind it.
 */
export const subscriptionAckSchema = z.object({
  email: z.string(),
});

export type SubscribeRequest = z.infer<typeof subscribeRequestSchema>;
export type SubscriptionAck = z.infer<typeof subscriptionAckSchema>;
