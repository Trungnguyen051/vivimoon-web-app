import type { SubscribeRequest, SubscriptionAck } from '@/lib/api/schemas/newsletter';

export const mockNewsletter = {
  /**
   * Accepts a valid address and forgets it.
   *
   * There is no list, so this deliberately reports no "already subscribed": with
   * nothing to check against, any such answer would be invented, and a confirmation a
   * shopper can trust is worth more than a distinction we cannot actually make. The
   * upstream implementation is free to draw it when there is a list behind it.
   *
   * Nothing persists, which also means nothing here can leak an address.
   */
  async subscribe({ email }: SubscribeRequest): Promise<SubscriptionAck> {
    return { email };
  },
};

export type Newsletter = typeof mockNewsletter;
